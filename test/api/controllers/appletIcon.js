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
const fs = __importStar(require("fs"));
const Sizeof = require("image-size");
const assert = __importStar(require("power-assert"));
const supertest_1 = __importDefault(require("supertest"));
const API = __importStar(require("./../../utility/api"));
const util_1 = require("./../../utility/util");
const api_1 = require("./../../utility/api");
const riiiverdb = __importStar(require("user-session/riiiverdb"));
/* tslint:disable: no-var-requires */
const server = require("./config").server;
/* tslint:enable: no-var-requires */
const test_config_1 = require("../../config/test_config");
const session = require("ER_Proto_Block_Server/lib/user-session/api");
/*************************************************************************
 * Test POST /appletIcon
 ************************************************************************/
describe("POST /appletIcon", () => {
    let gDefaultApi = new API.DefaultApi();
    before(async () => {
        gDefaultApi = await util_1.TestUtil.getDefaultApi();
        const app = await supertest_1.default(server);
    });
    // TEST ID: 37A
    it("should accept request with valid applet ID (png)", async () => {
        const appletId = await util_1.TestUtil.postSampleApplet(server);
        try {
            const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
            assert.notDeepStrictEqual(buf, null);
            const img = buf;
            const resp = await gDefaultApi.postAppletIcon(appletId, img, "icon.png");
            assert.deepStrictEqual(resp.response.statusCode, 201);
        }
        catch (e) {
            throw e;
        }
        finally {
            await util_1.TestUtil.deleteApplet(appletId);
        }
    });
    // TEST ID: 37AA
    it("should accept request with valid applet ID (jpg)", async () => {
        const appletId = await util_1.TestUtil.postSampleApplet(server);
        try {
            const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.jpg`);
            assert.notDeepStrictEqual(buf, null);
            const img = buf;
            const resp = await gDefaultApi.postAppletIcon(appletId, img, "icon.jpg");
            assert.deepStrictEqual(resp.response.statusCode, 201);
        }
        catch (e) {
            throw e;
        }
        finally {
            await util_1.TestUtil.deleteApplet(appletId);
        }
    });
    // TEST ID: 39
    it("should reject request with invalid applet ID", async () => {
        const invalidAppletId = "5c99837c26000027000fe817";
        let resp;
        try {
            const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
            assert.notDeepStrictEqual(buf, null);
            const img = buf;
            resp = await gDefaultApi.postAppletIcon(invalidAppletId, img, "icon.png");
        }
        catch (e) {
            if (!e.response) {
                return assert.fail();
            }
            const eresp = e.response;
            assert.deepStrictEqual(eresp.statusCode, 404);
            return;
        }
        assert.fail(resp.response.statusCode);
    });
    // TEST ID: 40
    it("should reject request if applet ID have been bound with other picture", async () => {
        const appletId = await util_1.TestUtil.postSampleApplet(server);
        const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
        assert.notDeepStrictEqual(buf, null);
        const img = buf;
        let resp = await gDefaultApi.postAppletIcon(appletId, img, "icon.png");
        assert.deepStrictEqual(resp.response.statusCode, 201);
        try {
            resp = await gDefaultApi.postAppletIcon(appletId, img, "icon.png");
        }
        catch (e) {
            if (!e.response) {
                return assert.fail();
            }
            const eresp = e.response;
            assert.deepStrictEqual(eresp.statusCode, 409);
            return;
        }
        assert.fail(resp.response.statusCode);
    });
    it("test image icon", () => {
        const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
        try {
            const dimention = Sizeof(buf);
            console.log(`type: ${dimention.type}, width: ${dimention.width}, height ${dimention.height}`);
            assert.deepStrictEqual(dimention.type, "png");
            assert.deepStrictEqual(dimention.width, dimention.height);
        }
        catch (e) {
            // when Buffer is not image, exception occurs.
            assert.fail(e);
        }
    });
});
describe("PUT /appletIcon", () => {
    let gDefaultApi = new API.DefaultApi();
    let appletID = "";
    before(async () => {
        gDefaultApi = await util_1.TestUtil.getDefaultApi();
        appletID = await util_1.TestUtil.postSampleApplet(server);
    });
    after(async () => {
        try {
            let testKey = test_config_1.TestConfig.getTestApiKey();
            await gDefaultApi.setApiKey(API.DefaultApiApiKeys.JWTToken, testKey);
            await util_1.TestUtil.deleteApplet(appletID);
        }
        catch (e) {
            console.log(e.message);
        }
    });
    const getUserInfo = async (api) => {
        const auth = api.authentications[API.DefaultApiApiKeys[API.DefaultApiApiKeys.JWTToken]].apiKey;
        const req = {
            headers: {
                authorization: auth
            }
        };
        const result = await session.checkSession(req);
        return result;
    };
    it("should update with valid applet ID (png) and applet don't have appletIcon", async () => {
        const userInfo = await getUserInfo(gDefaultApi);
        let rootKey = test_config_1.TestConfig.getTestRootKey();
        let versionDB;
        await riiiverdb.forRead(userInfo, null, null, async (ds) => {
            let result = await api_1.getAppletIcon(ds, appletID, rootKey);
            assert.deepStrictEqual(result.status, 200);
            assert.deepStrictEqual(result.body.publicUrl, undefined);
        });
        await riiiverdb.forRead(userInfo, null, null, async (ds) => {
            let result = await api_1.getApplet(ds, appletID, userInfo.dodaiUserCredential);
            assert.deepStrictEqual(result.status, 200);
            versionDB = result.body.version;
        });
        try {
            const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
            assert.notDeepStrictEqual(buf, null);
            const img = buf;
            await gDefaultApi.setApiKey(API.DefaultApiApiKeys.JWTToken, rootKey);
            const resp = await gDefaultApi.putAppletIcon(appletID, img, "icon.png");
            assert.deepStrictEqual(resp.response.statusCode, 200);
            await riiiverdb.forRead(userInfo, null, null, async (ds) => {
                let result = await api_1.getAppletIcon(ds, appletID, rootKey);
                assert.deepStrictEqual(result.status, 200);
                assert.notDeepStrictEqual(result.body.publicUrl, undefined);
            });
            await riiiverdb.forRead(userInfo, null, null, async (ds) => {
                let result = await api_1.getApplet(ds, appletID, userInfo.dodaiUserCredential);
                assert.deepStrictEqual(result.status, 200);
                assert.deepStrictEqual(versionDB + 1, result.body.version);
                assert.notDeepStrictEqual(result.body.data.iconUrl, undefined);
            });
        }
        catch (e) {
            console.error(e.message);
        }
    });
    it(" should update with valid applet ID (jpg)", async () => {
        let testKey = test_config_1.TestConfig.getTestApiKey();
        let rootKey = test_config_1.TestConfig.getTestRootKey();
        await gDefaultApi.setApiKey(API.DefaultApiApiKeys.JWTToken, testKey);
        const userInfo = await getUserInfo(gDefaultApi);
        let iconUrlDB;
        let versionDB;
        await riiiverdb.forRead(userInfo, null, null, async (ds) => {
            let result = await api_1.getAppletIcon(ds, appletID, rootKey);
            assert.deepStrictEqual(result.status, 200);
            iconUrlDB = result.body.publicUrl;
        });
        await riiiverdb.forRead(userInfo, null, null, async (ds) => {
            let result = await api_1.getApplet(ds, appletID, userInfo.dodaiUserCredential);
            assert.deepStrictEqual(result.status, 200);
            versionDB = result.body.version;
        });
        try {
            const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.jpg`);
            assert.notDeepStrictEqual(buf, null);
            const img = buf;
            await gDefaultApi.setApiKey(API.DefaultApiApiKeys.JWTToken, rootKey);
            const resp = await gDefaultApi.putAppletIcon(appletID, img, "icon.jpg");
            assert.deepStrictEqual(resp.response.statusCode, 200);
            await riiiverdb.forRead(userInfo, null, null, async (ds) => {
                let result = await api_1.getAppletIcon(ds, appletID, rootKey);
                assert.deepStrictEqual(result.status, 200);
                assert.notDeepStrictEqual(result.body.publicUrl, iconUrlDB);
            });
            await riiiverdb.forRead(userInfo, null, null, async (ds) => {
                let result = await api_1.getApplet(ds, appletID, userInfo.dodaiUserCredential);
                assert.deepStrictEqual(result.status, 200);
                assert.deepStrictEqual(versionDB + 1, result.body.version);
            });
        }
        catch (e) {
            console.error(e.message);
        }
    });
    it(" should reject with invalid icon type", async () => {
        try {
            const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
            assert.notDeepStrictEqual(buf, null);
            const img = buf;
            const rootKey = test_config_1.TestConfig.getTestRootKey();
            await gDefaultApi.setApiKey(API.DefaultApiApiKeys.JWTToken, rootKey);
            await gDefaultApi.putAppletIcon(appletID, img, "icon.png");
        }
        catch (e) {
            assert.deepStrictEqual(e.response.statusCode, 400);
        }
    });
    it(" should reject with invalid appletID", async () => {
        try {
            const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
            assert.notDeepStrictEqual(buf, null);
            const img = buf;
            const rootKey = test_config_1.TestConfig.getTestRootKey();
            await gDefaultApi.setApiKey(API.DefaultApiApiKeys.JWTToken, rootKey);
            await gDefaultApi.putAppletIcon("appletID", img, "icon.png");
        }
        catch (e) {
            assert.deepStrictEqual(e.response.statusCode, 400);
        }
    });
    it("test image icon", () => {
        const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
        try {
            const dimention = Sizeof(buf);
            console.log(`type: ${dimention.type}, width: ${dimention.width}, height ${dimention.height}`);
            assert.deepStrictEqual(dimention.type, "png");
            assert.deepStrictEqual(dimention.width, dimention.height);
        }
        catch (e) {
            // when Buffer is not image, exception occurs.
            assert.fail(e);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGV0SWNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcGxldEljb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsdUNBQXlCO0FBRXpCLHFDQUFzQztBQUN0QyxxREFBdUM7QUFDdkMsMERBQWdDO0FBQ2hDLHlEQUEyQztBQUMzQywrQ0FBZ0Q7QUFDaEQsNkNBQTZEO0FBQzdELGtFQUFvRDtBQUVwRCxxQ0FBcUM7QUFDckMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUMxQyxvQ0FBb0M7QUFDcEMsMERBQXNEO0FBR3RELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0FBQ3RFOzswRUFFMEU7QUFDekUsUUFBUSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtJQUNqQyxJQUFJLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUN2QyxNQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDaEIsV0FBVyxHQUFHLE1BQU0sZUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzdDLE1BQU0sR0FBRyxHQUFHLE1BQU0sbUJBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQyxDQUFDLENBQUMsQ0FBQztJQUVILGVBQWU7SUFDZixFQUFFLENBQUMsa0RBQWtELEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDaEUsTUFBTSxRQUFRLEdBQUcsTUFBTSxlQUFRLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekQsSUFBSTtZQUNGLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxTQUFTLHlCQUF5QixDQUFDLENBQUM7WUFDbkUsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyQyxNQUFNLEdBQUcsR0FBRyxHQUFhLENBQUM7WUFFMUIsTUFB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