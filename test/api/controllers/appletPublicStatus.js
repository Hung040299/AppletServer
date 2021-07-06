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
const fakeAppletID2 = config.fakeAppletID2;
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
         * Test GET /appletPublicStatus
         ************************************************************************/
        describe("GET /appletPublicStatus", () => {
            it("should accept request", async (done) => {
                const appletId = await util_1.TestUtil.postSampleAppletWithKey(server, dummy_user_key);
                try {
                    supertest_1.default(server)
                        .get("/api/appletPublicStatus")
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
            it("should fail due to unavailable ID", done => {
                supertest_1.default(server)
                    .get("/api/appletPublicStatus")
                    .query({ appletId: fakeAppletID2 }) // To avoid fakeAppID success in previous PUT
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .end(done);
            });
        });
        /*************************************************************************
         * Test PUT /appletPublicStatus
         ************************************************************************/
        describe("PUT /appletPublicStatus", () => {
            it("should accept request with valid parameters", async () => {
                // Should fail with 401 when actually requesting to Dodai (NODE_ENV !== 'test')
                const appletId = await util_1.TestUtil.postSampleAppletWithKey(server, dummy_user_key);
                const body = new api.Body4();
                body.appletId = appletId;
                body.status = true;
                try {
                    const resp = await gDefaultApi.putAppletPublicStatus(body);
                    power_assert_1.default.deepStrictEqual(resp.response.statusCode, 201);
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
            const exampleNGReqBody = JSON.parse(require("fs").readFileSync(`${__dirname}/testJsonFiles/appletNGPublicStatusPutReqBody.json`));
            it("should fail due to unavailable ID", done => {
                supertest_1.default(server)
                    .put("/api/appletPublicStatus")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(exampleNGReqBody)
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .end(done);
            });
        });
    }); /* users */
}); /* controllers */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGV0UHVibGljU3RhdHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwbGV0UHVibGljU3RhdHVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUNBLGdFQUFrQztBQUNsQywwREFBZ0M7QUFDaEMsdURBQXlDO0FBRXpDLDZDQUE4QztBQUU5QyxxQ0FBcUM7QUFDckMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25DLG9DQUFvQztBQUVwQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzdCLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7QUFDM0MsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQUU3QyxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtJQUMzQixnQkFBZ0I7SUFFaEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDekMsTUFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ2hCLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUN0RSxXQUFXLENBQUMsUUFBUSxHQUFHLGVBQVEsQ0FBQyxjQUFjLENBQUM7SUFDakQsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtRQUNyQjs7a0ZBRTBFO1FBQzFFLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7WUFDdkMsRUFBRSxDQUFDLHVCQUF1QixFQUFFLEtBQUssRUFBQyxJQUFJLEVBQUMsRUFBRTtnQkFDdkMsTUFBTSxRQUFRLEdBQUcsTUFBTSxlQUFRLENBQUMsdUJBQXVCLENBQ3JELE1BQU0sRUFDTixjQUFjLENBQ2YsQ0FBQztnQkFDRixJQUFJO29CQUNGLG1CQUFPLENBQUMsTUFBTSxDQUFD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