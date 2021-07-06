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
const fakeAppletID = config.fakeAppletID;
const dummy_user_key = config.dummy_user_key;
const root_key = config.root_key;
describe("controllers", () => {
    /* Test entry */
    const gDefaultApi = new api.DefaultApi();
    const gRootKeyApi = new api.DefaultApi();
    before(async () => {
        gDefaultApi.setApiKey(api.DefaultApiApiKeys.JWTToken, dummy_user_key);
        gDefaultApi.basePath = util_1.TestUtil.mServerBaseUrl;
        gRootKeyApi.setApiKey(api.DefaultApiApiKeys.JWTToken, root_key);
        gRootKeyApi.basePath = util_1.TestUtil.mServerBaseUrl;
    });
    describe("users", () => {
        /*************************************************************************
         * Test GET /appletStoreStatus
         ************************************************************************/
        describe("GET /appletStoreStatus", () => {
            it("should accept request", async (done) => {
                const appletId = await util_1.TestUtil.postSampleAppletWithKey(server, dummy_user_key);
                try {
                    supertest_1.default(server)
                        .get("/api/appletStoreStatus")
                        .query({ appletId: appletId })
                        .set("Accept", "application/json")
                        .set("Authorization", root_key)
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .end(done);
                }
                catch (e) {
                    const resp = e.response;
                    power_assert_1.default.fail(resp.statusCode);
                    return;
                }
                finally {
                    await util_1.TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
                }
            });
            it("should fail due to unavailable ID", done => {
                supertest_1.default(server)
                    .get("/api/appletStoreStatus")
                    .query({ appletId: fakeAppletID })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .end(done);
            });
        });
        /*************************************************************************
         * Test POST /appletStoreStatus
         ************************************************************************/
        describe("POST /appletStoreStatus", () => {
            it("should accept request with valid parameters", async () => {
                // Should fail with 401 when actually requesting to Dodai (NODE_ENV !== 'test')a
                const appletId = await util_1.TestUtil.postSampleAppletWithKey(server, dummy_user_key);
                const body = new api.Body7();
                body.appletId = appletId;
                body.status = api.Body7.StatusEnum.Rejected;
                body.message = "test";
                try {
                    const resp = await gDefaultApi.postAppletStoreStatus(body);
                    power_assert_1.default.deepStrictEqual(resp.response.statusCode, 201);
                }
                catch (e) {
                    const resp = e.response;
                    power_assert_1.default.fail(resp.statusCode);
                }
                finally {
                    await util_1.TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
                }
            });
            it("should fail due to unavailable ID", async () => {
                // Should fail with 401 when actually requesting to Dodai (NODE_ENV !== 'test')a
                const body = new api.Body7();
                body.appletId = "500000000000000000000001";
                body.status = api.Body7.StatusEnum.Rejected;
                body.message = "test";
                try {
                    const resp = await gDefaultApi.postAppletStoreStatus(body);
                }
                catch (e) {
                    const resp = e;
                    power_assert_1.default.deepStrictEqual(resp.response.statusCode, 404);
                    return;
                }
            });
        });
        /*************************************************************************
         * Test PUT /appletStoreStatus
         ************************************************************************/
        describe("PUT /appletStoreStatus", () => {
            it("should accept request with valid parameters", async () => {
                // Should fail with 401 when actually requesting to Dodai (NODE_ENV !== 'test')
                const appletId = await util_1.TestUtil.postSampleAppletWithKey(server, dummy_user_key);
                const body = new api.Body7();
                body.appletId = appletId;
                body.status = api.Body7.StatusEnum.Rejected;
                body.message = "test";
                let resp = await gDefaultApi.postAppletStoreStatus(body);
                power_assert_1.default.deepStrictEqual(resp.response.statusCode, 201);
                try {
                    // release must not be set
                    let ares = await gDefaultApi.listApplets("1.0.0", [appletId]);
                    power_assert_1.default.deepStrictEqual(ares.response.statusCode, 200);
                    power_assert_1.default.notDeepStrictEqual(ares.body.applets, undefined);
                    let list = ares.body.applets;
                    power_assert_1.default.deepStrictEqual(list.length, 1);
                    power_assert_1.default.deepStrictEqual(list[0].appletInfo.release, undefined);
                    const sbody = new api.Body6();
                    sbody.appletId = appletId;
                    sbody.status = api.Body7.StatusEnum.Published;
                    sbody.message = "test";
                    resp = await gRootKeyApi.putAppletStoreStatus(sbody);
                    const res = JSON.parse(JSON.stringify(resp.response));
                    const date = Date.parse(res.body.release);
                    power_assert_1.default.notDeepStrictEqual(date, NaN); // Date must valid
                    power_assert_1.default.deepStrictEqual(resp.response.statusCode, 201);
                    // release must be set
                    ares = await gDefaultApi.listApplets("1.0.0", [appletId]);
                    power_assert_1.default.deepStrictEqual(ares.response.statusCode, 200);
                    power_assert_1.default.notDeepStrictEqual(ares.body.applets, undefined);
                    list = ares.body.applets;
                    power_assert_1.default.deepStrictEqual(list.length, 1);
                    power_assert_1.default.notDeepStrictEqual(list[0].appletInfo.release, undefined);
                    power_assert_1.default.deepStrictEqual(util_1.TestUtil.isISO8601String(list[0].appletInfo.release), true);
                }
                catch (e) {
                    const eresp = e.response;
                    power_assert_1.default.fail(eresp.statusCode);
                }
                finally {
                    await util_1.TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
                }
            });
            it("should fail due to unavailable ID", async () => {
                // Should fail with 401 when actually requesting to Dodai (NODE_ENV !== 'test')
                const body = new api.Body6();
                body.appletId = "500000000000000000000001";
                body.status = api.Body6.StatusEnum.Rejected;
                body.message = "test";
                try {
                    const resp = await gRootKeyApi.putAppletStoreStatus(body);
                }
                catch (e) {
                    const resp = e;
                    power_assert_1.default.deepStrictEqual(resp.response.statusCode, 404);
                    return;
                }
            });
        });
    }); /* users */
}); /* controllers */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGV0U3RvcmVTdGF0dXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcHBsZXRTdG9yZVN0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSxnRUFBa0M7QUFDbEMsMERBQWdDO0FBQ2hDLHVEQUF5QztBQUN6Qyw2Q0FBOEM7QUFFOUMscUNBQXFDO0FBQ3JDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuQyxvQ0FBb0M7QUFFcEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUM3QixNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ3pDLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUM7QUFDN0MsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUVqQyxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtJQUMzQixnQkFBZ0I7SUFDaEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDekMsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDekMsTUFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ2hCLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUN0RSxXQUFXLENBQUMsUUFBUSxHQUFHLGVBQVEsQ0FBQyxjQUFjLENBQUM7UUFFL0MsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2hFLFdBQVcsQ0FBQyxRQUFRLEdBQUcsZUFBUSxDQUFDLGNBQWMsQ0FBQztJQUNqRCxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ3JCOztr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