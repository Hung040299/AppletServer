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
const moment_1 = __importDefault(require("moment"));
const power_assert_1 = __importStar(require("power-assert"));
const supertest_1 = __importDefault(require("supertest"));
const util_1 = require("../../utility/util");
/* tslint:disable: no-var-requires */
const config = require("./config");
/* tslint:enable: no-var-requires */
const server = config.server;
const appletID4GET = config.appletID4GET;
const appletID4GET2 = config.appletID4GET2;
const toolID = config.toolID;
const categoryID = config.categoryID;
const deviceID = config.deviceID;
const deviceID2 = config.deviceID2;
const vendorID = config.vendorID;
const version = config.version;
const ownerID = config.ownerID;
const ownerID2 = config.ownerID2;
const root_key = config.root_key;
const userKey = config.dummy_user_key;
const limit = config.limit;
describe("controllers", () => {
    describe("users", () => {
        /*************************************************************************
         * Test GET /admin/applets
         ************************************************************************/
        describe("GET /admin/applets", () => {
            it("it should accept request with personalUseFlg is true", async () => {
                const deviceId = "getAppletTestPersonalUseBody201912";
                // Create an applet with special device Id
                const appletPostBody = util_1.TestUtil.getSamplePostApplet();
                appletPostBody.deviceId = deviceId;
                appletPostBody["personalUseFlg"] = true;
                let resp = await supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", userKey)
                    .send(appletPostBody);
                power_assert_1.default.deepStrictEqual(resp.status, 201);
                const appletId = resp.body.id;
                try {
                    // Check if appletSuspend is added to the created applet
                    resp = await supertest_1.default(server)
                        .get("/api/admin/applets")
                        .query({ version: version, personalUseFlg: true })
                        .set("Accept", "application/json")
                        .set("Authorization", root_key)
                        .expect("Content-Type", /json/)
                        .expect(200);
                    power_assert_1.default.deepStrictEqual(resp.status, 200);
                    const applets = resp.body.applets;
                    let applet;
                    for (applet of applets) {
                        //console.log(applet.applet);
                        const personalUseFlg = applet.applet.personalUseFlg;
                        power_assert_1.deepStrictEqual(personalUseFlg, true);
                    }
                }
                catch (e) {
                    console.log(e);
                    throw e;
                }
                finally {
                    await util_1.TestUtil.deleteApplet(appletId);
                }
            });
            it("it should accept request with personalUseFlg is false", async () => {
                const deviceId = "getAppletTestPersonalUseBody201912";
                // Create an applet with special device Id
                const appletPostBody = util_1.TestUtil.getSamplePostApplet();
                appletPostBody.deviceId = deviceId;
                appletPostBody["personalUseFlg"] = false;
                let resp = await supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", userKey)
                    .send(appletPostBody);
                power_assert_1.default.deepStrictEqual(resp.status, 201);
                const appletId = resp.body.id;
                try {
                    // Check if appletSuspend is added to the created applet
                    resp = await supertest_1.default(server)
                        .get("/api/admin/applets")
                        .query({ version: version, personalUseFlg: false })
                        .set("Accept", "application/json")
                        .set("Authorization", root_key)
                        .expect("Content-Type", /json/)
                        .expect(200);
                    power_assert_1.default.deepStrictEqual(resp.status, 200);
                    const applets = resp.body.applets;
                    let applet;
                    for (applet of applets) {
                        //console.log(applet.applet);
                        const personalUseFlg = applet.applet.personalUseFlg;
                        power_assert_1.deepStrictEqual(typeof personalUseFlg === "undefined" || personalUseFlg === false, true);
                    }
                }
                catch (e) {
                    console.log(e);
                    throw e;
                }
                finally {
                    await util_1.TestUtil.deleteApplet(appletId);
                }
            });
            it("it should accept request with suspendFlg is true", async () => {
                const deviceId = "getAppletTestSuspendBody201908";
                const putAppletSuspendBody = {
                    deviceId: `${deviceId}`,
                    deviceSuspendFlg: true,
                    deviceSuspendCode: "900"
                };
                // Create an applet with special device Id
                const appletPostBody = util_1.TestUtil.getSamplePostApplet();
                appletPostBody.deviceId = deviceId;
                let resp = await supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", userKey)
                    .send(appletPostBody);
                power_assert_1.default.deepStrictEqual(resp.status, 201);
                const appletId = resp.body.id;
                try {
                    // Apply appletSuspend
                    resp = await supertest_1.default(server)
                        .put("/api/admin/appletSuspend")
                        .set("Accept", "application/json")
                        .set("Authorization", root_key)
                        .send(putAppletSuspendBody)
                        .expect("Content-Type", /json/);
                    power_assert_1.default.deepEqual(resp.status, 201);
                    // Check if appletSuspend is added to the created applet
                    resp = await supertest_1.default(server)
                        .get("/api/admin/applets")
                        .query({ version: version, suspendFlg: true })
                        .set("Accept", "application/json")
                        .set("Authorization", root_key)
                        .expect("Content-Type", /json/)
                        .expect(200);
                    power_assert_1.default.deepStrictEqual(resp.status, 200);
                    const applets = resp.body.applets;
                    let appletInfo;
                    for (appletInfo of applets) {
                        const appletSuspend = appletInfo.applet.AppletSuspend;
                        power_assert_1.deepStrictEqual((typeof appletSuspend.device !== "undefined" &&
                            appletSuspend.device.deviceSuspendFlg) ||
                            (typeof appletSuspend.action !== "undefined" &&
                                appletSuspend.action.blockSuspendFlg) ||
                            (typeof appletSuspend.trigger !== "undefined" &&
                                appletSuspend.trigger.blockSuspendFlg) ||
                            (typeof appletSuspend.service !== "undefined" &&
                                appletSuspend.service.blockSuspendFlg), true);
                    }
                }
                catch (e) {
                    console.log(e);
                    throw e;
                }
                finally {
                    await util_1.TestUtil.deleteApplet(appletId);
                }
            });
            it("it should accept request with suspendFlg is false", async () => {
                const deviceId = "getAppletTestSuspendBody201908";
                const putAppletSuspendBody = {
                    deviceId: `${deviceId}`,
                    deviceSuspendFlg: true,
                    deviceSuspendCode: "900"
                };
                // Create an applet with special device Id
                const appletPostBody = util_1.TestUtil.getSamplePostApplet();
                appletPostBody.deviceId = deviceId;
                let resp = await supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", userKey)
                    .send(appletPostBody);
                power_assert_1.default.deepStrictEqual(resp.status, 201);
                const appletId = resp.body.id;
                try {
                    // Apply appletSuspend
                    resp = await supertest_1.default(server)
                        .put("/api/admin/appletSuspend")
                        .set("Accept", "application/json")
                        .set("Authorization", root_key)
                        .send(putAppletSuspendBody)
                        .expect("Content-Type", /json/);
                    power_assert_1.default.deepEqual(resp.status, 201);
                    // Check if appletSuspend is added to the created applet
                    resp = await supertest_1.default(server)
                        .get("/api/admin/applets")
                        .query({ version: version, suspendFlg: false })
                        .set("Accept", "application/json")
                        .set("Authorization", root_key)
                        .expect("Content-Type", /json/)
                        .expect(200);
                    power_assert_1.default.deepStrictEqual(resp.status, 200);
                    const applets = resp.body.applets;
                    let appletInfo;
                    for (appletInfo of applets) {
                        const appletSuspend = appletInfo.applet.AppletSuspend;
                        if (appletSuspend) {
                            if (appletSuspend.device) {
                                power_assert_1.deepStrictEqual(appletSuspend.device.deviceSuspendFlg, false);
                            }
                            if (appletSuspend.action) {
                                power_assert_1.deepStrictEqual(appletSuspend.action.blockSuspendFlg, false);
                            }
                            if (appletSuspend.trigger) {
                                power_assert_1.deepStrictEqual(appletSuspend.trigger.blockSuspendFlg, false);
                            }
                            if (appletSuspend.service) {
                                power_assert_1.deepStrictEqual(appletSuspend.service.blockSuspendFlg, false);
                            }
                        }
                    }
                }
                catch (e) {
                    console.log(e);
                    throw e;
                }
                finally {
                    await util_1.TestUtil.deleteApplet(appletId);
                }
            });
            it("should accept request", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a vaild applet ID", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, appletId: appletID4GET })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a more than one applet IDs", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, appletId: [appletID4GET, appletID4GET2] })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a excluded applet ID", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, excludeAppletId: appletID4GET })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .expect(async (res) => {
                    /* Verify if the ID is exclude */
                    const applets = JSON.parse(JSON.stringify(res.body));
                    // tslint:disable-next-line: prefer-for-of
                    for (let i = 0; i < applets.length; i++) {
                        if (applets[i].id === appletID4GET) {
                            power_assert_1.default.fail("Exclude applet ID fail");
                        }
                    }
                })
                    .end(done);
            });
            it("should accept request exclude more than one applet IDs", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({
                    version: version,
                    excludeAppletId: [appletID4GET, appletID4GET2]
                })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .expect(res => {
                    /* Verify if the ID is exclude */
                    const applets = JSON.parse(JSON.stringify(res.body));
                    // tslint:disable-next-line: prefer-for-of
                    for (let i = 0; i < applets.length; i++) {
                        if (applets[i].id === appletID4GET ||
                            applets[i].id === appletID4GET2) {
                            power_assert_1.default.fail("Exclude applet ID fail");
                        }
                    }
                })
                    .end(done);
            });
            it("should accept request a valid tool ID", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, toolId: toolID })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request with multiple valid tool ID", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, toolId: [toolID, appletID4GET2] })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a valid categoryId ID", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, categoryId: categoryID })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            const catID2 = "cat_0016";
            it("should accept request with multiple valid categoryId ID", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, categoryId: [categoryID, catID2] })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a vaild device ID", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, deviceId: deviceID })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a more than one device IDs", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, deviceId: [deviceID, deviceID2] })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a vaild vendor ID", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, vendorId: vendorID })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a vaild version", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a storeStatus are published", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, storeStatus: "published" })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a storeStatus are waiting_review", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, storeStatus: "waiting_review" })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a storeStatus are rejected", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, storeStatus: "rejected" })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a valid ownerID", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, ownerId: ownerID })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request multiple ownerIDs", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, ownerId: [ownerID, ownerID2] })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            const title1 = "説明";
            const lang1 = "ja";
            it("should accept request with a title", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, title: title1, lang: lang1 })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should sort by like number", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, sortBy: "likeNum" })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .expect(res => {
                    const appObj = res.body;
                    const firstLikeNum = Number(appObj.applets[0].appletInfo.likeNum);
                    const lastLikeNum = Number(appObj.applets[appObj.applets.length - 1].appletInfo.likeNum);
                    power_assert_1.default.deepStrictEqual(firstLikeNum >= lastLikeNum, true, `Wrong sort order: ${firstLikeNum} > ${lastLikeNum}`);
                })
                    .end(done);
            });
            it("should sort by release date", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, sortBy: "releaseDate" })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .expect(res => {
                    const appObj = res.body;
                    let firstReleaseDate = 0;
                    let lastReleaseDate = 0;
                    if (appObj.applets[0].appletInfo.release) {
                        firstReleaseDate = moment_1.default
                            .utc(appObj.applets[0].appletInfo.release)
                            .unix();
                    }
                    if (appObj.applets[appObj.applets.length - 1].appletInfo.release) {
                        lastReleaseDate = moment_1.default
                            .utc(appObj.applets[appObj.applets.length - 1].appletInfo.release)
                            .unix();
                    }
                    power_assert_1.default.deepStrictEqual(firstReleaseDate >= lastReleaseDate, true, `Wrong sort order: ${appObj.applets[0].appletInfo.release} > ${appObj.applets[appObj.applets.length - 1].appletInfo.release}`);
                })
                    .end(done);
            });
            it("should accept a limited number of request body", done => {
                supertest_1.default(server)
                    .get("/api/admin/applets")
                    .query({ version: version, limit: limit })
                    .set("Accept", "application/json")
                    .set("Authorization", root_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .expect(async (ret) => {
                    power_assert_1.default.strictEqual(ret.body.length, limit);
                })
                    .end(done);
            });
        });
    });
    /*************************************************************************
     * Test GET /admin/applets with osType
     ************************************************************************/
    describe("GET /admin/applets with osType", () => {
        it("should accept request with osType=none", done => {
            supertest_1.default(server)
                .get("/api/admin/applets")
                .query({ version: version, osType: "none" })
                .set("Accept", "application/json")
                .set("Authorization", root_key)
                .expect("Content-Type", /json/)
                .expect(200)
                .end(done);
        });
        it("should accept request with osType=iOS", done => {
            supertest_1.default(server)
                .get("/api/admin/applets")
                .query({ version: version, osType: "iOS" })
                .set("Accept", "application/json")
                .set("Authorization", root_key)
                .expect("Content-Type", /json/)
                .expect(200)
                .end(done);
        });
        it("should accept request with osType=Android", done => {
            supertest_1.default(server)
                .get("/api/admin/applets")
                .query({ version: version, osType: "Android" })
                .set("Accept", "application/json")
                .set("Authorization", root_key)
                .expect("Content-Type", /json/)
                .expect(200)
                .end(done);
        });
        it("should reject request with invalid osType", done => {
            supertest_1.default(server)
                .get("/api/admin/applets")
                .query({ version: version, osType: "test" })
                .set("Accept", "application/json")
                .set("Authorization", root_key)
                .expect("Content-Type", /json/)
                .expect(400)
                .end(done);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW5fYXBwbGV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFkbWluX2FwcGxldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQTRCO0FBQzVCLDZEQUF1RDtBQUN2RCwwREFBZ0M7QUFDaEMsNkNBQThDO0FBQzlDLHFDQUFxQztBQUNyQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbkMsb0NBQW9DO0FBRXBDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDN0IsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN6QyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO0FBQzNDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDN0IsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztBQUNyQyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2pDLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDbkMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNqQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQy9CLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDL0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNqQyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2pDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUM7QUFDdEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUUzQixRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtJQUMzQixRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtRQUNyQjs7a0ZBRTBFO1FBQzFFLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7WUFDbEMsRUFBRSxDQUFDLHNEQUFzRCxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUNwRSxNQUFNLFFBQVEsR0FBRyxvQ0FBb0MsQ0FBQztnQkFFdEQsMENBQTBDO2dCQUMxQyxNQUFNLGNBQWMsR0FBRyxlQUFRLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDdEQsY0FBYyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7Z0JBQ25DLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLElBQUksQ0FBQztnQkFDeEMsSUFBSSxJQUFJLEdBQUcsTUFBTSxtQkFBTyxDQUFDLE1BQU0sQ0FBQztxQkFDN0IsSUFBSSxDQUFDLGNBQWMsQ0FBQztxQkFDcEIsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQztxQkFDakMsR0FBRyxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUM7cUJBQzdCLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDeEIsc0JBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDekMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBRTlCLElBQUk7b0JBQ0Ysd0RBQXdEO29CQUN4RCxJQUFJLEdBQUcsTUFBTSxtQkFBTyxDQUFDLE1BQU0sQ0FBQzt5QkFDekIsR0FBRyxDQUFDLG9CQUFvQixDQUFDO3lCQUN6QixLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsQ0FBQzt5QkFDakQsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQzt5QkFDakMsR0FBRyxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUM7eUJBQzlCLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO3lCQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2Ysc0JBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDekMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7b0JBQ2xDLElBQUksTUFBVyxDQUFDO29CQUNoQixLQUFLLE1BQU0sSUFBSSxPQUFPLEVBQUU7d0JBQ3RCLDZCQUE2Qjt3QkFDN0IsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7d0JBQ3BELDhCQUFlLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO3FCQUN2QztpQkFDRjtnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNmLE1BQU0sQ0FBQyxDQUFDO2lCQUNUO3dCQUFTO29CQUNSLE1BQU0sZUFBUSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDdkM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1REFBdUQsRUFBRSxLQUFLLElBQUksRUFBRTtnQkFDckUsTUFBTSxRQUFRLEdBQUcsb0NBQW9DLENBQUM7Z0JBRXRELDBDQUEwQztnQkFDMUMsTUFBTSxjQUFjLEdBQUcsZUFBUSxDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQ3RELGNBQWMsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO2dCQUNuQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxLQUFLLENBQUM7Z0JBQ3pDLElBQUksSUFBSSxHQUFHLE1BQU0sbUJBQU8sQ0FBQyxNQUFNLENBQUM7cUJBQzdCLElBQUksQ0FBQyxjQUFjLENBQUM7cUJBQ3BCLEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUM7cUJBQ2pDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDO3FCQUM3QixJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQ3hCLHNCQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3pDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUU5QixJQUFJO29CQUNGLHdEQUF3RDtvQkFDeEQsSUFBSSxHQUFHLE1BQU0sbUJBQU8sQ0FBQyxNQUFNLENBQUM7eUJBQ3pCLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQzt5QkFDekIsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLENBQUM7eUJBQ2xELEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUM7eUJBQ2pDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO3lCQUM5QixNQUFNLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQzt5QkFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNmLHNCQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQ3pDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO29CQUNsQyxJQUFJLE1BQVcsQ0FBQztvQkFDaEIsS0FBSyxNQUFNLElBQUksT0FBTyxFQUFFO3dCQUN0Qiw2QkFBNkI7d0JBQzdCLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDO3dCQUNwRCw4QkFBZSxDQUNiLE9BQU8sY0FBYyxLQUFLLFdBQVcsSUFBSSxjQUFjLEtBQUssS0FBSyxFQUNqRSxJQUFJLENBQ0wsQ0FBQztxQkFDSDtpQkFDRjtnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNmLE1BQU0sQ0FBQyxDQUFDO2lCQUNUO3dCQUFTO29CQUNSLE1BQU0sZUFBUSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDdkM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxrREFBa0QsRUFBRSxLQUFLLElBQUksRUFBRTtnQkFDaEUsTUFBTSxRQUFRLEdBQUcsZ0NBQWdDLENBQUM7Z0JBQ2xELE1BQU0sb0JBQW9CLEdBQUc7b0JBQzNCLFFBQVEsRUFBRSxHQUFHLFFBQVEsRUFBRTtvQkFDdkIsZ0JBQWdCLEVBQUUsSUFBSTtvQkFDdEIsaUJBQWlCLEVBQUUsS0FBSztpQkFDekIsQ0FBQztnQkFFRiwwQ0FBMEM7Z0JBQzFDLE1BQU0sY0FBYyxHQUFHLGVBQVEsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUN0RCxjQUFjLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztnQkFDbkMsSUFBSSxJQUFJLEdBQUcsTUFBTSxtQkFBTyxDQUFDLE1BQU0sQ0FBQztxQkFDN0IsSUFBSSxDQUFDLGNBQWMsQ0FBQztxQkFDcEIsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQztxQkFDakMsR0FBRyxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUM7cUJBQzdCLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDeEIsc0JBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDekMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBRTlCLElBQUk7b0JBQ0Ysc0JBQXNCO29CQUN0QixJQUFJLEdBQUcsTUFBTSxtQkFBTyxDQUFDLE1BQU0sQ0FBQzt5QkFDekIsR0FBRyxDQUFDLDBCQUEwQixDQUFDO3lCQUMvQixHQUFHLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDO3lCQUNqQyxHQUFHLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQzt5QkFDOUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDO3lCQUMxQixNQUFNLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUNsQyxzQkFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUVuQyx3REFBd0Q7b0JBQ3hELElBQUksR0FBRyxNQUFNLG1CQUFPLENBQUMsTUFBTSxDQUFDO3lCQUN6QixHQUFHLENBQUMsb0JBQW9CLENBQUM7eUJBQ3pCLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDO3lCQUM3QyxHQUFHLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDO3lCQUNqQyxHQUFHLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQzt5QkFDOUIsTUFBTSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUM7eUJBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDZixzQkFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUN6QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztvQkFDbEMsSUFBSSxVQUFlLENBQUM7b0JBQ3BCLEtBQUssVUFBVSxJQUFJLE9BQU8sRUFBRTt3QkFDMUIsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7d0JBRXRELDhCQUFlLENBQ2IsQ0FBQyxPQUFPLGFBQWEsQ0FBQyxNQUFNLEtBQUssV0FBVzs0QkFDMUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQzs0QkFDdEMsQ0FBQyxPQUFPLGFBQWEsQ0FBQyxNQUFNLEtBQUssV0FBVztnQ0FDMUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUM7NEJBQ3ZDLENBQUMsT0FBTyxhQUFhLENBQUMsT0FBTyxLQUFLLFdBQVc7Z0NBQzNDLGFBQWEsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDOzRCQUN4QyxDQUFDLE9BQU8sYUFBYSxDQUFDLE9BQU8sS0FBSyxXQUFXO2dDQUMzQyxhQUFhLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUMxQyxJQUFJLENBQ0wsQ0FBQztxQkFDSDtpQkFDRjtnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDVixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNmLE1BQU0sQ0FBQyxDQUFDO2lCQUNUO3dCQUFTO29CQUNSLE1BQU0sZUFBUSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDdkM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxtREFBbUQsRUFBRSxLQUFLLElBQUksRUFBRTtnQkFDakUsTUFBTSxRQUFRLEdBQUcsZ0NBQWdDLENBQUM7Z0JBQ2xELE1BQU0sb0JBQW9CLEdBQUc7b0JBQzNCLFFBQVEsRUFBRSxHQUFHLFFBQVEsRUFBRTtvQkFDdkIsZ0JBQWdCLEVBQUUsSUFBSTtvQkFDdEIsaUJBQWlCLEVBQUUsS0FBSztpQkFDekIsQ0FBQztnQkFFRiwwQ0FBMEM7Z0JBQzFDLE1BQU0sY0FBYyxHQUFHLGVBQVEsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUN0RCxjQUFjLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztnQkFDbkMsSUFBSSxJQUFJLEdBQUcsTUFBTSxtQkFBTyxDQUFDLE1BQU0sQ0FBQztxQkFDN0IsSUFBSSxDQUFDLGNBQWMsQ0FBQztxQkFDcEIsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQztxQkFDakMsR0FBRyxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUM7cUJBQzdCLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDeEIsc0JBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDekMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBRTlCLElBQUk7b0JBQ0Ysc0JBQXNCO29CQUN0QixJQUFJLEdBQUcsTUFBTSxtQkFBTyxDQUFDLE1BQU0sQ0FBQzt5QkFDekIsR0FBRyxDQUFDLDBCQUEwQixDQUFDO3lCQUMvQixHQUFHLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDO3lCQUNqQyxHQUFHLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQzt5QkFDOUIsSUFBSSxDQUFDLG9CQUFvQixDQUFDO3lCQUMxQixNQUFNLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUNsQyxzQkFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUVuQyx3REFBd0Q7b0JBQ3hELElBQUksR0FBRyxNQUFNLG1CQUFPLENBQUMsTUFBTSxDQUFDO3lCQUN6QixHQUFHLENBQUMsb0JBQW9CLENBQUM7eUJBQ3pCLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDO3lCQUM5QyxHQUFHLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDO3lCQUNqQyxHQUFHLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQzt5QkFDOUIsTUFBTSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUM7eUJBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDZixzQkFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUN6QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztvQkFDbEMsSUFBSSxVQUFlLENBQUM7b0JBQ3BCLEtBQUssVUFBVSxJQUFJLE9BQU8sRUFBRTt3QkFDMUIsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7d0JBRXRELElBQUksYUFBYSxFQUFFOzRCQUNqQixJQUFJLGFBQWEsQ0FBQyxNQUFNLEVBQUU7Z0NBQ3hCLDhCQUFlLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQzs2QkFDL0Q7NEJBQ0QsSUFBSSxhQUFhLENBQUMsTUFBTSxFQUFFO2dDQUN4Qiw4QkFBZSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDOzZCQUM5RDs0QkFDRCxJQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUU7Z0NBQ3pCLDhCQUFlLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7NkJBQy9EOzRCQUNELElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRTtnQ0FDekIsOEJBQWUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQzs2QkFDL0Q7eUJBQ0Y7cUJBQ0Y7aUJBQ0Y7Z0JBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDZixNQUFNLENBQUMsQ0FBQztpQkFDVDt3QkFBUztvQkFDUixNQUFNLGVBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ3ZDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ2pDLG1CQUFPLENBQUMsTUFBTSxDQUFDO3FCQUNaLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztxQkFDekIsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDO3FCQUMzQixHQUFHLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDO3FCQUNqQyxHQUFHLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQztxQkFDOUIsTUFBTSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUM7cUJBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUM7cUJBQ1gsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMseUNBQXlDLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ25ELG1CQUFPLENBQUMsTUFBTSxDQUFDO3FCQUNaLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztxQkFDekIsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLENBQUM7cUJBQ25ELEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUM7cUJBQ2pDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO3FCQUM5QixNQUFNLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQztxQkFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQztxQkFDWCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxrREFBa0QsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDNUQsbUJBQU8sQ0FBQyxNQUFNLENBQUM7cUJBQ1osR0FBRyxDQUFDLG9CQUFvQixDQUFDO3FCQUN6QixLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsRUFBRSxDQUFDO3FCQUNwRSxHQUFHLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDO3FCQUNqQyxHQUFHLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQztxQkFDOUIsTUFBTSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUM7cUJBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUM7cUJBQ1gsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsNENBQTRDLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RELG1CQUFPLENBQUMsTUFBTSxDQUFDO3FCQUNaLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztxQkFDekIsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFFLENBQUM7cUJBQzFELEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUM7cUJBQ2pDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO3FCQUM5QixNQUFNLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQztxQkFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQztxQkFDWCxNQUFNLENBQUMsS0FBSyxFQUFDLEdBQUcsRUFBQyxFQUFFO29CQUNsQixpQ0FBaUM7b0JBQ2pDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDckQsMENBQTBDO29CQUMxQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDdkMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLFlBQVksRUFBRTs0QkFDbEMsc0JBQU0sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQzt5QkFDdkM7cUJBQ0Y7Z0JBQ0gsQ0FBQyxDQUFDO3FCQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHdEQUF3RCxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUNsRSxtQkFBTyxDQUFDLE1BQU0sQ0FBQztxQkFDWixHQUFHLENBQUMsb0JBQW9CLENBQUM7cUJBQ3pCLEtBQUssQ0FBQztvQkFDTCxPQUFPLEVBQUUsT0FBTztvQkFDaEIsZUFBZSxFQUFFLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQztpQkFDL0MsQ0FBQztxQkFDRCxHQUFHLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDO3FCQUNqQyxHQUFHLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQztxQkFDOUIsTUFBTSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUM7cUJBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUM7cUJBQ1gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNaLGlDQUFpQztvQkFDakMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNyRCwwQ0FBMEM7b0JBQzFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUN2QyxJQUNFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssWUFBWTs0QkFDOUIsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxhQUFhLEVBQy9COzRCQUNBLHNCQUFNLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7eUJBQ3ZDO3FCQUNGO2dCQUNILENBQUMsQ0FBQztxQkFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDakQsbUJBQU8sQ0FBQyxNQUFNLENBQUM7cUJBQ1osR0FBRyxDQUFDLG9CQUFvQixDQUFDO3FCQUN6QixLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQztxQkFDM0MsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQztxQkFDakMsR0FBRyxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUM7cUJBQzlCLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO3FCQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDO3FCQUNYLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLG1EQUFtRCxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUM3RCxtQkFBTyxDQUFDLE1BQU0sQ0FBQztxQkFDWixHQUFHLENBQUMsb0JBQW9CLENBQUM7cUJBQ3pCLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxFQUFFLENBQUM7cUJBQzVELEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUM7cUJBQ2pDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO3FCQUM5QixNQUFNLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQztxQkFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQztxQkFDWCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw2Q0FBNkMsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDdkQsbUJBQU8sQ0FBQyxNQUFNLENBQUM7cUJBQ1osR0FBRyxDQUFDLG9CQUFvQixDQUFDO3FCQUN6QixLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsQ0FBQztxQkFDbkQsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQztxQkFDakMsR0FBRyxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUM7cUJBQzlCLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO3FCQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDO3FCQUNYLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDO1lBQzFCLEVBQUUsQ0FBQyx5REFBeUQsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDbkUsbUJBQU8sQ0FBQyxNQUFNLENBQUM7cUJBQ1osR0FBRyxDQUFDLG9CQUFvQixDQUFDO3FCQUN6QixLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDO3FCQUM3RCxHQUFHLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDO3FCQUNqQyxHQUFHLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQztxQkFDOUIsTUFBTSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUM7cUJBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUM7cUJBQ1gsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMseUNBQXlDLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ25ELG1CQUFPLENBQUMsTUFBTSxDQUFDO3FCQUNaLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztxQkFDekIsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUM7cUJBQy9DLEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUM7cUJBQ2pDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO3FCQUM5QixNQUFNLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQztxQkFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQztxQkFDWCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxrREFBa0QsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDNUQsbUJBQU8sQ0FBQyxNQUFNLENBQUM7cUJBQ1osR0FBRyxDQUFDLG9CQUFvQixDQUFDO3FCQUN6QixLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDO3FCQUM1RCxHQUFHLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDO3FCQUNqQyxHQUFHLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQztxQkFDOUIsTUFBTSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUM7cUJBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUM7cUJBQ1gsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMseUNBQXlDLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ25ELG1CQUFPLENBQUMsTUFBTSxDQUFDO3FCQUNaLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztxQkFDekIsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUM7cUJBQy9DLEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUM7cUJBQ2pDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO3FCQUM5QixNQUFNLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQztxQkFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQztxQkFDWCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDakQsbUJBQU8sQ0FBQyxNQUFNLENBQUM7cUJBQ1osR0FBRyxDQUFDLG9CQUFvQixDQUFDO3FCQUN6QixLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUM7cUJBQzNCLEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUM7cUJBQ2pDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO3FCQUM5QixNQUFNLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQztxQkFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQztxQkFDWCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxtREFBbUQsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDN0QsbUJBQU8sQ0FBQyxNQUFNLENBQUM7cUJBQ1osR0FBRyxDQUFDLG9CQUFvQixDQUFDO3FCQUN6QixLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsQ0FBQztxQkFDckQsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQztxQkFDakMsR0FBRyxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUM7cUJBQzlCLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO3FCQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDO3FCQUNYLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHdEQUF3RCxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUNsRSxtQkFBTyxDQUFDLE1BQU0sQ0FBQztxQkFDWixHQUFHLENBQUMsb0JBQW9CLENBQUM7cUJBQ3pCLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLENBQUM7cUJBQzFELEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUM7cUJBQ2pDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO3FCQUM5QixNQUFNLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQztxQkFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQztxQkFDWCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxrREFBa0QsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDNUQsbUJBQU8sQ0FBQyxNQUFNLENBQUM7cUJBQ1osR0FBRyxDQUFDLG9CQUFvQixDQUFDO3FCQUN6QixLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsQ0FBQztxQkFDcEQsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQztxQkFDakMsR0FBRyxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUM7cUJBQzlCLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO3FCQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDO3FCQUNYLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHVDQUF1QyxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUNqRCxtQkFBTyxDQUFDLE1BQU0sQ0FBQztxQkFDWixHQUFHLENBQUMsb0JBQW9CLENBQUM7cUJBQ3pCLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDO3FCQUM3QyxHQUFHLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDO3FCQUNqQyxHQUFHLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQztxQkFDOUIsTUFBTSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUM7cUJBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUM7cUJBQ1gsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMseUNBQXlDLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ25ELG1CQUFPLENBQUMsTUFBTSxDQUFDO3FCQUNaLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztxQkFDekIsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztxQkFDekQsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQztxQkFDakMsR0FBRyxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUM7cUJBQzlCLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO3FCQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDO3FCQUNYLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQztZQUNuQixFQUFFLENBQUMsb0NBQW9DLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQzlDLG1CQUFPLENBQUMsTUFBTSxDQUFDO3FCQUNaLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztxQkFDekIsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQztxQkFDdkQsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQztxQkFDakMsR0FBRyxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUM7cUJBQzlCLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO3FCQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDO3FCQUNYLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDRCQUE0QixFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUN0QyxtQkFBTyxDQUFDLE1BQU0sQ0FBQztxQkFDWixHQUFHLENBQUMsb0JBQW9CLENBQUM7cUJBQ3pCLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDO3FCQUM5QyxHQUFHLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDO3FCQUNqQyxHQUFHLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQztxQkFDOUIsTUFBTSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUM7cUJBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUM7cUJBQ1gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNaLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7b0JBQ3hCLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDbEUsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUN4QixNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQzdELENBQUM7b0JBQ0Ysc0JBQU0sQ0FBQyxlQUFlLENBQ3BCLFlBQVksSUFBSSxXQUFXLEVBQzNCLElBQUksRUFDSixxQkFBcUIsWUFBWSxNQUFNLFdBQVcsRUFBRSxDQUNyRCxDQUFDO2dCQUNKLENBQUMsQ0FBQztxQkFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw2QkFBNkIsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDdkMsbUJBQU8sQ0FBQyxNQUFNLENBQUM7cUJBQ1osR0FBRyxDQUFDLG9CQUFvQixDQUFDO3FCQUN6QixLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQztxQkFDbEQsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQztxQkFDakMsR0FBRyxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUM7cUJBQzlCLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO3FCQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDO3FCQUNYLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDWixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO29CQUN4QixJQUFJLGdCQUFnQixHQUFHLENBQUMsQ0FBQztvQkFDekIsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO29CQUV4QixJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRTt3QkFDeEMsZ0JBQWdCLEdBQUcsZ0JBQU07NkJBQ3RCLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7NkJBQ3pDLElBQUksRUFBRSxDQUFDO3FCQUNYO29CQUVELElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO3dCQUNoRSxlQUFlLEdBQUcsZ0JBQU07NkJBQ3JCLEdBQUcsQ0FDRixNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQzdEOzZCQUNBLElBQUksRUFBRSxDQUFDO3FCQUNYO29CQUVELHNCQUFNLENBQUMsZUFBZSxDQUNwQixnQkFBZ0IsSUFBSSxlQUFlLEVBQ25DLElBQUksRUFDSixxQkFBcUIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxNQUN2RCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUN2RCxFQUFFLENBQ0gsQ0FBQztnQkFDSixDQUFDLENBQUM7cUJBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsZ0RBQWdELEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQzFELG1CQUFPLENBQUMsTUFBTSxDQUFDO3FCQUNaLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztxQkFDekIsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUM7cUJBQ3pDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUM7cUJBQ2pDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO3FCQUM5QixNQUFNLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQztxQkFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQztxQkFDWCxNQUFNLENBQUMsS0FBSyxFQUFDLEdBQUcsRUFBQyxFQUFFO29CQUNsQixzQkFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDN0MsQ0FBQyxDQUFDO3FCQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVIOzs4RUFFMEU7SUFDMUUsUUFBUSxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtRQUM5QyxFQUFFLENBQUMsd0NBQXdDLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDbEQsbUJBQU8sQ0FBQyxNQUFNLENBQUM7aUJBQ1osR0FBRyxDQUFDLG9CQUFvQixDQUFDO2lCQUN6QixLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQztpQkFDM0MsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQztpQkFDakMsR0FBRyxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUM7aUJBQzlCLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO2lCQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDO2lCQUNYLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHVDQUF1QyxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ2pELG1CQUFPLENBQUMsTUFBTSxDQUFDO2lCQUNaLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztpQkFDekIsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUM7aUJBQzFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUM7aUJBQ2pDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDO2lCQUM5QixNQUFNLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQztpQkFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQztpQkFDWCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQywyQ0FBMkMsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUNyRCxtQkFBTyxDQUFDLE1BQU0sQ0FBQztpQkFDWixHQUFHLENBQUMsb0JBQW9CLENBQUM7aUJBQ3pCLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDO2lCQUM5QyxHQUFHLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDO2lCQUNqQyxHQUFHLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQztpQkFDOUIsTUFBTSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUM7aUJBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUM7aUJBQ1gsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsMkNBQTJDLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDckQsbUJBQU8sQ0FBQyxNQUFNLENBQUM7aUJBQ1osR0FBRyxDQUFDLG9CQUFvQixDQUFDO2lCQUN6QixLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQztpQkFDM0MsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQztpQkFDakMsR0FBRyxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUM7aUJBQzlCLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO2lCQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDO2lCQUNYLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyJ9