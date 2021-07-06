"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const power_assert_1 = __importDefault(require("power-assert"));
const supertest_1 = __importDefault(require("supertest"));
const api = __importStar(require("../../utility/api"));
const util_1 = require("../../utility/util");
/* tslint:disable: no-var-requires */
const config = require("./config");
/* tslint:enable: no-var-requires */
const server = config.server;
const deviceID = config.deviceID;
const deviceID2 = config.deviceID2;
const fakeDeviceID = config.fakeDeviceID;
const fakeAppletID = config.fakeAppletID;
const dummy_user_key = config.dummy_user_key;
const root_key = config.root_key;
const verifySuccessStatus = (ustatus) => {
    power_assert_1.default.notDeepEqual(ustatus, undefined);
    const status = ustatus;
    power_assert_1.default.strictEqual(status >= 200, true);
    power_assert_1.default.strictEqual(status < 300, true);
};
const verifyDeleteStatus = (ustatus, sstatus, storeStatus) => {
    power_assert_1.default.notDeepEqual(ustatus, undefined);
    const status = ustatus;
    power_assert_1.default.strictEqual(status >= 200, true);
    power_assert_1.default.strictEqual(status < 300, true);
    if (sstatus === "deleted" || sstatus === "published") {
        power_assert_1.default.strictEqual(storeStatus === "deleted", true);
    }
    else if (sstatus === "rejected" || sstatus === "waiting_review") {
        power_assert_1.default.deepStrictEqual(ustatus === 204, true);
    }
    else {
        // nothing to do
    }
};
describe("controllers", () => {
    /* Test entry */
    const gDefaultApi = new api.DefaultApi();
    const gRootKeyApi = new api.DefaultApi();
    let gAppletId = "";
    let gAppletId2 = "";
    before(async () => {
        gDefaultApi.setApiKey(api.DefaultApiApiKeys.JWTToken, dummy_user_key);
        gDefaultApi.basePath = util_1.TestUtil.mServerBaseUrl;
        gRootKeyApi.setApiKey(api.DefaultApiApiKeys.JWTToken, root_key);
        gRootKeyApi.basePath = util_1.TestUtil.mServerBaseUrl;
        gAppletId = await util_1.TestUtil.postSampleAppletWithKey(server, dummy_user_key);
        gAppletId2 = await util_1.TestUtil.postSampleAppletWithKey(server, dummy_user_key);
    });
    after(async () => {
        await util_1.TestUtil.deleteAppletWithKey(gAppletId, dummy_user_key);
        await util_1.TestUtil.deleteAppletWithKey(gAppletId2, dummy_user_key);
    });
    describe("users", () => {
        /*************************************************************************
         * Test GET /appletCopy
         ************************************************************************/
        describe("GET /appletCopy", () => {
            let appletId = "";
            let appletCopyId = "";
            let preferenceId = "";
            before(async () => {
                appletId = await util_1.TestUtil.postSampleApplet(server);
                preferenceId = await util_1.TestUtil.putUserPreference({
                    appletId: appletId,
                    preferenceName: null,
                    triggerBlockId: null,
                    triggerDeviceId: null,
                    triggerUserId: null,
                    serviceBlockId: null,
                    serviceDeviceId: null,
                    serviceUserId: null,
                    actionBlockId: null,
                    actionDeviceId: null,
                    actionUserId: null,
                    actionTagId: null
                });
                appletCopyId = await util_1.TestUtil.postAppletCopy(server, {
                    userId: config.ownerID,
                    appletId: appletId,
                    userPreferenceId: preferenceId
                });
            });
            after(async () => {
                await util_1.TestUtil.deleteAppletCopy(server, appletCopyId);
                await util_1.TestUtil.delUserPreference(preferenceId);
                await util_1.TestUtil.deleteApplet(appletId);
            });
            // Test starts here
            it("should reject request with 400 if id is invalid", done => {
                supertest_1.default(server)
                    .get("/api/appletCopy?userPreferenceId=not_bson_object_id")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .expect('{"code":"PATTERN","failedValidation":true,"path":["paths","/appletCopy","get","parameters","0"],"paramName":"userPreferenceId"}')
                    .end(done);
            });
            it("should reject request with 400 no parameter", done => {
                supertest_1.default(server)
                    .get("/api/appletCopy")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .expect('{"code":"REQUIRED","failedValidation":true,"path":["paths","/appletCopy","get","parameters","0"],"paramName":"userPreferenceId"}')
                    .end(done);
            });
            it("should reject request with 400 bad parameter", done => {
                supertest_1.default(server)
                    .get("/api/appletCopy?u=x")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .expect('{"code":"REQUIRED","failedValidation":true,"path":["paths","/appletCopy","get","parameters","0"],"paramName":"userPreferenceId"}')
                    .end(done);
            });
            it("should reject request with 401 No auth", done => {
                supertest_1.default(server)
                    .get("/api/appletCopy?u=x")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(401)
                    .expect('{"code":"401-00","message":"InvalidCredential"}')
                    .end(done);
            });
            it("should accept request", done => {
                supertest_1.default(server)
                    .get(`/api/appletCopy?userPreferenceId=${preferenceId}`)
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
        });
        /*************************************************************************
         * Test POST /appletCopy
         ************************************************************************/
        describe("POST /appletCopy", () => {
            let appletId = "";
            let preferenceId = "";
            before(async () => {
                appletId = await util_1.TestUtil.postSampleApplet(server);
                preferenceId = await util_1.TestUtil.putUserPreference({
                    appletId: appletId,
                    preferenceName: null,
                    triggerBlockId: null,
                    triggerDeviceId: null,
                    triggerUserId: null,
                    serviceBlockId: null,
                    serviceDeviceId: null,
                    serviceUserId: null,
                    actionBlockId: null,
                    actionDeviceId: null,
                    actionUserId: null,
                    actionTagId: null
                });
            });
            after(async () => {
                await util_1.TestUtil.delUserPreference(preferenceId);
                await util_1.TestUtil.deleteApplet(appletId);
            });
            // Test starts here
            it("should reject request with 400 if mandatory parameters are missing", done => {
                supertest_1.default(server)
                    .post("/api/appletCopy")
                    .set("Accept", "application/json")
                    .send({})
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .expect(/Missing required property: userId/)
                    .expect(/Missing required property: userPreferenceId/)
                    .expect(/Missing required property: appletId/)
                    .end(done);
            });
            it("should reject request with 404 if appletId is invalid", done => {
                supertest_1.default(server)
                    .post("/api/appletCopy")
                    .set("Accept", "application/json")
                    .send({
                    appletId: 'noapplet',
                    userPreferenceId: preferenceId,
                    userId: config.ownerID
                })
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .expect('{"code":"404-01","message":"invalid parameters: appletId"}')
                    .end(done);
            });
            it("should reject request with 404 if userPreferenceId is invalid", done => {
                supertest_1.default(server)
                    .post("/api/appletCopy")
                    .set("Accept", "application/json")
                    .send({
                    appletId: appletId,
                    userPreferenceId: 'illegalid',
                    userId: config.ownerID
                })
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .expect('{"code":"404-01","message":"invalid parameters: userPreferenceId"}')
                    .end(done);
            });
            it("should accept request", async (done) => {
                let result = await supertest_1.default(server)
                    .post(`/api/appletCopy`)
                    .set("Accept", "application/json")
                    .send({
                    appletId: appletId,
                    userPreferenceId: preferenceId,
                    userId: config.ownerID
                })
                    .expect("Content-Type", /json/)
                    .expect(201);
                util_1.TestUtil.deleteAppletCopy(server, result.body.applet_copy_id);
                done();
            });
        });
        /*************************************************************************
         * Test DELETE /appletCopy
         ************************************************************************/
        describe("DELETE /appletCopy", () => {
            let appletId = "";
            let preferenceId = "";
            before(async () => {
                appletId = await util_1.TestUtil.postSampleApplet(server);
                preferenceId = await util_1.TestUtil.putUserPreference({
                    appletId: appletId,
                    preferenceName: null,
                    triggerBlockId: null,
                    triggerDeviceId: null,
                    triggerUserId: null,
                    serviceBlockId: null,
                    serviceDeviceId: null,
                    serviceUserId: null,
                    actionBlockId: null,
                    actionDeviceId: null,
                    actionUserId: null,
                    actionTagId: null
                });
            });
            after(async () => {
                await util_1.TestUtil.delUserPreference(preferenceId);
                await util_1.TestUtil.deleteApplet(appletId);
            });
            // Test starts here
            it("should reject request with 400 if mandatory parameters are missing", done => {
                supertest_1.default(server)
                    .delete("/api/appletCopy")
                    .set("Accept", "application/json")
                    .expect(404)
                    .expect(/Cannot DELETE \/api\/appletCopy/)
                    .end(done);
            });
            it("should reject request with 400 if appletCopyId is invalid", done => {
                supertest_1.default(server)
                    .delete("/api/appletCopy/not_bson_object_id")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .expect('{"code":"PATTERN","failedValidation":true,"path":["paths","/appletCopy/{applet_copy_id}","delete","parameters","0"],"paramName":"applet_copy_id"}')
                    .end(done);
            });
            it("should reject request with 404 if userPreferenceId is invalid", done => {
                supertest_1.default(server)
                    .delete("/api/appletCopy/" + config.ownerID)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .expect('{"code":"404-04","description":"The resource does not exist in the database.","error":"ResourceNotFound"}')
                    .end(done);
            });
            it("should accept request", async (done) => {
                let appletCopyId = await util_1.TestUtil.postAppletCopy(server, {
                    userId: config.ownerID,
                    appletId: appletId,
                    userPreferenceId: preferenceId
                });
                let result = await supertest_1.default(server)
                    .delete(`/api/appletCopy/${appletCopyId}`)
                    .set("Accept", "application/json")
                    .expect(204);
                done();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGV0X2NvcHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcHBsZXRfY29weS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFFQSxnRUFBa0M7QUFDbEMsMERBQWdDO0FBQ2hDLHVEQUF5QztBQUN6Qyw2Q0FBOEM7QUFFOUMscUNBQXFDO0FBQ3JDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuQyxvQ0FBb0M7QUFFcEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUM3QixNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2pDLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDbkMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN6QyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ3pDLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUM7QUFDN0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUVqQyxNQUFNLG1CQUFtQixHQUFHLENBQUMsT0FBMkIsRUFBRSxFQUFFO0lBQzFELHNCQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN4QyxNQUFNLE1BQU0sR0FBRyxPQUFpQixDQUFDO0lBQ2pDLHNCQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDeEMsc0JBQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN6QyxDQUFDLENBQUM7QUFFRixNQUFNLGtCQUFrQixHQUFHLENBQ3pCLE9BQTJCLEVBQzNCLE9BQWUsRUFDZixXQUFnQyxFQUNoQyxFQUFFO0lBQ0Ysc0JBQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFNB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