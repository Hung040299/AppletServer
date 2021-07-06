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
const assert = __importStar(require("power-assert"));
const supertest_1 = __importDefault(require("supertest"));
const api = __importStar(require("../../utility/api"));
const cookie_getter_1 = require("../../utility/cookie_getter");
const util_1 = require("../../utility/util");
/* tslint:disable: no-var-requires */
const config = require("./config");
const session = require("ER_Proto_Block_Server/lib/user-session/api.js");
/* tslint:enable: no-var-requires */
const server = config.server;
const email = config.mEmailAddr;
const pass = config.mPassword;
const dummy_user_key = config.dummy_user_key;
const root_key = config.root_key;
let gAnotherUserKey = "";
let anotherUserEmail = config.mEmailAddr2;
let anotherUserPass = config.mPassword2;
// Change to prod setting
if (config.test_mode === "prod") {
    anotherUserEmail = config.mEmailAddr3;
    anotherUserPass = config.mPassword3;
}
const getUserId = async (jwtToken) => {
    const req = {
        headers: { authorization: jwtToken }
    };
    const user = await session.checkSession(req);
    return user.dodaiUserId;
};
describe("controllers", () => {
    /* Test entry */
    const gDefaultApi = new api.DefaultApi();
    const gAnotherApi = new api.DefaultApi();
    before(async () => {
        // gDefaultApi = await TestUtil.getDefaultApi();
        gDefaultApi.setApiKey(api.DefaultApiApiKeys.JWTToken, dummy_user_key);
        gDefaultApi.basePath = util_1.TestUtil.mServerBaseUrl;
        gAnotherUserKey = await cookie_getter_1.getCookieWithEmail(anotherUserEmail, anotherUserPass);
        if (!gAnotherUserKey) {
            console.log("Fail to login. Scenarios test failed");
        }
        gAnotherApi.setApiKey(api.DefaultApiApiKeys.JWTToken, gAnotherUserKey);
        gAnotherApi.basePath = util_1.TestUtil.mServerBaseUrl;
    });
    it("acsmine183463 POST /appletIcon by using another account", async () => {
        const appletId = await util_1.TestUtil.postSampleApplet(server);
        try {
            const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
            assert.notDeepStrictEqual(buf, null);
            const img = buf;
            await gAnotherApi.postAppletIcon(appletId, img, "icon.png");
            assert.fail("invalid. appletIcon should not be posted.");
        }
        catch (e) {
            assert.deepStrictEqual(e.response.statusCode, 404);
        }
        finally {
            await util_1.TestUtil.deleteApplet(appletId);
        }
    });
    it("acsmine204984. set PersonalUseFlg", async () => {
        const deviceId = "getAppletTestPersonalUseBody201912";
        // Create an applet with special device Id
        const appletPostBody = util_1.TestUtil.getSamplePostApplet();
        appletPostBody.deviceId = deviceId;
        appletPostBody.personalUseFlg = true;
        const resp = await supertest_1.default(server)
            .post("/api/applets")
            .set("Accept", "application/json")
            .set("Authorization", dummy_user_key)
            .send(appletPostBody);
        assert.deepStrictEqual(resp.status, 201);
        const appletId = resp.body.id;
        const personalUseFlg = false;
        let gResp = await supertest_1.default(server)
            .get(`/api/applets/${appletId}`)
            .set("Accept", "application/json")
            .set("Authorization", dummy_user_key);
        assert.deepStrictEqual(gResp.status, 200);
        const originalBody = gResp.body;
        try {
            // Check if appletSuspend is added to the created applet
            const putResp = await supertest_1.default(server)
                .put("/api/admin/appletPersonalUseFlg")
                .set("Accept", "application/json")
                .set("Authorization", root_key)
                .send({
                appletId,
                personalUseFlg
            });
            assert.deepStrictEqual(putResp.status, 201);
            assert.deepStrictEqual(putResp.body, {});
            gResp = await supertest_1.default(server)
                .get(`/api/applets/${appletId}`)
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key);
            assert.deepStrictEqual(gResp.status, 200);
            assert.notDeepStrictEqual(gResp.body, originalBody);
            originalBody.personalUseFlg = false;
            assert.deepStrictEqual(gResp.body, originalBody);
        }
        finally {
            await util_1.TestUtil.deleteApplet(appletId);
        }
    });
    it("acsmine204984. set PersonalUseFlg to data without personalUseFlg", async () => {
        const deviceId = "getAppletTestPersonalUseBody201912";
        // Create an applet with special device Id
        const appletPostBody = util_1.TestUtil.getSamplePostApplet();
        appletPostBody.deviceId = deviceId;
        const resp = await supertest_1.default(server)
            .post("/api/applets")
            .set("Accept", "application/json")
            .set("Authorization", dummy_user_key)
            .send(appletPostBody);
        assert.deepStrictEqual(resp.status, 201);
        const appletId = resp.body.id;
        const personalUseFlg = true;
        let gResp = await supertest_1.default(server)
            .get(`/api/applets/${appletId}`)
            .set("Accept", "application/json")
            .set("Authorization", dummy_user_key);
        assert.deepStrictEqual(gResp.status, 200);
        assert.deepStrictEqual(gResp.body.personalUseFlg, undefined);
        const originalBody = gResp.body;
        try {
            // Check if appletSuspend is added to the created applet
            const putResp = await supertest_1.default(server)
                .put("/api/admin/appletPersonalUseFlg")
                .set("Accept", "application/json")
                .set("Authorization", root_key)
                .send({
                appletId,
                personalUseFlg
            });
            assert.deepStrictEqual(putResp.status, 201);
            assert.deepStrictEqual(putResp.body, {});
            gResp = await supertest_1.default(server)
                .get(`/api/applets/${appletId}`)
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key);
            assert.deepStrictEqual(gResp.status, 200);
            assert.notDeepStrictEqual(gResp.body, originalBody);
            originalBody.personalUseFlg = personalUseFlg;
            assert.deepStrictEqual(gResp.body, originalBody);
        }
        finally {
            await util_1.TestUtil.deleteApplet(appletId);
        }
    });
    it("acsmine204984. not invalid appletId", async () => {
        const deviceId = "getAppletTestPersonalUseBody201912";
        // Create an applet with special device Id
        const appletPostBody = util_1.TestUtil.getSamplePostApplet();
        appletPostBody.deviceId = deviceId;
        const resp = await supertest_1.default(server)
            .post("/api/applets")
            .set("Accept", "application/json")
            .set("Authorization", dummy_user_key)
            .send(appletPostBody);
        assert.deepStrictEqual(resp.status, 201);
        const appletId = resp.body.id;
        await gDefaultApi.deleteApplet(appletId);
        const personalUseFlg = true;
        const putResp = await supertest_1.default(server)
            .put("/api/admin/appletPersonalUseFlg")
            .set("Accept", "application/json")
            .set("Authorization", root_key)
            .send({
            appletId,
            personalUseFlg
        });
        assert.deepStrictEqual(putResp.status, 404);
    });
    it("acsmine207082. search applet by owner", async () => {
        // Create an applet with special device Id
        let appletId1 = "";
        let appletId2 = "";
        try {
            const appletPostBody = util_1.TestUtil.getSamplePostApplet();
            let resp = await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key)
                .send(appletPostBody);
            appletId1 = resp.body.id;
            const userId1 = await getUserId(dummy_user_key);
            resp = await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", gAnotherUserKey)
                .send(appletPostBody);
            appletId2 = resp.body.id;
            const userId2 = await getUserId(gAnotherUserKey);
            let result = await supertest_1.default(server)
                .get("/api/admin/applets")
                .query({ version: appletPostBody.version, ownerId: userId2 })
                .set("Accept", "application/json")
                .set("Authorization", root_key);
            const applets = result.body.applets;
            let exist = applets.some((applet) => {
                return applet.id === appletId2;
            });
            assert.deepStrictEqual(exist, true);
            let notExist = applets.every((applet) => {
                return applet.id !== appletId1;
            });
            assert.deepStrictEqual(notExist, true);
            result = await supertest_1.default(server)
                .get("/api/applets")
                .query({ version: appletPostBody.version, ownerId: userId2 })
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key);
            exist = applets.some((applet) => {
                return applet.id === appletId2;
            });
            assert.deepStrictEqual(exist, true);
            notExist = applets.every((applet) => {
                return applet.id !== appletId1;
            });
            assert.deepStrictEqual(notExist, true);
        }
        finally {
            await gDefaultApi.deleteApplet(appletId1);
            await gAnotherApi.deleteApplet(appletId2);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9yZWdyZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidGVzdF9yZWdyZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QixxREFBdUM7QUFDdkMsMERBQWdDO0FBQ2hDLHVEQUF5QztBQUN6QywrREFBaUU7QUFDakUsNkNBQThDO0FBRTlDLHFDQUFxQztBQUNyQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbkMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLCtDQUErQyxDQUFDLENBQUM7QUFDekUsb0NBQW9DO0FBRXBDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDN0IsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztBQUNoQyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQzlCLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUM7QUFDN0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUVqQyxJQUFJLGVBQWUsR0FBRyxFQUFFLENBQUM7QUFFekIsSUFBSSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO0FBQzFDLElBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7QUFFeEMseUJBQXlCO0FBQ3pCLElBQUksTUFBTSxDQUFDLFNBQVMsS0FBSyxNQUFNLEVBQUU7SUFDL0IsZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUN0QyxlQUFlLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztDQUNyQztBQUVELE1BQU0sU0FBUyxHQUFHLEtBQUssRUFBRSxRQUFnQixFQUFFLEVBQUU7SUFDM0MsTUFBTSxHQUFHLEdBQUc7UUFDVixPQUFPLEVBQUUsRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFO0tBQ3JDLENBQUM7SUFDRixN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