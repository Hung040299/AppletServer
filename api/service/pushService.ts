import * as crypto from "crypto";
import { delete_, get, post, put } from "ER_Proto_Block_Server/lib/dodai";
const session = require("ER_Proto_Block_Server/lib/user-session/api");
const { group_id, root_key } = require("config").dodai;
import apn = require("apn");
import { exec, ExecException } from "child_process";
import admin from "firebase-admin";
import * as fs from "fs";
import { google } from "googleapis";
import rp from "request-promise";
const userConfig = require("config").User;

const logger = require("../service/logUtil").logger;

const IV_SIZE = 16;
const CRYPTO_KEY = "tvfp%%a7(C|xQe*TKMjp8!%,eF-p|T&!";
const ENCRYPT_METHOD = "aes-256-cbc";

const MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const SCOPES = [MESSAGING_SCOPE];
const TIME_TO_LIVE = 60 * 60 * 24;

enum COLLECTIONS {
  notificationToken = "notificationToken",
  certificate = "certificate"
}

interface IPushReqBody {
  vendorId: string;
  appletId: string;
  alert?: string;
  badge?: number;
  sound?: string;
  contentAvailable?: boolean;
  expiresAt?: number;
  priority?: 5 | 10;
  data?: string;
}

interface ICertReqBody {
  vendorId: string;
  pass: string;
  cert: string;
  production: boolean;
  expire: number;
  topic: string;
}

interface ICertInfo {
  vendorId: string;
  pass: string;
  cert: Buffer;
  expire: number;
  topic: string;
  production: boolean;
}

interface ITopicAndEndDate {
  endDate: number;
  uid: string;
}

enum OSType {
  android = "Android",
  ios = "iOS",
  none = "none"
}

interface IRegisterReqBody {
  notificationToken: string;
  appId: string;
  osType: OSType;
}

interface IPushAcceptanceReqBody {
  appId: string;
  appletId: string;
  message: string;
  type: string;
  user_preference_id: string;
  userId: string;
}

interface IProvider {
  provider: apn.Provider;
  expire: number;
  topic: string;
}

interface IFCMNotification {
  content_available: boolean;
}

interface IFCMData {
  notification_id: string;
  user_preference_id: string;
  applet_id: string;
  applet_name: string;
  user_name: string;
  message?: string;
}

interface IFCMPayload {
  notification: IFCMNotification;
  data: IFCMData;
}

interface IProviderMap {
  [key: string]: IProvider;
}

interface IExecResult {
  error: ExecException | null;
  stdout: string;
  stderr: string;
}

interface IPrivateKey {
  client_email: string;
  private_key: string;
}

interface IRegisterPrivateKeyReqBody {
  appId: string;
  vendorId: string;
  firebaseProjectId: string;
  firebasePrivateKey: IPrivateKey;
}

interface ISendLinkPushReqBody {
  appletId: string;
  userPreferenceId: string;
  nextBlockId: string;
  nextInput: object;
}

type ErrMsg = string;

// tslint:disable: member-ordering
export class PushService {
  private static providersCache: IProviderMap = {};

  private static getApnProvider(vendorId: string): IProvider | undefined {
    return this.providersCache[vendorId];
  }

  private static createAPNProvider(
    cert: Buffer,
    pass: string,
    expire: number,
    topic: string,
    production: boolean
  ): IProvider | undefined {
    const options: apn.ProviderOptions = {
      pfx: cert,
      passphrase: pass,
      production
    };
    try {
      const provider: IProvider = {
        provider: new apn.Provider(options),
        expire,
        topic
      };
      return provider;
    } catch (e) {
      logger.system.error(`invalid certificate: ${e.toString()}`);
    }
    return undefined;
  }

  private static async createAPNProviderFromDodai(
    vendorId: string
  ): Promise<IProvider | undefined> {
    const resp = await this.downloadSpecificCert(vendorId);
    if (resp.status !== 200) {
      return undefined;
    }
    const certInfo = this.loadOneCert(resp.body.data);
    const { cert, pass, expire, topic, production } = certInfo;
    if (pass.length <= 0 || cert.length <= 0) {
      return undefined;
    }
    const provider = this.createAPNProvider(
      cert,
      pass,
      expire,
      topic,
      production
    );
    if (provider !== undefined) {
      this.providersCache[vendorId] = provider;
    }
    return provider;
  }

