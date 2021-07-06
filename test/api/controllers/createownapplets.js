"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const power_assert_1 = require("power-assert");
const power_assert_2 = __importDefault(require("power-assert"));
const supertest_1 = __importDefault(require("supertest"));
const api_1 = require("../../utility/api");
const util_1 = require("../../utility/util");
const config = require("./config");
const server = config.server;
const dummy_user_key = config.dummy_user_key;
describe("controllers", () => {
    /* Test entry */
    const gDefaultApi = new api_1.DefaultApi();
    const gRootkeyApi = new api_1.DefaultApi();
    before(async () => {
        gDefaultApi.setApiKey(api_1.DefaultApiApiKeys.JWTToken, dummy_user_key);
        gDefaultApi.basePath = util_1.TestUtil.mServerBaseUrl;
        gRootkeyApi.setApiKey(api_1.DefaultApiApiKeys.JWTToken, config.root_key);
        gRootkeyApi.basePath = util_1.TestUtil.mServerBaseUrl;
    });
    describe("users", () => {
        /*************************************************************************
         * Test GET /createownapplets
         ************************************************************************/
        describe("GET /createownapplets", () => {
            it("should accept request if id is valid", done => {
                supertest_1.default(server)
                    .get("/api/createownapplets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request if storeStatus is published", done => {
                supertest_1.default(server)
                    .get("/api/createownapplets")
                    .query({ storeStatus: "published" })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request if storeStatus is waiting_review", done => {
                supertest_1.default(server)
                    .get("/api/createownapplets")
                    .query({ storeStatus: "waiting_review" })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request if storeStatus is rejected", done => {
                supertest_1.default(server)
                    .get("/api/createownapplets")
                    .query({ storeStatus: "rejected" })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request if publicStatus is rejected", done => {
                supertest_1.default(server)
                    .get("/api/createownapplets")
                    .query({ publicStatus: true })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("acsmine #177237. logically deleted applets does not show", async () => {
                const appletId = await util_1.TestUtil.postSampleApplet(server);
                try {
                    const body = new api_1.Body6();
                    body.appletId = appletId;
                    body.status = api_1.Body6.StatusEnum.Deleted;
                    body.message = "delete test";
                    await gRootkeyApi.putAppletStoreStatus(body);
                    const resp = await gDefaultApi.getMyApplets(undefined, undefined);
                    power_assert_2.default.deepStrictEqual(resp.response.statusCode, 200);
                    power_assert_2.default.notDeepStrictEqual(resp.body.applets, undefined);
                    const applets = resp.body.applets;
                    const targetApplet = applets.find(applet => {
                        return applet.id === appletId;
                    });
                    power_assert_2.default.deepStrictEqual(targetApplet, undefined);
                }
                catch (e) {
                    power_assert_1.fail(e);
                }
                finally {
                    util_1.TestUtil.deleteApplet(appletId);
                }
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlb3duYXBwbGV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNyZWF0ZW93bmFwcGxldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwrQ0FBb0M7QUFDcEMsZ0VBQWtDO0FBQ2xDLDBEQUFnQztBQUNoQywyQ0FLMkI7QUFDM0IsNkNBQThDO0FBRTlDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUVuQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzdCLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUM7QUFFN0MsUUFBUSxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7SUFDM0IsZ0JBQWdCO0lBQ2hCLE1BQU0sV0FBVyxHQUFHLElBQUksZ0JBQVUsRUFBRSxDQUFDO0lBQ3JDLE1BQU0sV0FBVyxHQUFHLElBQUksZ0JBQVUsRUFBRSxDQUFDO0lBRXJDLE1BQU0sQ0FBQyxLQUFLLElBQUksRUFBRTtRQUNoQixXQUFXLENBQUMsU0FBUyxDQUFDLHVCQUFpQixDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNsRSxXQUFXLENBQUMsUUFBUSxHQUFHLGVBQVEsQ0FBQyxjQUFjLENBQUM7UUFFL0MsV0FBVyxDQUFDLFNBQVMsQ0FBQyx1QkFBaUIsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25FLFdBQVcsQ0FBQyxRQUFRLEdBQUcsZUFBUSxDQUFDLGNBQWMsQ0FBQztJQUNqRCxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ3JCOztrRkFFMEU7UUFDMUUsUUFBUSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtZQUNyQyxFQUFFLENBQUMsc0NBQXNDLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ2hELG1CQUFPLENBQUMsTUFBTSxDQUFDO3FCQUNaLEdBQUcsQ0FBQyx1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