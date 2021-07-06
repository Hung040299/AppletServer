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
const assert_1 = require("assert");
/* tslint:disable: no-var-requires */
const config = require("./config");
/* tslint:enable: no-var-requires */
const server = config.server;
const fakeAppletID = config.fakeAppletID;
const dummy_user_key = config.dummy_user_key;
describe("controllers", () => {
    /* Test entry */
    const gDefaultApi = new api.DefaultApi();
    before(async () => {
        gDefaultApi.setApiKey(api.DefaultApiApiKeys.JWTToken, dummy_user_key);
        gDefaultApi.basePath = util_1.TestUtil.mServerBaseUrl;
    });
    describe("users", () => {
        /*************************************************************************
         * Test GET /appletGoodNum
         ************************************************************************/
        describe("GET /appletGoodNum", () => {
            it("should accept request", async (done) => {
                const appletId = await util_1.TestUtil.postSampleAppletWithKey(server, dummy_user_key);
                try {
                    supertest_1.default(server)
                        .get("/api/appletGoodNum")
                        .query({ appletId: appletId })
                        .set("Accept", "application/json")
                        .set("Authorization", dummy_user_key)
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
            it("should not accept a non existed appletID request", done => {
                supertest_1.default(server)
                    .get("/api/appletGoodNum")
                    .query({ appletId: fakeAppletID })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .end(done);
            });
        });
        /*************************************************************************
         * Test PUT /appletGoodNum
         ************************************************************************/
        describe("PUT /appletGoodNum", () => {
            it("should accept request with valid parameters", async () => {
                const appletId = await util_1.TestUtil.postSampleAppletWithKey(server, dummy_user_key);
                const body = new api.Body2();
                body.appletId = appletId;
                body.changeNum = 45;
                try {
                    const resp = await gDefaultApi.putAppletGoodNum(body);
                    assert_1.fail("putAppletGoodNum should not be succeeded");
                }
                catch (e) {
                    power_assert_1.default.deepStrictEqual(e.response.statusCode, 404);
                }
                finally {
                    await util_1.TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
                }
            });
            it("should return 400 if applet ID is not found", async () => {
                const appletId = "0000895b24000025007e9a10"; // not exist
                const body = new api.Body2();
                body.appletId = appletId;
                body.changeNum = 45;
                try {
                    await gDefaultApi.putAppletGoodNum(body);
                }
                catch (e) {
                    const resp = e.response;
                    power_assert_1.default.deepStrictEqual(resp.statusCode, 404);
                    return;
                }
                power_assert_1.default.fail("invalid success");
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGV0R29vZE51bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcGxldEdvb2ROdW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQ0EsZ0VBQWtDO0FBQ2xDLDBEQUFnQztBQUNoQyx1REFBeUM7QUFFekMsNkNBQThDO0FBQzlDLG1DQUE4QjtBQUU5QixxQ0FBcUM7QUFDckMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25DLG9DQUFvQztBQUVwQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzdCLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDekMsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQUU3QyxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtJQUMzQixnQkFBZ0I7SUFFaEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDekMsTUFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ2hCLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUN0RSxXQUFXLENBQUMsUUFBUSxHQUFHLGVBQVEsQ0FBQyxjQUFjLENBQUM7SUFDakQsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtRQUNyQjs7a0ZBRTBFO1FBQzFFLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7WUFDbEMsRUFBRSxDQUFDLHVCQUF1QixFQUFFLEtBQUssRUFBQyxJQUFJLEVBQUMsRUFBRTtnQkFDdkMsTUFBTSxRQUFRLEdBQUcsTUFBTSxlQUFRLENBQUMsdUJBQXVCLENBQ3JELE1BQU0sRUFDTixjQUFjLENBQ2YsQ0FBQztnQkFDRixJQUFJO29CQUNGLG1CQUFPLENBQUMsTUFBTSxD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