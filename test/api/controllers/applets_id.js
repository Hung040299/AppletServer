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
const api_1 = require("ER_Proto_Block_Server/test_api/client/api");
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
    if (sstatus === "deleted" || sstatus === "published" || sstatus === "waiting_review" || sstatus === "testing") {
        power_assert_1.default.strictEqual(storeStatus === "deleted", true);
    }
    else if (sstatus === "rejected") {
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
         * Test GET /applets/{id}
         ************************************************************************/
        describe("GET /applets/{id}", () => {
            // For osType testing
            let testOSTypeAppletID = "";
            before(async () => {
                const postJson = util_1.TestUtil.getSamplePostApplet();
                postJson.osType = api_1.OSType.OSTypeEnum.Android;
                testOSTypeAppletID = await util_1.TestUtil.postApplet(server, postJson);
            });
            after(async () => {
                await util_1.TestUtil.deleteAppletWithKey(testOSTypeAppletID, dummy_user_key);
            });
            // Test starts here
            it("should reject request with 400 if id is invalid", done => {
                supertest_1.default(server)
                    .get("/api/applets/not_bson_object_id")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .expect('{"code":"PATTERN","failedValidation":true,"path":["paths","/applets/{id}","get","parameters","0"],"paramName":"id"}')
                    .end(done);
            });
            it("should accept request without deviceID", done => {
                supertest_1.default(server)
                    .get(`/api/applets/${gAppletId}`)
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request if deviceId is valid", done => {
                supertest_1.default(server)
                    .get(`/api/applets/${gAppletId}`)
                    .query({ deviceId: deviceID })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request if thre are more than one device id, and are valid", done => {
                supertest_1.default(server)
                    .get(`/api/applets/${gAppletId}`)
                    .query({ deviceId: deviceID, deviceID2 })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should not accept a non existed device id", done => {
                supertest_1.default(server)
                    .get(`/api/applets/${gAppletId}`)
                    .query({ deviceId: fakeDeviceID })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .end(done);
            });
        });
        /*************************************************************************
         * Test DELETE /applets/{id}
         ************************************************************************/
        describe("DELETE /applets/{id}", () => {
            it("should reject request with 400 if id is invalid", done => {
                supertest_1.default(server)
                    .delete("/api/applets/not_bson_object_id")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .expect('{"code":"PATTERN","failedValidation":true,"path":["paths","/applets/{id}","delete","parameters","0"],"paramName":"id"}')
                    .end(done);
            });
            it("should accept request if id is valid", async () => {
                const appletId = await util_1.TestUtil.postSampleAppletWithKey(server, dummy_user_key);
                try {
                    const resp = await gDefaultApi.deleteApplet(appletId);
                    verifySuccessStatus(resp.response.statusCode);
                }
                catch (e) {
                    throw e;
                }
            });
            it("should chage AppletStoreStatus to deleted when it was published", async () => {
                const appletId = await util_1.TestUtil.postSampleAppletWithKey(server, dummy_user_key);
                const sbody = new api.Body7();
                sbody.appletId = appletId;
                sbody.status = api.Body7.StatusEnum.Published;
                sbody.message = "test";
                const resp = await gRootKeyApi.putAppletStoreStatus(sbody);
                power_assert_1.default.deepStrictEqual(resp.response.statusCode, 201);
                try {
                    const resp2 = await gDefaultApi.deleteApplet(appletId);
                    power_assert_1.default.deepStrictEqual(resp2.response.statusCode, 204);
                    const resp3 = await gDefaultApi.getApplet(appletId);
                    // applet logically deleted
                    power_assert_1.default.deepStrictEqual(resp3.response.statusCode, 200);
                    const resp4 = await gRootKeyApi.getAppletStoreStatus(appletId);
                    power_assert_1.default.deepStrictEqual(resp4.response.statusCode, 200);
                    power_assert_1.default.deepStrictEqual(resp4.body.status, "deleted");
                }
                catch (e) {
                    throw e;
                }
            });
            it("should delete data if AppletStoreStatus is Rejected", async () => {
                const appletId = await util_1.TestUtil.postSampleAppletWithKey(server, dummy_user_key);
                const sbody = new api.Body7();
                sbody.appletId = appletId;
                sbody.status = api.Body7.StatusEnum.Rejected;
                sbody.message = "test";
                const resp = await gRootKeyApi.putAppletStoreStatus(sbody);
                power_assert_1.default.deepStrictEqual(resp.response.statusCode, 201);
                try {
                    const resp2 = await gDefaultApi.deleteApplet(appletId);
                    verifyDeleteStatus(resp2.response.statusCode, "rejected");
                }
                catch (e) {
                    throw e;
                }
                let success = true;
                try {
                    const resp3 = await gDefaultApi.getApplet(appletId);
                    success = false;
                }
                catch (e) {
                    const eresp = e.response;
                    power_assert_1.default.deepStrictEqual(eresp.statusCode, 404);
                }
                power_assert_1.default.deepStrictEqual(success, true);
            });
            it("should change AppletStoreStatus to deleted when it is WaitingReview", async () => {
                const appletId = await util_1.TestUtil.postSampleAppletWithKey(server, dummy_user_key);
                const sbody = new api.Body7();
                sbody.appletId = appletId;
                sbody.status = api.Body7.StatusEnum.WaitingReview;
                const resp = await gRootKeyApi.putAppletStoreStatus(sbody);
                power_assert_1.default.deepStrictEqual(resp.response.statusCode, 201);
                try {
                    const resp2 = await gDefaultApi.deleteApplet(appletId);
                    power_assert_1.default.deepStrictEqual(resp2.response.statusCode, 204);
                    const resp3 = await gRootKeyApi.getAppletStoreStatus(appletId);
                    power_assert_1.default.deepStrictEqual(resp3.response.statusCode, 200);
                    // verifyDeleteStatus(resp2.response.statusCode, "waiting_review", resp3.body.status);
                    power_assert_1.default.deepStrictEqual(resp3.body.status, "deleted");
                }
                catch (e) {
                    throw e;
                }
            });
            it("should do nothing if AppletStoreStatus is deleted", async () => {
                const appletId = await util_1.TestUtil.postSampleAppletWithKey(server, dummy_user_key);
                const sbody = new api.Body7();
                sbody.appletId = appletId;
                sbody.status = api.Body7.StatusEnum.Deleted;
                const resp = await gRootKeyApi.putAppletStoreStatus(sbody);
                power_assert_1.default.deepStrictEqual(resp.response.statusCode, 201);
                try {
                    const resp2 = await gDefaultApi.deleteApplet(appletId);
                    power_assert_1.default.deepStrictEqual(resp2.response.statusCode, 204);
                }
                catch (e) {
                    throw e;
                }
            });
            it("should reject request if id is not valid", done => {
                supertest_1.default(server)
                    .delete("/api/applets/" + fakeAppletID)
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .end(done);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGV0c19pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcGxldHNfaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsbUVBQW1FO0FBRW5FLGdFQUFrQztBQUNsQywwREFBZ0M7QUFDaEMsdURBQXlDO0FBQ3pDLDZDQUE4QztBQUU5QyxxQ0FBcUM7QUFDckMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25DLG9DQUFvQztBQUVwQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzdCLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDakMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNuQyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ3pDLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDekMsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQUM3QyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBRWpDLE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxPQUEyQixFQUFFLEVBQUU7SUFDMUQsc0JBQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3hDLE1BQU0sTUFBTSxHQUFHLE9BQWlCLENBQUM7SUFDakMsc0JBQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN4QyxzQkFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3pDLENBQUMsQ0FBQztBQUVGLE1BQU0sa0JBQWtCLEdBQUcsQ0FDekIsT0FBMkIsRUFDM0IsT0FBZSxFQUNmLFdBQWdDLEVBQ2hDLEVBQUU7SUFDRixzQkFBTSxDQUFDLFlBQVksQ0FBQyxP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