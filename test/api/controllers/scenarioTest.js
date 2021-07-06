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
const power_assert_1 = __importDefault(require("power-assert"));
const supertest_1 = __importDefault(require("supertest"));
const api = __importStar(require("../../utility/api"));
const cookie_getter_1 = require("../../utility/cookie_getter");
const util_1 = require("../../utility/util");
/* tslint:disable: no-var-requires */
const config = require("./config");
/* tslint:enable: no-var-requires */
const server = config.server;
const email = config.mEmailAddr;
const pass = config.mPassword;
const dummy_user_key = config.dummy_user_key;
// FIXME: Need second account
const root_key = config.root_key;
let gAnotherUserKey = "";
let anotherUserEmail = config.mEmailAddr2;
let anotherUserPass = config.mPassword2;
// Change to prod setting
if (config.test_mode === "prod") {
    anotherUserEmail = config.mEmailAddr3;
    anotherUserPass = config.mPassword3;
}
const verifySuccessStatus = (ustatus) => {
    power_assert_1.default.notDeepEqual(ustatus, undefined);
    const status = ustatus;
    power_assert_1.default.strictEqual(status >= 200, true);
    power_assert_1.default.strictEqual(status < 300, true);
};
const verifyFailureStatus = (ustatus) => {
    if (ustatus === undefined) {
        return;
    }
    const status = ustatus;
    power_assert_1.default.strictEqual(status < 200 || status >= 300, true);
};
describe("controllers", () => {
    /* Test entry */
    const gDefaultApi = new api.DefaultApi();
    const gAnotherApi = new api.DefaultApi();
    const gRootkeyApi = new api.DefaultApi();
    before(async () => {
        gDefaultApi.setApiKey(api.DefaultApiApiKeys.JWTToken, dummy_user_key);
        gDefaultApi.basePath = util_1.TestUtil.mServerBaseUrl;
        gAnotherUserKey = await cookie_getter_1.getCookieWithEmail(anotherUserEmail, anotherUserPass);
        if (!gAnotherUserKey) {
            console.log("Fail to login. Scenarios test failed");
        }
        gAnotherApi.setApiKey(api.DefaultApiApiKeys.JWTToken, gAnotherUserKey);
        gAnotherApi.basePath = util_1.TestUtil.mServerBaseUrl;
        gRootkeyApi.setApiKey(api.DefaultApiApiKeys.JWTToken, root_key);
        gRootkeyApi.basePath = util_1.TestUtil.mServerBaseUrl;
    });
    it("Scenario1 publish applet", async () => {
        let appletId = "";
        try {
            if (!gAnotherUserKey) {
                console.log("Fail to login. Scenarios test failed");
                throw new Error("not login");
            }
            const exampleReqBody = JSON.parse(require("fs").readFileSync(`${__dirname}/testJsonFiles/appletsPostReqBody.json`));
            await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key)
                .send(exampleReqBody)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(res => {
                appletId = res.body.id;
            });
            console.log(`appletId = ${appletId}`);
            const body = new api.Body6();
            body.appletId = appletId;
            body.status = api.Body6.StatusEnum.Published;
            body.message = "test";
            const resp = await gRootkeyApi.putAppletStoreStatus(body);
            verifySuccessStatus(resp.response.statusCode);
            const gresp = await gDefaultApi.listApplets("1.0.0", [appletId], undefined, undefined, undefined, undefined, undefined, "published", undefined, undefined);
            verifySuccessStatus(gresp.response.statusCode);
            power_assert_1.default.notStrictEqual(gresp.body.applets, undefined);
            const applets = gresp.body.applets;
            const utargetApplet = applets.find(applet => {
                return applet.id === appletId;
            });
            power_assert_1.default.notDeepStrictEqual(utargetApplet, undefined);
            const targetApplet = utargetApplet;
            power_assert_1.default.deepStrictEqual(targetApplet.id, appletId);
            power_assert_1.default.deepStrictEqual(targetApplet.appletInfo.storeStatus, api.AppletStoreStatus.StatusEnum.Published);
        }
        catch (e) {
            throw e;
        }
        finally {
            if (appletId.length > 0) {
                await util_1.TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
            }
        }
    });
    it("Scenario2 reject applet", async () => {
        let appletId = "";
        try {
            if (!gAnotherUserKey) {
                console.log("Fail to login. Scenarios test failed");
                throw new Error("not login");
            }
            const exampleReqBody = JSON.parse(require("fs").readFileSync(`${__dirname}/testJsonFiles/appletsPostReqBody.json`));
            await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key)
                .send(exampleReqBody)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(res => {
                appletId = res.body.id;
            });
            const body = new api.Body6();
            body.appletId = appletId;
            body.status = api.Body6.StatusEnum.Rejected;
            body.message = "test";
            const resp = await gRootkeyApi.putAppletStoreStatus(body);
            verifySuccessStatus(resp.response.statusCode);
            const gresp = await gDefaultApi.listApplets("1.0.0", [appletId], undefined, undefined, undefined, undefined, undefined, "rejected", undefined, undefined);
            verifySuccessStatus(gresp.response.statusCode);
            power_assert_1.default.notStrictEqual(gresp.body.applets, undefined);
            const applets = gresp.body.applets;
            const utargetApplet = applets.find(applet => {
                return applet.id === appletId;
            });
            power_assert_1.default.notDeepStrictEqual(utargetApplet, undefined);
        }
        catch (e) {
            throw e;
        }
        finally {
            if (appletId.length > 0) {
                await util_1.TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
            }
        }
    });
    it("Scenario3 applet public", async () => {
        let appletId = "";
        try {
            if (!gAnotherUserKey) {
                console.log("Fail to login. Scenarios test failed");
                throw new Error("not login");
            }
            const exampleReqBody = JSON.parse(require("fs").readFileSync(`${__dirname}/testJsonFiles/appletsPostReqBody.json`));
            await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key)
                .send(exampleReqBody)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(res => {
                appletId = res.body.id;
            });
            const body = new api.Body4();
            body.appletId = appletId;
            body.status = true;
            const resp = await gDefaultApi.putAppletPublicStatus(body);
            verifySuccessStatus(resp.response.statusCode);
            const gresp = await gDefaultApi.getAppletPublicStatus(appletId);
            verifySuccessStatus(resp.response.statusCode);
            power_assert_1.default.deepStrictEqual(gresp.body.status, true);
        }
        catch (e) {
            throw e;
        }
        finally {
            if (appletId.length > 0) {
                await util_1.TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
            }
        }
    });
    it("Scenario4 applet not public", async () => {
        let appletId = "";
        try {
            if (!gAnotherUserKey) {
                console.log("Fail to login. Scenarios test failed");
                throw new Error("not login");
            }
            const exampleReqBody = JSON.parse(require("fs").readFileSync(`${__dirname}/testJsonFiles/appletsPostReqBody.json`));
            await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key)
                .send(exampleReqBody)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(res => {
                appletId = res.body.id;
            });
            const body = new api.Body4();
            body.appletId = appletId;
            body.status = false;
            const resp = await gDefaultApi.putAppletPublicStatus(body);
            verifySuccessStatus(resp.response.statusCode);
            const gresp = await gDefaultApi.getAppletPublicStatus(appletId);
            verifySuccessStatus(resp.response.statusCode);
            power_assert_1.default.deepStrictEqual(gresp.body.status, false);
        }
        catch (e) {
            throw e;
        }
        finally {
            if (appletId.length > 0) {
                await util_1.TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
            }
        }
    });
    it("Scenario5 applet own", async () => {
        let appletId = "";
        let appletId2 = "";
        try {
            if (!gAnotherUserKey) {
                console.log("Fail to login. Scenarios test failed");
                throw new Error("not login");
            }
            const exampleReqBody = JSON.parse(require("fs").readFileSync(`${__dirname}/testJsonFiles/appletsPostReqBody.json`));
            await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key)
                .send(exampleReqBody)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(res => {
                appletId = res.body.id;
            });
            await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", gAnotherUserKey)
                .send(exampleReqBody)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(res => {
                appletId2 = res.body.id;
            });
            const mresp = await gAnotherApi.getMyApplets();
            verifySuccessStatus(mresp.response.statusCode);
            const applets = mresp.body.applets;
            let applet = applets.find(element => {
                return element.id === appletId2;
            });
            power_assert_1.default.notDeepStrictEqual(applet, undefined);
            applet = applets.find(element => {
                return element.id === appletId;
            });
            power_assert_1.default.deepStrictEqual(applet, undefined);
        }
        catch (e) {
            throw e;
        }
        finally {
            if (appletId.length > 0) {
                await util_1.TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
            }
            if (appletId2.length > 0) {
                await util_1.TestUtil.deleteAppletWithKey(appletId2, gAnotherUserKey);
            }
        }
    });
    it("Scenario6 get applet by correct user", async () => {
        let appletId = "";
        let appletId2 = "";
        try {
            if (!gAnotherUserKey) {
                console.log("Fail to login. Scenarios test failed");
                throw new Error("not login");
            }
            const exampleReqBody = JSON.parse(require("fs").readFileSync(`${__dirname}/testJsonFiles/appletsPostReqBody.json`));
            await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key)
                .send(exampleReqBody)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(res => {
                appletId = res.body.id;
            });
            await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", gAnotherUserKey)
                .send(exampleReqBody)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(res => {
                appletId2 = res.body.id;
            });
            const mresp = await gDefaultApi.getApplet(appletId);
            verifySuccessStatus(mresp.response.statusCode);
        }
        catch (e) {
            throw e;
        }
        finally {
            if (appletId.length > 0) {
                await util_1.TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
            }
            if (appletId2.length > 0) {
                await util_1.TestUtil.deleteAppletWithKey(appletId2, gAnotherUserKey);
            }
        }
    });
    it("Scenario7 get applet by correct another user", async () => {
        let appletId = "";
        let appletId2 = "";
        try {
            if (!gAnotherUserKey) {
                console.log("Fail to login. Scenarios test failed");
                throw new Error("not login");
            }
            const exampleReqBody = JSON.parse(require("fs").readFileSync(`${__dirname}/testJsonFiles/appletsPostReqBody.json`));
            await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key)
                .send(exampleReqBody)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(res => {
                appletId = res.body.id;
            });
            await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", gAnotherUserKey)
                .send(exampleReqBody)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(res => {
                appletId2 = res.body.id;
            });
            const mresp = await gAnotherApi.getApplet(appletId2);
            verifySuccessStatus(mresp.response.statusCode);
        }
        catch (e) {
            throw e;
        }
        finally {
            if (appletId.length > 0) {
                await util_1.TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
            }
            if (appletId2.length > 0) {
                await util_1.TestUtil.deleteAppletWithKey(appletId2, gAnotherUserKey);
            }
        }
    });
    it("Scenario8 put another user's applet", async () => {
        let appletId = "";
        let appletId2 = "";
        try {
            if (!gAnotherUserKey) {
                console.log("Fail to login. Scenarios test failed");
                throw new Error("not login");
            }
            const exampleReqBody = JSON.parse(require("fs").readFileSync(`${__dirname}/testJsonFiles/appletsPostReqBody.json`));
            await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key)
                .send(exampleReqBody)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(res => {
                appletId = res.body.id;
            });
            await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", gAnotherUserKey)
                .send(exampleReqBody)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(res => {
                appletId2 = res.body.id;
            });
            const buf = fs.readFileSync(`${__dirname}/testJsonFiles/appletsPutReqBody.json`);
            const putReqBody = JSON.parse(buf.toString());
            putReqBody.appletId = appletId;
            supertest_1.default(server)
                .put("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", gAnotherUserKey)
                .send(putReqBody)
                .expect(404);
        }
        catch (e) {
            throw e;
        }
        finally {
            if (appletId.length > 0) {
                await util_1.TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
            }
            if (appletId2.length > 0) {
                await util_1.TestUtil.deleteAppletWithKey(appletId2, gAnotherUserKey);
            }
        }
    });
    it("Scenario9 delete another user's applet", async () => {
        let appletId = "";
        let appletId2 = "";
        try {
            if (!gAnotherUserKey) {
                console.log("Fail to login. Scenarios test failed");
                throw new Error("not login");
            }
            const exampleReqBody = JSON.parse(require("fs").readFileSync(`${__dirname}/testJsonFiles/appletsPostReqBody.json`));
            await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key)
                .send(exampleReqBody)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(res => {
                appletId = res.body.id;
            });
            await supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", gAnotherUserKey)
                .send(exampleReqBody)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(res => {
                appletId2 = res.body.id;
            });
            try {
                await gAnotherApi.deleteApplet(appletId);
            }
            catch (e) {
                const dresp = e.response;
                power_assert_1.default.deepStrictEqual(dresp.statusCode, 404);
                return;
            }
            power_assert_1.default.fail("invalid correct response");
        }
        catch (e) {
            throw e;
        }
        finally {
            if (appletId.length > 0) {
                await util_1.TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
            }
            if (appletId2.length > 0) {
                await util_1.TestUtil.deleteAppletWithKey(appletId2, gAnotherUserKey);
            }
        }
    });
}); /* controllers */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmFyaW9UZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2NlbmFyaW9UZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUV6QixnRUFBa0M7QUFDbEMsMERBQWdDO0FBQ2hDLHVEQUF5QztBQUV6QywrREFBaUU7QUFDakUsNkNBQThDO0FBRTlDLHFDQUFxQztBQUNyQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbkMsb0NBQW9DO0FBRXBDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDN0IsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztBQUNoQyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQzlCLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUM7QUFDN0MsNkJBQTZCO0FBQzdCLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDakMsSUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFDO0FBRXpCLElBQUksZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztBQUMxQyxJQUFJLGVBQWUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBRXhDLHlCQUF5QjtBQUN6QixJQUFJLE1BQU0sQ0FBQyxTQUFTLEtBQUssTUFBTSxFQUFFO0lBQy9CLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFDdEMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7Q0FDckM7QUFFRCxNQUFNLG1CQUFtQixHQUFHLENBQUMsT0FBMkIsRUFBRSxFQUFFO0lBQzFELHNCQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN4QyxNQUFNLE1BQU0sR0FBRyxPQUFpQixDQUFDO0lBQ2pDLHNCQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSSxH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