  private static async updateProviderIfNeed(
    vendorId: string
  ): Promise<ErrMsg | undefined> {
    let provider =
      this.getApnProvider(vendorId) ||
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

  public static async sendPush(req: any, res: any) {
    const dodaiKey = res.locals.security.key;
    const body: IPushReqBody = req.body;
    const vendorId = body.vendorId;

    // get deviceTokens
    const tokenRes = await this.getUserDeviceTokens(dodaiKey, vendorId);
    if (tokenRes.status !== 200) {
      return res.status(tokenRes.status).json(tokenRes.body);
    }
    const deviceTokens: string[] = tokenRes.body.map((document: any) => {
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
      const fail = result?.failed.length || 0;
      const sent = result?.sent.length || 0;
      return res.status(400).json({
        error: `cannot send push request to ${fail} / ${sent + fail} devices`
      });
    }
    return res.status(201).json({});
  }

  private static execPromise(cmd: string): Promise<IExecResult> {
    return new Promise(resolve => {
      exec(cmd, (err, stdout, stderr) => {
        return resolve({
          error: err,
          stdout,
          stderr
        });
      });
    });
  }

  public static async getBuncleIdAndEndDate(
    cert: Buffer,
    pass: string
  ): Promise<ITopicAndEndDate> {
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
    } catch (e) {
      return {
        endDate: -1,
        uid: ""
      };
    } finally {
      fs.unlinkSync(filepath);
    }
  }

  public static async getBundleId(
    certPath: string,
    pass: string
  ): Promise<string> {
    const result = await this.execPromise(
      `openssl pkcs12 -in "${certPath}" -nodes  -passin pass:"${pass}" | openssl x509 -noout -subject`
    );
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

  public static async getEndDateFromPkcs12(
    filepath: string,
    pass: string
  ): Promise<number> {
    const result = await this.execPromise(
      `openssl pkcs12 -in "${filepath}" -nodes  -passin pass:"${pass}" | openssl x509 -noout -enddate`
    );
    if (result.error) {
      return -1;
    }
    const endDate = result.stdout.replace(/^.*=/g, "").replace(/\n/g, "");
    const unixMilSec = new Date(endDate).getTime();
    const now = this.getCurrentUnixMilTime();
    if (now >= unixMilSec) {
      return -1;
    }
    return unixMilSec / 1_000;
  }

  public static async registerNotificationToken(req: any, res: any) {
    const userId = req.res.locals.security.userId;
    const body: IRegisterReqBody = req.body;
    const { notificationToken, appId } = body;
    const documentId = this.createDocumentId(userId, notificationToken, appId);

    try {
      const postRes = await post(
        `/${group_id}/data/${COLLECTIONS.notificationToken}`,
        { _id: documentId, data: body },
        res.locals.security.key
      );
      if (postRes.status === 201 || postRes.status === 409) {
        postRes.status = 201;
        postRes.body = {};
      }
      res.status(postRes.status).json(postRes.body);
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  }

  public static async sendLinkPush(req: any, res: any) {
    const { key: dodaiKey, userId } = res.locals.security.key;

    try {
      const { userPreferenceId, nextBlockId }: ISendLinkPushReqBody = req.body;
      const getReq = {
        headers: {
          Authorization: req.headers.authorization
        },
        method: "GET"
      };

      // FIXME: re-handle when updated api
      const response = await rp(
        `${userConfig.host}/api/preference/target/${userPreferenceId}/${nextBlockId}`,
        getReq
      );
      const resp = JSON.parse(response);
      if (!resp.data.users) {
        res.status(400).json({});
      }

      const appIds = resp.data.users.map((user: any) => user.app_id);

      const listNotificationTokenRes = await this.getListUserDeviceToken(
        dodaiKey,
        appIds
      );

      if (listNotificationTokenRes.status !== 200) {
        return res
          .status(listNotificationTokenRes.status)
          .json(listNotificationTokenRes.body);
      }

      const deviceTokens: string[] = listNotificationTokenRes.body.map(
        (document: any) => {
          return document.data;
        }
      );

      const listPrivateKeyRes = await this.getListPrivateKey(dodaiKey, appIds);
      if (listPrivateKeyRes.status !== 200) {
        return res
          .status(listPrivateKeyRes.status)
          .json(listPrivateKeyRes.body);
      }

      const listPrivateKeyDecode = listPrivateKeyRes.body.map((data: any) => ({
        ...data,
        firebasePrivateKey: this.decodeFCMPrivateKey(data.firebasePrivateKey)
      }));

      Promise.all(
        listPrivateKeyDecode.map(async (privateKey: any) => {
          const deviceToken: any = deviceTokens.filter(
            (token: any) => token.app_id === privateKey.app_id
          );

          if (!deviceToken) {
            return;
          }

          const sendDeviceTokens = deviceToken.map(
            (token: any) => token.notificationToken
          );

          const { appletId, nextInput }: ISendLinkPushReqBody = req.body;

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

          const isSent = await this.sendMessage(
            sendDeviceTokens,
            privateKey.firebasePrivateKey,
            payload,
            privateKey.app_id
          );

          return isSent;
        })
      ).then(() => {
        res.status(201).json({});
      });
    } catch (e) {
      res.status(400).json({});
    }
  }

  private static async sendMessage(
    notificationToken: string | [],
    privateKey: any,
    payload: any,
    appId: string,
    options = {
      priority: "high",
      timeToLive: TIME_TO_LIVE
    }
  ) {
    const firebaseApp = admin.initializeApp(
      {
        credential: admin.credential.cert(privateKey)
      },
      appId
    );

    try {
      const sent = await firebaseApp
        .messaging()
        .sendToDevice(notificationToken, payload, options);

      await firebaseApp.delete();

      if (sent && !!sent.failureCount) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  public static async postPrivateKey(req: any, res: any) {
    const key = res.locals.security.key;
    if (!key) {
      return res.status(400).json({});
    }

    const body: IRegisterPrivateKeyReqBody = req.body;

    try {
      const token = await this.getFCMAccessToken(body.firebasePrivateKey);
      if (!token) {
        return res.status(400).json({ error: "invalid private key" });
      }
    } catch (e) {
      return res.status(400).json({ error: "invalid private key" });
    }

    try {
      const privateKeyEncode = this.encodeCrypto(
        JSON.stringify(body.firebasePrivateKey)
      );

      // FIXME: wait create db for private_key
      const postPrivateKeyRes = await post(
        `/${group_id}/data/${COLLECTIONS.certificate}`,
        { data: { ...body, firebasePrivateKey: privateKeyEncode } },
        key
      );

      if (
        postPrivateKeyRes.status === 201 ||
        postPrivateKeyRes.status === 409
      ) {
        postPrivateKeyRes.status = 201;
        postPrivateKeyRes.body = {};
      }

      res.status(postPrivateKeyRes.status).json(postPrivateKeyRes.body);
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
    return res.status(201).json({});
  }

  public static async sendAcceptancePush(req: any, res: any) {
    const authorization = res.locals.security.key;
    const { appId, type }: IPushAcceptanceReqBody = req.body;

    const notificationRes = await this.getUserDeviceTokens(
      authorization,
      appId
    );
    if (
      notificationRes.status !== 200 ||
      !notificationRes.body[0] ||
      !notificationRes.body[0].data.notificationToken
    ) {
      return res.status(notificationRes.status).json(notificationRes.body);
    }

    const { notificationToken } = notificationRes.body[0].data;

    const privateKeyRes = await this.getPrivateKey(authorization, appId);
    if (privateKeyRes.status !== 200) {
      return res.status(privateKeyRes.status).json(privateKeyRes.body);
    }

    const firebasePrivateKey = privateKeyRes.body[0].data.firebasePrivateKey;
    try {
      const firebasePrivateKeyDecode = JSON.parse(
        this.decodeCryptoAsString(firebasePrivateKey)
      );

      const token = await this.getFCMAccessToken(firebasePrivateKeyDecode);
      if (!token) {
        return res.status(400).json({});
      }

      const {
        user_preference_id,
        appletId,
        message
      }: IPushAcceptanceReqBody = req.body;

      const appletResponse: DodaiResponseType | null = await this.getApplet(
        appletId,
        authorization
      );

      if (!appletResponse) {
        return res.status(404).json({});
      }
      const appletName = appletResponse ? appletResponse.body.title : "";

      const result = await session.checkSession(req);
      const Username: string = result._user.Username;

      let payload: IFCMPayload = {
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

      const isSent = await this.sendMessage(
        notificationToken,
        firebasePrivateKeyDecode,
        payload,
        appId
      );

      if (isSent) {
        return res.status(201).json({});
      }

      return res.status(400).json({});
    } catch (e) {
      return res.status(400).json({});
    }
  }

  public static async postCert(req: any, res: any) {
    try {
      const cert = req.swagger.params.cert.value.buffer as Buffer;
      const pass = req.swagger.params.pass.value as string;
      const production = req.swagger.params.production.value as boolean;
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

      const provider = this.createAPNProvider(
        cert,
        pass,
        info.endDate,
        info.uid,
        production
      );
      if (provider === undefined) {
        return res.status(400).json({ error: "invalid certificate" });
      }

      const vendorId = req.swagger.params.vendorId.value;
      const base64Cert = PushService.encodeCrypto(cert);
      const encPass = this.encodeCrypto(pass);

      const uploadRes = await this.uploadCert(
        vendorId,
        base64Cert,
        encPass,
        production,
        info.endDate,
        info.uid,
        key
      );
      if (200 <= uploadRes.status && uploadRes.status < 300) {
        this.providersCache[vendorId] = provider;
      }
      return res.status(uploadRes.status).json(uploadRes.body);
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  }

  public static async loadAllCerts(retry: number) {
    const resp: DodaiResponseType = await this.donwloadAllCerts();
    if (resp.status !== 200) {
      if (retry > 0) {
        setTimeout(() => {
          this.loadAllCerts(retry - 1);
        }, 10_000);
        return;
      }
    }
    const certInfos: ICertInfo[] = []
      .map((certData: any) => {
        return this.loadOneCert(certData.data);
      })
      .filter((certInfo: ICertInfo) => {
        return certInfo.cert.length > 0 && certInfo.pass.length > 0;
      });

    for (const certInfo of certInfos) {
      const { cert, pass, vendorId, expire, production, topic } = certInfo;
      const provider = this.createAPNProvider(
        cert,
        pass,
        expire,
        topic,
        production
      );
      if (provider !== undefined) {
        this.providersCache[vendorId] = provider;
      }
    }
  }

  private static loadOneCert(data: ICertReqBody): ICertInfo {
    const info: ICertInfo = {
      vendorId: data.vendorId,
      pass: this.decodeCryptoAsString(data.pass),
      cert: this.decodeCrypto(data.cert),
      expire: data.expire,
      topic: data.topic,
      production: data.production
    };
    return info;
  }

  private static async uploadCert(
    vendorId: string,
    base64Cert: string,
    encPass: string,
    production: boolean,
    expire: number,
    topic: string,
    key: string
  ): Promise<DodaiResponseType> {
    const body: ICertReqBody = {
      vendorId,
      pass: encPass,
      cert: base64Cert,
      production,
      expire,
      topic
    };
    const response: DodaiResponseType = await put(
      `/${group_id}/data/${COLLECTIONS.certificate}/${vendorId}`,
      { data: body, upsert: true },
      key
    );
    if (200 <= response.status && response.status < 300) {
      response.status = 201;
      response.body = {};
    }
    return response;
  }

  private static async deleteAndUpdateCert(
    vendorId: string,
    expired: number
  ): Promise<IProvider | undefined> {
    delete this.providersCache[vendorId];
    await this.deleteExpiredCert(vendorId);
    const provider = await this.createAPNProviderFromDodai(vendorId);
    if (provider) {
      this.providersCache[vendorId] = provider;
    }
    return provider;
  }

  private static async deleteCert(vendorId: string, expired?: number) {
    const query =
      expired === undefined
        ? { query: JSON.stringify({ "data.expired": expired }) }
        : {};
    return await delete_(
      `/${group_id}/data/${COLLECTIONS.certificate}/${vendorId}`,
      query,
      root_key
    );
  }

  private static async deleteExpiredCert(vendorId: string) {
    const nowUnixTime = this.getCurrentUnixTime();
    const query = {
      query: JSON.stringify({
        _id: vendorId,
        "data.expire": { $lte: nowUnixTime }
      })
    };
    return await delete_(
      `/${group_id}/data/${COLLECTIONS.certificate}`,
      query,
      root_key
    );
  }

  private static getCurrentUnixTime(): number {
    const nowMSec = this.getCurrentUnixMilTime();
    const nowSec = Math.floor(nowMSec / 1_000);
    return nowSec;
  }

  private static getCurrentUnixMilTime(): number {
    const nowMSec = new Date().getTime();
    return nowMSec;
  }

  private static async downloadSpecificCert(
    vendorId: string
  ): Promise<DodaiResponseType> {
    return await get(
      `/${group_id}/data/${COLLECTIONS.certificate}/${vendorId}`,
      {},
      root_key
    );
  }

  private static async donwloadAllCerts() {
    return await get(
      `/${group_id}/data/${COLLECTIONS.certificate}`,
      {},
      root_key
    );
  }

  private static generateIV(): Buffer {
    const iv = crypto.randomBytes(IV_SIZE);
    return iv;
  }

  private static encodeCrypto(data: string | Buffer): string {
    const iv = this.generateIV();
    const cipher = crypto.createCipheriv(ENCRYPT_METHOD, CRYPTO_KEY, iv);
    let encBuf = cipher.update(data);
    encBuf = Buffer.concat([encBuf, cipher.final(), iv]);
    const base64EncData = encBuf.toString("base64");
    return base64EncData;
  }

  private static decodeCrypto(data: string): Buffer {
    let decBuf = Buffer.from("");
    try {
      const encBuf = Buffer.from(data, "base64");
      const len = encBuf.length;
      const iv = encBuf.slice(len - IV_SIZE);
      const encBody = encBuf.slice(0, len - IV_SIZE);
      const decipher = crypto.createDecipheriv(ENCRYPT_METHOD, CRYPTO_KEY, iv);
      decBuf = decipher.update(encBody);
      decBuf = Buffer.concat([decBuf, decipher.final()]);
    } catch (e) {
      // nothing to do
    }
    return decBuf;
  }

  private static decodeCryptoAsString(data: string): string {
    return this.decodeCrypto(data).toString("utf-8");
  }

  private static createDocumentId(
    userId: string,
    notificationToken: string,
    appId: string
  ): string {
    const documentId = `${appId}${userId}${notificationToken}`;
    return documentId;
  }

  private static async getListUserDeviceToken(key: string, appIds: []) {
    const resp = await get(
      `/${group_id}/data/${COLLECTIONS.notificationToken}`,
      {
        query: JSON.stringify({
          "data.appId": { $in: appIds }
        })
      },
      key
    );
    return resp;
  }

  private static async getListPrivateKey(key: string, appIds: []) {
    const resp = await get(
      // FIXME: update collection when private_key collection is created
      `/${group_id}/data/${COLLECTIONS.certificate}`,
      {
        query: JSON.stringify({
          "data.appId": { $in: appIds }
        })
      },
      key
    );
    return resp;
  }

  private static decodeFCMPrivateKey(firebasePrivateKey: string) {
    try {
      const firebasePrivateKeyDecode = JSON.parse(
        this.decodeCryptoAsString(firebasePrivateKey)
      );
      return firebasePrivateKeyDecode;
    } catch (e) {
      return null;
    }
  }

  private static async getFCMAccessToken(privateKey: IPrivateKey) {
    const jwtClient = new google.auth.JWT(
      privateKey.client_email,
      undefined,
      privateKey.private_key,
      SCOPES,
      undefined
    );
    const tokens = await jwtClient.authorize();
    return tokens;
  }

  private static async getUserDeviceTokens(key: string, appId: string) {
    const resp = await get(
      `/${group_id}/data/${COLLECTIONS.notificationToken}`,
      {
        query: JSON.stringify({
          _id: { $regex: `^${appId}` },
          "data.appId": appId
        })
      },
      key
    );
    return resp;
  }

  private static async getPrivateKey(key: string, appId: string) {
    const resp = await get(
      // FIXME: update collection when private_key collection is created
      `/${group_id}/data/${COLLECTIONS.certificate}`,
      {
        query: JSON.stringify({
          "data.appId": appId
        })
      },
      key
    );
    return resp;
  }

  private static async getApplet(
    appletId: string,
    key: string
  ): Promise<DodaiResponseType | null> {
    const response = await get(`/${group_id}/data/applet/${appletId}`, {}, key);

    if (response.status === 200) {
      return response;
    }

    return null;
  }

  private static async deleteNotificationTokens(notificationToken: string) {
    return await delete_(
      `/${group_id}/data/${COLLECTIONS.notificationToken}`,
      {
        "data.notificationToken": notificationToken
      },
      root_key
    );
  }

  private static async requestPushToAPNs(
    deviceTokens: string[],
    body: IPushReqBody
  ): Promise<apn.Responses | null> {
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
    note.pushType = body?.contentAvailable ? `background` : `alert`;
    return apnProvider.provider.send(note, deviceTokens);
  }
}
