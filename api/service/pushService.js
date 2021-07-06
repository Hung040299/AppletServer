"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
const dodai_1 = require("ER_Proto_Block_Server/lib/dodai");
const session = require("ER_Proto_Block_Server/lib/user-session/api");
const { group_id, root_key } = require("config").dodai;
const apn = require("apn");
const child_process_1 = require("child_process");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const fs = __importStar(require("fs"));
const googleapis_1 = require("googleapis");
const request_promise_1 = __importDefault(require("request-promise"));
const userConfig = require("config").User;
const logger = require("../service/logUtil").logger;
const IV_SIZE = 16;
const CRYPTO_KEY = "tvfp%%a7(C|xQe*TKMjp8!%,eF-p|T&!";
const ENCRYPT_METHOD = "aes-256-cbc";
const MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const SCOPES = [MESSAGING_SCOPE];
const TIME_TO_LIVE = 60 * 60 * 24;
var COLLECTIONS;
(function (COLLECTIONS) {
    COLLECTIONS["notificationToken"] = "notificationToken";
    COLLECTIONS["certificate"] = "certificate";
})(COLLECTIONS || (COLLECTIONS = {}));
var OSType;
(function (OSType) {
    OSType["android"] = "Android";
    OSType["ios"] = "iOS";
    OSType["none"] = "none";
})(OSType || (OSType = {}));
// tslint:disable: member-ordering
class PushService {
    static getApnProvider(vendorId) {
        return this.providersCache[vendorId];
    }
    static createAPNProvider(cert, pass, expire, topic, production) {
        const options = {
            pfx: cert,
            passphrase: pass,
            production
        };
        try {
            const provider = {
                provider: new apn.Provider(options),
                expire,
                topic
            };
            return provider;
        }
        catch (e) {
            logger.system.error(`invalid certificate: ${e.toString()}`);
        }
        return undefined;
    }
    static async createAPNProviderFromDodai(vendorId) {
        const resp = await this.downloadSpecificCert(vendorId);
        if (resp.status !== 200) {
            return undefined;
        }
        const certInfo = this.loadOneCert(resp.body.data);
        const { cert, pass, expire, topic, production } = certInfo;
        if (pass.length <= 0 || cert.length <= 0) {
            return undefined;
        }
        const provider = this.createAPNProvider(cert, pass, expire, topic, production);
        if (provider !== undefined) {
            this.providersCache[vendorId] = provider;
        }
        return provider;
    }
    static async updateProviderIfNeed(vendorId) {
        let provider = this.getApnProvider(vendorId) ||
            (await this.createAPNProviderFromDodai(vendorId));
        if (!provider) {
            return "cannot find certificate";
        }
        const now = this.getCurrentUnixTime();
        if (provider.expire < now) {
            // when certificate is expired, try to update certificate.
            provider = await this.deleteAndUpdateCert(vendorId, provider.expire);
        }
        if (!provider) {
            return "certificate is expired";
        }
        return undefined;
    }
    static async sendPush(req, res) {
        const dodaiKey = res.locals.security.key;
        const body = req.body;
        const vendorId = body.vendorId;
        // get deviceTokens
        const tokenRes = await this.getUserDeviceTokens(dodaiKey, vendorId);
        if (tokenRes.status !== 200) {
            return res.status(tokenRes.status).json(tokenRes.body);
        }
        const deviceTokens = tokenRes.body.map((document) => {
            return document.data.notificationToken;
        });
        if (deviceTokens.length <= 0) {
            return res.status(404).json({ error: "no device tokens are registered" });
        }
        const errmsg = await this.updateProviderIfNeed(vendorId);
        if (errmsg) {
            return res.status(400).json({ error: errmsg });
        }
        const result = await this.requestPushToAPNs(deviceTokens, body);
        if (!result || result.failed.length > 0) {
            const fail = (result === null || result === void 0 ? void 0 : result.failed.length) || 0;
            const sent = (result === null || result === void 0 ? void 0 : result.sent.length) || 0;
            return res.status(400).json({
                error: `cannot send push request to ${fail} / ${sent + fail} devices`
            });
        }
        return res.status(201).json({});
    }
    static execPromise(cmd) {
        return new Promise(resolve => {
            child_process_1.exec(cmd, (err, stdout, stderr) => {
                return resolve({
                    error: err,
                    stdout,
                    stderr
                });
            });
        });
    }
    static async getBuncleIdAndEndDate(cert, pass) {
        const suffix = this.getCurrentUnixMilTime();
        const filepath = `./tmp_${suffix}.txt`;
        try {
            fs.writeFileSync(filepath, cert);
            const endDate = await this.getEndDateFromPkcs12(filepath, pass);
            const uid = await this.getBundleId(filepath, pass);
            return {
                endDate,
                uid
            };
        }
        catch (e) {
            return {
                endDate: -1,
                uid: ""
            };
        }
        finally {
            fs.unlinkSync(filepath);
        }
    }
    static async getBundleId(certPath, pass) {
        const result = await this.execPromise(`openssl pkcs12 -in "${certPath}" -nodes  -passin pass:"${pass}" | openssl x509 -noout -subject`);
        if (result.error) {
            return "";
        }
        const subject = result.stdout.split("/");
        const uidInfo = subject.find(str => {
            return str.indexOf("UID=") === 0;
        });
        if (uidInfo === undefined) {
            return "";
        }
        const uidVal = uidInfo.replace(/^.*=/g, "").replace(/\n/g, "");
        return uidVal;
    }
    static async getEndDateFromPkcs12(filepath, pass) {
        const result = await this.execPromise(`openssl pkcs12 -in "${filepath}" -nodes  -passin pass:"${pass}" | openssl x509 -noout -enddate`);
        if (result.error) {
            return -1;
        }
        const endDate = result.stdout.replace(/^.*=/g, "").replace(/\n/g, "");
        const unixMilSec = new Date(endDate).getTime();
        const now = this.getCurrentUnixMilTime();
        if (now >= unixMilSec) {
            return -1;
        }
        return unixMilSec / 1000;
    }
    static async registerNotificationToken(req, res) {
        const userId = req.res.locals.security.userId;
        const body = req.body;
        const { notificationToken, appId } = body;
        const documentId = this.createDocumentId(userId, notificationToken, appId);
        try {
            const postRes = await dodai_1.post(`/${group_id}/data/${COLLECTIONS.notificationToken}`, { _id: documentId, data: body }, res.locals.security.key);
            if (postRes.status === 201 || postRes.status === 409) {
                postRes.status = 201;
                postRes.body = {};
            }
            res.status(postRes.status).json(postRes.body);
        }
        catch (e) {
            res.status(500).json({ error: e.toString() });
        }
    }
    static async sendLinkPush(req, res) {
        const { key: dodaiKey, userId } = res.locals.security.key;
        try {
            const { userPreferenceId, nextBlockId } = req.body;
            const getReq = {
                headers: {
                    Authorization: req.headers.authorization
                },
                method: "GET"
            };
            // FIXME: re-handle when updated api
            const response = await request_promise_1.default(`${userConfig.host}/api/preference/target/${userPreferenceId}/${nextBlockId}`, getReq);
            const resp = JSON.parse(response);
            if (!resp.data.users) {
                res.status(400).json({});
            }
            const appIds = resp.data.users.map((user) => user.app_id);
            const listNotificationTokenRes = await this.getListUserDeviceToken(dodaiKey, appIds);
            if (listNotificationTokenRes.status !== 200) {
                return res
                    .status(listNotificationTokenRes.status)
                    .json(listNotificationTokenRes.body);
            }
            const deviceTokens = listNotificationTokenRes.body.map((document) => {
                return document.data;
            });
            const listPrivateKeyRes = await this.getListPrivateKey(dodaiKey, appIds);
            if (listPrivateKeyRes.status !== 200) {
                return res
                    .status(listPrivateKeyRes.status)
                    .json(listPrivateKeyRes.body);
            }
            const listPrivateKeyDecode = listPrivateKeyRes.body.map((data) => (Object.assign(Object.assign({}, data), { firebasePrivateKey: this.decodeFCMPrivateKey(data.firebasePrivateKey) })));
            Promise.all(listPrivateKeyDecode.map(async (privateKey) => {
                const deviceToken = deviceTokens.filter((token) => token.app_id === privateKey.app_id);
                if (!deviceToken) {
                    return;
                }
                const sendDeviceTokens = deviceToken.map((token) => token.notificationToken);
                const { appletId, nextInput } = req.body;
                const payload = {
                    notification: {
                        content_available: true
                    },
                    data: {
                        notification_id: "link",
                        applet_id: appletId,
                        user_id: userId,
                        next_block_id: nextBlockId,
                        next_input: nextInput
                    }
                };
                const isSent = await this.sendMessage(sendDeviceTokens, privateKey.firebasePrivateKey, payload, privateKey.app_id);
                return isSent;
            })).then(() => {
                res.status(201).json({});
            });
        }
        catch (e) {
            res.status(400).json({});
        }
    }
    static async sendMessage(notificationToken, privateKey, payload, appId, options = {
        priority: "high",
        timeToLive: TIME_TO_LIVE
    }) {
        const firebaseApp = firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(privateKey)
        }, appId);
        try {
            const sent = await firebaseApp
                .messaging()
                .sendToDevice(notificationToken, payload, options);
            await firebaseApp.delete();
            if (sent && !!sent.failureCount) {
                return false;
            }
            return true;
        }
        catch (e) {
            return false;
        }
    }
    static async postPrivateKey(req, res) {
        const key = res.locals.security.key;
        if (!key) {
            return res.status(400).json({});
        }
        const body = req.body;
        try {
            const token = await this.getFCMAccessToken(body.firebasePrivateKey);
            if (!token) {
                return res.status(400).json({ error: "invalid private key" });
            }
        }
        catch (e) {
            return res.status(400).json({ error: "invalid private key" });
        }
        try {
            const privateKeyEncode = this.encodeCrypto(JSON.stringify(body.firebasePrivateKey));
            // FIXME: wait create db for private_key
            const postPrivateKeyRes = await dodai_1.post(`/${group_id}/data/${COLLECTIONS.certificate}`, { data: Object.assign(Object.assign({}, body), { firebasePrivateKey: privateKeyEncode }) }, key);
            if (postPrivateKeyRes.status === 201 ||
                postPrivateKeyRes.status === 409) {
                postPrivateKeyRes.status = 201;
                postPrivateKeyRes.body = {};
            }
            res.status(postPrivateKeyRes.status).json(postPrivateKeyRes.body);
        }
        catch (e) {
            res.status(500).json({ error: e.toString() });
        }
        return res.status(201).json({});
    }
    static async sendAcceptancePush(req, res) {
        const authorization = res.locals.security.key;
        const { appId, type } = req.body;
        const notificationRes = await this.getUserDeviceTokens(authorization, appId);
        if (notificationRes.status !== 200 ||
            !notificationRes.body[0] ||
            !notificationRes.body[0].data.notificationToken) {
            return res.status(notificationRes.status).json(notificationRes.body);
        }
        const { notificationToken } = notificationRes.body[0].data;
        const privateKeyRes = await this.getPrivateKey(authorization, appId);
        if (privateKeyRes.status !== 200) {
            return res.status(privateKeyRes.status).json(privateKeyRes.body);
        }
        const firebasePrivateKey = privateKeyRes.body[0].data.firebasePrivateKey;
        try {
            const firebasePrivateKeyDecode = JSON.parse(this.decodeCryptoAsString(firebasePrivateKey));
            const token = await this.getFCMAccessToken(firebasePrivateKeyDecode);
            if (!token) {
                return res.status(400).json({});
            }
            const { user_preference_id, appletId, message } = req.body;
            const appletResponse = await this.getApplet(appletId, authorization);
            if (!appletResponse) {
                return res.status(404).json({});
            }
            const appletName = appletResponse ? appletResponse.body.title : "";
            const result = await session.checkSession(req);
            const Username = result._user.Username;
            let payload = {
                notification: {
                    content_available: true
                },
                data: {
                    notification_id: "",
                    user_preference_id,
                    applet_id: appletId,
                    applet_name: appletName,
                    user_name: Username
                }
            };
            switch (type) {
                case "link":
                    payload.data.notification_id = "acceptance_link";
                    payload.data.message = message;
                    break;
                case "unlink":
                    payload.data.notification_id = "acceptance_unlink";
                    break;
                default:
                    break;
            }
            const isSent = await this.sendMessage(notificationToken, firebasePrivateKeyDecode, payload, appId);
            if (isSent) {
                return res.status(201).json({});
            }
            return res.status(400).json({});
        }
        catch (e) {
            return res.status(400).json({});
        }
    }
    static async postCert(req, res) {
        try {
            const cert = req.swagger.params.cert.value.buffer;
            const pass = req.swagger.params.pass.value;
            const production = req.swagger.params.production.value;
            const key = req.headers.authorization;
            if (cert.length <= 0 || pass.length <= 0) {
                return res.status(400).json({});
            }
            const info = await this.getBuncleIdAndEndDate(cert, pass);
            if (info.endDate < 0) {
                return res
                    .status(400)
                    .json({ error: "cert or pass is invalid or expired." });
            }
            if (info.uid.length <= 0) {
                return res.status(400).json({ error: "cannot read cert UID" });
            }
            const provider = this.createAPNProvider(cert, pass, info.endDate, info.uid, production);
            if (provider === undefined) {
                return res.status(400).json({ error: "invalid certificate" });
            }
            const vendorId = req.swagger.params.vendorId.value;
            const base64Cert = PushService.encodeCrypto(cert);
            const encPass = this.encodeCrypto(pass);
            const uploadRes = await this.uploadCert(vendorId, base64Cert, encPass, production, info.endDate, info.uid, key);
            if (200 <= uploadRes.status && uploadRes.status < 300) {
                this.providersCache[vendorId] = provider;
            }
            return res.status(uploadRes.status).json(uploadRes.body);
        }
        catch (e) {
            res.status(500).json({ error: e.toString() });
        }
    }
    static async loadAllCerts(retry) {
        const resp = await this.donwloadAllCerts();
        if (resp.status !== 200) {
            if (retry > 0) {
                setTimeout(() => {
                    this.loadAllCerts(retry - 1);
                }, 10000);
                return;
            }
        }
        const certInfos = []
            .map((certData) => {
            return this.loadOneCert(certData.data);
        })
            .filter((certInfo) => {
            return certInfo.cert.length > 0 && certInfo.pass.length > 0;
        });
        for (const certInfo of certInfos) {
            const { cert, pass, vendorId, expire, production, topic } = certInfo;
            const provider = this.createAPNProvider(cert, pass, expire, topic, production);
            if (provider !== undefined) {
                this.providersCache[vendorId] = provider;
            }
        }
    }
    static loadOneCert(data) {
        const info = {
            vendorId: data.vendorId,
            pass: this.decodeCryptoAsString(data.pass),
            cert: this.decodeCrypto(data.cert),
            expire: data.expire,
            topic: data.topic,
            production: data.production
        };
        return info;
    }
    static async uploadCert(vendorId, base64Cert, encPass, production, expire, topic, key) {
        const body = {
            vendorId,
            pass: encPass,
            cert: base64Cert,
            production,
            expire,
            topic
        };
        const response = await dodai_1.put(`/${group_id}/data/${COLLECTIONS.certificate}/${vendorId}`, { data: body, upsert: true }, key);
        if (200 <= response.status && response.status < 300) {
            response.status = 201;
            response.body = {};
        }
        return response;
    }
    static async deleteAndUpdateCert(vendorId, expired) {
        delete this.providersCache[vendorId];
        await this.deleteExpiredCert(vendorId);
        const provider = await this.createAPNProviderFromDodai(vendorId);
        if (provider) {
            this.providersCache[vendorId] = provider;
        }
        return provider;
    }
    static async deleteCert(vendorId, expired) {
        const query = expired === undefined
            ? { query: JSON.stringify({ "data.expired": expired }) }
            : {};
        return await dodai_1.delete_(`/${group_id}/data/${COLLECTIONS.certificate}/${vendorId}`, query, root_key);
    }
    static async deleteExpiredCert(vendorId) {
        const nowUnixTime = this.getCurrentUnixTime();
        const query = {
            query: JSON.stringify({
                _id: vendorId,
                "data.expire": { $lte: nowUnixTime }
            })
        };
        return await dodai_1.delete_(`/${group_id}/data/${COLLECTIONS.certificate}`, query, root_key);
    }
    static getCurrentUnixTime() {
        const nowMSec = this.getCurrentUnixMilTime();
        const nowSec = Math.floor(nowMSec / 1000);
        return nowSec;
    }
    static getCurrentUnixMilTime() {
        const nowMSec = new Date().getTime();
        return nowMSec;
    }
    static async downloadSpecificCert(vendorId) {
        return await dodai_1.get(`/${group_id}/data/${COLLECTIONS.certificate}/${vendorId}`, {}, root_key);
    }
    static async donwloadAllCerts() {
        return await dodai_1.get(`/${group_id}/data/${COLLECTIONS.certificate}`, {}, root_key);
    }
    static generateIV() {
        const iv = crypto.randomBytes(IV_SIZE);
        return iv;
    }
    static encodeCrypto(data) {
        const iv = this.generateIV();
        const cipher = crypto.createCipheriv(ENCRYPT_METHOD, CRYPTO_KEY, iv);
        let encBuf = cipher.update(data);
        encBuf = Buffer.concat([encBuf, cipher.final(), iv]);
        const base64EncData = encBuf.toString("base64");
        return base64EncData;
    }
    static decodeCrypto(data) {
        let decBuf = Buffer.from("");
        try {
            const encBuf = Buffer.from(data, "base64");
            const len = encBuf.length;
            const iv = encBuf.slice(len - IV_SIZE);
            const encBody = encBuf.slice(0, len - IV_SIZE);
            const decipher = crypto.createDecipheriv(ENCRYPT_METHOD, CRYPTO_KEY, iv);
            decBuf = decipher.update(encBody);
            decBuf = Buffer.concat([decBuf, decipher.final()]);
        }
        catch (e) {
            // nothing to do
        }
        return decBuf;
    }
    static decodeCryptoAsString(data) {
        return this.decodeCrypto(data).toString("utf-8");
    }
    static createDocumentId(userId, notificationToken, appId) {
        const documentId = `${appId}${userId}${notificationToken}`;
        return documentId;
    }
    static async getListUserDeviceToken(key, appIds) {
        const resp = await dodai_1.get(`/${group_id}/data/${COLLECTIONS.notificationToken}`, {
            query: JSON.stringify({
                "data.appId": { $in: appIds }
            })
        }, key);
        return resp;
    }
    static async getListPrivateKey(key, appIds) {
        const resp = await dodai_1.get(
        // FIXME: update collection when private_key collection is created
        `/${group_id}/data/${COLLECTIONS.certificate}`, {
            query: JSON.stringify({
                "data.appId": { $in: appIds }
            })
        }, key);
        return resp;
    }
    static decodeFCMPrivateKey(firebasePrivateKey) {
        try {
            const firebasePrivateKeyDecode = JSON.parse(this.decodeCryptoAsString(firebasePrivateKey));
            return firebasePrivateKeyDecode;
        }
        catch (e) {
            return null;
        }
    }
    static async getFCMAccessToken(privateKey) {
        const jwtClient = new googleapis_1.google.auth.JWT(privateKey.client_email, undefined, privateKey.private_key, SCOPES, undefined);
        const tokens = await jwtClient.authorize();
        return tokens;
    }
    static async getUserDeviceTokens(key, appId) {
        const resp = await dodai_1.get(`/${group_id}/data/${COLLECTIONS.notificationToken}`, {
            query: JSON.stringify({
                _id: { $regex: `^${appId}` },
                "data.appId": appId
            })
        }, key);
        return resp;
    }
    static async getPrivateKey(key, appId) {
        const resp = await dodai_1.get(
        // FIXME: update collection when private_key collection is created
        `/${group_id}/data/${COLLECTIONS.certificate}`, {
            query: JSON.stringify({
                "data.appId": appId
            })
        }, key);
        return resp;
    }
    static async getApplet(appletId, key) {
        const response = await dodai_1.get(`/${group_id}/data/applet/${appletId}`, {}, key);
        if (response.status === 200) {
            return response;
        }
        return null;
    }
    static async deleteNotificationTokens(notificationToken) {
        return await dodai_1.delete_(`/${group_id}/data/${COLLECTIONS.notificationToken}`, {
            "data.notificationToken": notificationToken
        }, root_key);
    }
    static async requestPushToAPNs(deviceTokens, body) {
        const apnProvider = this.getApnProvider(body.vendorId);
        if (!apnProvider) {
            return Promise.resolve(null);
        }
        const note = new apn.Notification();
        if (body.alert) {
            note.alert = body.alert;
        }
        if (body.badge) {
            note.badge = body.badge;
        }
        if (body.contentAvailable) {
            note.contentAvailable = body.contentAvailable;
        }
        if (body.data) {
            note.payload = { data: body.data };
        }
        if (body.expiresAt) {
            note.expiry = body.expiresAt;
        }
        if (body.priority) {
            note.priority = body.priority;
        }
        if (body.sound) {
            note.sound = body.sound;
        }
        note.topic = apnProvider.topic;
        note.pushType = (body === null || body === void 0 ? void 0 : body.contentAvailable) ? `background` : `alert`;
        return apnProvider.provider.send(note, deviceTokens);
    }
}
exports.PushService = PushService;
PushService.providersCache = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVzaFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwdXNoU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwrQ0FBaUM7QUFDakMsMkRBQTBFO0FBQzFFLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0FBQ3RFLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN2RCwyQkFBNEI7QUFDNUIsaURBQW9EO0FBQ3BELG9FQUFtQztBQUNuQyx1Q0FBeUI7QUFDekIsMkNBQW9DO0FBQ3BDLHNFQUFpQztBQUNqQyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDO0FBRTFDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUVwRCxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbkIsTUFBTSxVQUFVLEdBQUcsa0NBQWtDLENBQUM7QUFDdEQsTUFBTSxjQUFjLEdBQUcsYUFBYSxDQUFDO0FBRXJDLE1BQU0sZUFBZSxHQUFHLG9EQUFvRCxDQUFDO0FBQzdFLE1BQU0sTUFBTSxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDakMsTUFBTSxZQUFZLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFFbEMsSUFBSyxXQUdKO0FBSEQsV0FBSyxXQUFXO0lBQ2Qsc0RBQXVDLENBQUE7SUFDdkMsMENBQTJCLENBQUE7QUFDN0IsQ0FBQyxFQUhJLFdBQVcsS0FBWCxXQUFXLFFBR2Y7QUFxQ0QsSUFBSyxNQUlKO0FBSkQsV0FBSyxNQUFNO0lBQ1QsNkJBQW1CLENBQUE7SUFDbkIscUJBQVcsQ0FBQTtJQUNYLHVCQUFhLENBQUE7QUFDZixDQUFDLEVBSkksTUFBTSxLQUFOLE1BQU0sUUFJVjtBQXdF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