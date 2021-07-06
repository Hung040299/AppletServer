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
const dummy_user_key = config.dummy_user_key;
const server = config.server;
const version = config.version;
const root_key = config.root_key;
let gAppletId = "";
let gAppletIdiOS = "";
let gAppletIdAndroid = "";
const gDefaultApi = new api.DefaultApi();
describe("controllers", () => {
    after(async () => {
        // Delete the applets above
        await util_1.TestUtil.deleteApplet(gAppletIdiOS);
        await util_1.TestUtil.deleteApplet(gAppletIdAndroid);
        await util_1.TestUtil.deleteApplet(gAppletId);
    });
    describe("users", () => {
        /*************************************************************************
         * Test POST /applets with osType
         ************************************************************************/
        let body = {};
        before(async () => {
            gDefaultApi.setApiKey(api.DefaultApiApiKeys.JWTToken, dummy_user_key);
            gDefaultApi.basePath = util_1.TestUtil.mServerBaseUrl;
            body = JSON.parse(require("fs").readFileSync(`${__dirname}/testJsonFiles/appletsPostReqBody.json`));
        });
        // Post three new applets. It is also a unit test
        it("Post applets with osType=none should success", done => {
            body.osType = "none";
            supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key)
                .send(body)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(async (res) => {
                gAppletId = res.body.id;
                // Make sure osType is set
                await supertest_1.default(server)
                    .get(`/api/applets/${res.body.id}`)
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .expect(async (ret) => {
                    power_assert_1.default.strictEqual(ret.body.osType, "none");
                });
            })
                .end(done);
        });
        it("Post applets with osType=iOS should success", done => {
            body.osType = "iOS";
            supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key)
                .send(body)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(async (res) => {
                gAppletIdiOS = res.body.id;
                // Make sure osType is set
                await supertest_1.default(server)
                    .get(`/api/applets/${res.body.id}`)
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .expect(async (ret) => {
                    power_assert_1.default.strictEqual(ret.body.osType, "iOS");
                });
            })
                .end(done);
        });
        it("Post applets with osType=Android should success", done => {
            body.osType = "Android";
            supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key)
                .send(body)
                .expect("Content-Type", /json/)
                .expect(201)
                .expect(async (res) => {
                gAppletIdAndroid = res.body.id;
                await supertest_1.default(server)
                    .get(`/api/applets/${res.body.id}`)
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .expect(async (ret) => {
                    power_assert_1.default.strictEqual(ret.body.osType, "Android");
                });
            })
                .end(done);
        });
        it("Post applets with invalid osType should fail", done => {
            body.osType = "test";
            supertest_1.default(server)
                .post("/api/applets")
                .set("Accept", "application/json")
                .set("Authorization", dummy_user_key)
                .send(body)
                .expect("Content-Type", /json/)
                .expect(400)
                .end(done);
        });
        /*************************************************************************
         * Test GET /applets
         ************************************************************************/
        describe("GET /applets with osType", () => {
            it("should accept request with osType=none", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, osType: "none" })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request with osType=iOS", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, osType: "iOS" })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request with osType=Android", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, osType: "Android" })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should reject request with invalid osType", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, osType: "test" })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .end(done);
            });
        });
        /**************************************************
         * PUT /block/{id} with osType
         **************************************************/
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
            it("should accept request if osType is valid", done => {
                supertest_1.default(server)
                    .get(`/api/applets/${testOSTypeAppletID}`)
                    .query({ osType: api_1.OSType.OSTypeEnum.Android })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should not accept a non-matched osType", done => {
                supertest_1.default(server)
                    .get(`/api/applets/${testOSTypeAppletID}`)
                    .query({ osType: api_1.OSType.OSTypeEnum.iOS })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .end(done);
            });
        });
        /*************************************************************************
         * Test PUT /applets
         ************************************************************************/
        describe("PUT /applets", () => {
            const putBody = JSON.parse(require("fs").readFileSync(`${__dirname}/testJsonFiles/appletsPutReqBody.json`));
            it("should accept osType=iOS", done => {
                putBody.appletId = gAppletId;
                putBody.osType = "iOS";
                supertest_1.default(server)
                    .put("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(putBody)
                    .expect(201)
                    .expect("Content-Type", /json/)
                    .expect(async (res) => {
                    await supertest_1.default(server)
                        .get(`/api/applets/${res.body.id}`)
                        .set("Accept", "application/json")
                        .set("Authorization", dummy_user_key)
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .expect(async (ret) => {
                        power_assert_1.default.strictEqual(ret.body.osType, "iOS");
                    });
                })
                    .end(done);
            });
            it("should accept osType=Android", done => {
                putBody.appletId = gAppletId;
                putBody.osType = "Android";
                supertest_1.default(server)
                    .put("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(putBody)
                    .expect(201)
                    .expect("Content-Type", /json/)
                    .expect(async (res) => {
                    await supertest_1.default(server)
                        .get(`/api/applets/${res.body.id}`)
                        .set("Accept", "application/json")
                        .set("Authorization", dummy_user_key)
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .expect(async (ret) => {
                        power_assert_1.default.strictEqual(ret.body.osType, "Android");
                    });
                })
                    .end(done);
            });
            it("should accept osType=Android Specify Android", async () => {
                putBody.appletId = gAppletId;
                putBody.osType = "Android";
                let resp;
                await supertest_1.default(server)
                    .put("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(putBody)
                    .expect(201)
                    .expect("Content-Type", /json/)
                    .expect(res => {
                    resp = res;
                });
                if (resp === undefined) {
                    power_assert_1.default.fail("cannot put");
                    return;
                }
                const ares = await gDefaultApi.getApplet(resp.body.id, undefined, "Android");
                power_assert_1.default.deepStrictEqual(ares.response.statusCode, 200);
                power_assert_1.default.deepStrictEqual(ares.body.osType, "Android");
            });
            it("should accept osType=None, specify Android", async () => {
                putBody.appletId = gAppletId;
                putBody.osType = "none";
                let resp;
                await supertest_1.default(server)
                    .put("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(putBody)
                    .expect(201)
                    .expect("Content-Type", /json/)
                    .expect(async (res) => {
                    resp = res;
                });
                if (resp === undefined) {
                    power_assert_1.default.fail("cannot put");
                    return;
                }
                const ares = await gDefaultApi.getApplet(resp.body.id, undefined, "Android");
                power_assert_1.default.deepStrictEqual(ares.response.statusCode, 200);
                power_assert_1.default.deepStrictEqual(ares.body.osType, "none");
            });
            it("should accept osType=Android, specify iOS", done => {
                putBody.appletId = gAppletId;
                putBody.osType = "none";
                supertest_1.default(server)
                    .put("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(putBody)
                    .expect(201)
                    .expect("Content-Type", /json/)
                    .expect(async (res) => {
                    try {
                        await gDefaultApi.getApplet(res.body.id, undefined, "iOS");
                        power_assert_1.default.fail("not run this line");
                    }
                    catch (e) {
                        power_assert_1.default.deepStrictEqual(e.response.statusCode, 200);
                        return Promise.resolve();
                    }
                })
                    .end(done);
            });
            it("should accept osType=none", done => {
                putBody.appletId = gAppletId;
                putBody.osType = "none";
                supertest_1.default(server)
                    .put("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(putBody)
                    .expect(201)
                    .expect("Content-Type", /json/)
                    .expect(async (res) => {
                    await supertest_1.default(server)
                        .get(`/api/applets/${res.body.id}`)
                        .set("Accept", "application/json")
                        .set("Authorization", dummy_user_key)
                        .expect("Content-Type", /json/)
                        .expect(200)
                        .expect(async (ret) => {
                        power_assert_1.default.strictEqual(ret.body.osType, "none");
                    });
                })
                    .end(done);
            });
            it("should reject request with invalid osType", done => {
                putBody.appletId = gAppletId;
                putBody.osType = "test";
                supertest_1.default(server)
                    .put("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(putBody)
                    .expect(400)
                    .expect("Content-Type", /json/)
                    .end(done);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3NUeXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsib3NUeXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLG1FQUFtRTtBQUVuRSxnRUFBa0M7QUFDbEMsMERBQWdDO0FBQ2hDLHVEQUF5QztBQUN6Qyw2Q0FBOEM7QUFFOUMscUNBQXFDO0FBQ3JDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuQyxvQ0FBb0M7QUFFcEMsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQUM3QyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzdCLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDL0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNqQyxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDbkIsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQzFCLE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBRXpDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO0lBQzNCLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRTtRQUNmLDJCQUEyQjtRQUMzQixNQUFNLGVBQVEsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUMsTUFBTSxlQUFRLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUMsTUFBTSxlQUFRLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3pDLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDckI7O2tGQUUwRTtRQUMxRSxJQUFJLElBQUksR0FBUSxFQUFFLENBQUM7UUFDbkIsTUFBTSxDQUFDLEtBQUssSUFBSSxF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