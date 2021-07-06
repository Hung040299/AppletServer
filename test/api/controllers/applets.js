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
const deepStrictEqual = power_assert_1.default.deepStrictEqual;
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
const fakeAppletID2 = config.fakeAppletID2;
const dummy_user_key = config.dummy_user_key;
describe("controllers", () => {
    describe("users", () => {
        /*************************************************************************
         * Test GET /applets
         ************************************************************************/
        describe("GET /applets", () => {
            const blockServer = "http://127.0.0.1:10011"; // Refer to package.json
            const deviceId = "getAppletTestSuspendBody201908";
            const putAppletSuspendBody = {
                deviceId: `${deviceId}`,
                deviceSuspendFlg: true,
                deviceSuspendCode: "900"
            };
            it("it should accept request with personalUseFlg is true", async () => {
                // Create suspeneded action block
                const blockPostBody = util_1.TestUtil.getSamplePostBlock();
                blockPostBody.blockType = "action";
                let resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
                power_assert_1.default.deepEqual(resp.status, 201);
                const aBlkId = resp.body.id;
                // Create suspeneded trigger block
                blockPostBody.blockType = "trigger";
                resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
                power_assert_1.default.deepEqual(resp.status, 201);
                const tBlkId = resp.body.id;
                // Create suspeneded service block
                blockPostBody.blockType = "service";
                resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
                power_assert_1.default.deepEqual(resp.status, 201);
                const sBlkId = resp.body.id;
                // Create an applet with special device Id and assign suspended blocks to applet
                const appletPostBody = util_1.TestUtil.getSamplePostApplet();
                appletPostBody.deviceId = deviceId;
                appletPostBody.action = aBlkId;
                appletPostBody.trigger = tBlkId;
                appletPostBody.service = sBlkId;
                appletPostBody["personalUseFlg"] = true;
                resp = await supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(appletPostBody);
                power_assert_1.default.deepStrictEqual(resp.status, 201);
                const appletId = resp.body.id;
                try {
                    const putBody = util_1.TestUtil.getSuspendBlock();
                    putBody.blockId = aBlkId;
                    resp = await util_1.TestUtil.putSuspendBlock(blockServer, putBody, root_key);
                    power_assert_1.default.deepEqual(resp.status, 200);
                    putBody.blockId = tBlkId;
                    resp = await util_1.TestUtil.putSuspendBlock(blockServer, putBody, root_key);
                    power_assert_1.default.deepEqual(resp.status, 200);
                    putBody.blockId = sBlkId;
                    resp = await util_1.TestUtil.putSuspendBlock(blockServer, putBody, root_key);
                    power_assert_1.default.deepEqual(resp.status, 200);
                    // Check if appletSuspend is added to the created applet
                    resp = await supertest_1.default(server)
                        .get("/api/applets")
                        .query({ version: version, personalUseFlg: true })
                        .set("Accept", "application/json")
                        .set("Authorization", dummy_user_key)
                        .expect("Content-Type", /json/)
                        .expect(200);
                    power_assert_1.default.deepStrictEqual(resp.status, 200);
                    const applets = resp.body.applets;
                    let applet;
                    for (applet of applets) {
                        const personalUseFlg = applet.applet.personalUseFlg;
                        deepStrictEqual(personalUseFlg, true);
                        power_assert_1.notDeepStrictEqual(applet.appletInfo.submitDate, undefined);
                    }
                }
                catch (e) {
                    console.log(e);
                    throw e;
                }
                finally {
                    await util_1.TestUtil.deleteApplet(appletId);
                    resp = await util_1.TestUtil.deleteBlock(blockServer, aBlkId);
                    power_assert_1.default.deepStrictEqual(resp.status, 204);
                    resp = await util_1.TestUtil.deleteBlock(blockServer, tBlkId);
                    power_assert_1.default.deepStrictEqual(resp.status, 204);
                    resp = await util_1.TestUtil.deleteBlock(blockServer, sBlkId);
                    power_assert_1.default.deepStrictEqual(resp.status, 204);
                }
            });
            it("it should accept request with personalUseFlg is false", async () => {
                // Create suspeneded action block
                const blockPostBody = util_1.TestUtil.getSamplePostBlock();
                blockPostBody.blockType = "action";
                let resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
                power_assert_1.default.deepEqual(resp.status, 201);
                const aBlkId = resp.body.id;
                // Create suspeneded trigger block
                blockPostBody.blockType = "trigger";
                resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
                power_assert_1.default.deepEqual(resp.status, 201);
                const tBlkId = resp.body.id;
                // Create suspeneded service block
                blockPostBody.blockType = "service";
                resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
                power_assert_1.default.deepEqual(resp.status, 201);
                const sBlkId = resp.body.id;
                // Create an applet with special device Id and assign suspended blocks to applet
                const appletPostBody = util_1.TestUtil.getSamplePostApplet();
                appletPostBody.deviceId = deviceId;
                appletPostBody.action = aBlkId;
                appletPostBody.trigger = tBlkId;
                appletPostBody.service = sBlkId;
                appletPostBody["personalUseFlg"] = false;
                resp = await supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(appletPostBody);
                power_assert_1.default.deepStrictEqual(resp.status, 201);
                const appletId = resp.body.id;
                try {
                    const putBody = util_1.TestUtil.getSuspendBlock();
                    putBody.blockId = aBlkId;
                    resp = await util_1.TestUtil.putSuspendBlock(blockServer, putBody, root_key);
                    power_assert_1.default.deepEqual(resp.status, 200);
                    putBody.blockId = tBlkId;
                    resp = await util_1.TestUtil.putSuspendBlock(blockServer, putBody, root_key);
                    power_assert_1.default.deepEqual(resp.status, 200);
                    putBody.blockId = sBlkId;
                    resp = await util_1.TestUtil.putSuspendBlock(blockServer, putBody, root_key);
                    power_assert_1.default.deepEqual(resp.status, 200);
                    // Check if appletSuspend is added to the created applet
                    resp = await supertest_1.default(server)
                        .get("/api/applets")
                        .query({ version: version, personalUseFlg: false })
                        .set("Accept", "application/json")
                        .set("Authorization", dummy_user_key)
                        .expect("Content-Type", /json/)
                        .expect(200);
                    power_assert_1.default.deepStrictEqual(resp.status, 200);
                    const applets = resp.body.applets;
                    let applet;
                    for (applet of applets) {
                        const personalUseFlg = applet.applet.personalUseFlg;
                        deepStrictEqual(typeof personalUseFlg === "undefined" || personalUseFlg === false, true);
                    }
                }
                catch (e) {
                    console.log(e);
                    throw e;
                }
                finally {
                    await util_1.TestUtil.deleteApplet(appletId);
                    resp = await util_1.TestUtil.deleteBlock(blockServer, aBlkId);
                    power_assert_1.default.deepStrictEqual(resp.status, 204);
                    resp = await util_1.TestUtil.deleteBlock(blockServer, tBlkId);
                    power_assert_1.default.deepStrictEqual(resp.status, 204);
                    resp = await util_1.TestUtil.deleteBlock(blockServer, sBlkId);
                    power_assert_1.default.deepStrictEqual(resp.status, 204);
                }
            });
            it("it should accept request with suspendFlg is true", async () => {
                // Create suspeneded action block
                const blockPostBody = util_1.TestUtil.getSamplePostBlock();
                blockPostBody.blockType = "action";
                let resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
                power_assert_1.default.deepEqual(resp.status, 201);
                const aBlkId = resp.body.id;
                // Create suspeneded trigger block
                blockPostBody.blockType = "trigger";
                resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
                power_assert_1.default.deepEqual(resp.status, 201);
                const tBlkId = resp.body.id;
                // Create suspeneded service block
                blockPostBody.blockType = "service";
                resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
                power_assert_1.default.deepEqual(resp.status, 201);
                const sBlkId = resp.body.id;
                // Create an applet with special device Id and assign suspended blocks to applet
                const appletPostBody = util_1.TestUtil.getSamplePostApplet();
                appletPostBody.deviceId = deviceId;
                appletPostBody.action = aBlkId;
                appletPostBody.trigger = tBlkId;
                appletPostBody.service = sBlkId;
                resp = await supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(appletPostBody);
                power_assert_1.default.deepStrictEqual(resp.status, 201);
                const appletId = resp.body.id;
                try {
                    const putBody = util_1.TestUtil.getSuspendBlock();
                    putBody.blockId = aBlkId;
                    resp = await util_1.TestUtil.putSuspendBlock(blockServer, putBody, root_key);
                    power_assert_1.default.deepEqual(resp.status, 200);
                    putBody.blockId = tBlkId;
                    resp = await util_1.TestUtil.putSuspendBlock(blockServer, putBody, root_key);
                    power_assert_1.default.deepEqual(resp.status, 200);
                    putBody.blockId = sBlkId;
                    resp = await util_1.TestUtil.putSuspendBlock(blockServer, putBody, root_key);
                    power_assert_1.default.deepEqual(resp.status, 200);
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
                        .get("/api/applets")
                        .query({ version: version, suspendFlg: true })
                        .set("Accept", "application/json")
                        .set("Authorization", dummy_user_key)
                        .expect("Content-Type", /json/)
                        .expect(200);
                    power_assert_1.default.deepStrictEqual(resp.status, 200);
                    const applets = resp.body.applets;
                    let appletInfo;
                    for (appletInfo of applets) {
                        const appletSuspend = appletInfo.applet.AppletSuspend;
                        deepStrictEqual((typeof appletSuspend.device !== "undefined" &&
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
                    resp = await util_1.TestUtil.deleteBlock(blockServer, aBlkId);
                    power_assert_1.default.deepStrictEqual(resp.status, 204);
                    resp = await util_1.TestUtil.deleteBlock(blockServer, tBlkId);
                    power_assert_1.default.deepStrictEqual(resp.status, 204);
                    resp = await util_1.TestUtil.deleteBlock(blockServer, sBlkId);
                    power_assert_1.default.deepStrictEqual(resp.status, 204);
                }
            });
            it("it should accept request with suspendFlg is false", async () => {
                // Create suspeneded action block
                const blockPostBody = util_1.TestUtil.getSamplePostBlock();
                blockPostBody.blockType = "action";
                let resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
                power_assert_1.default.deepEqual(resp.status, 201);
                const aBlkId = resp.body.id;
                // Create suspeneded trigger block
                blockPostBody.blockType = "trigger";
                resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
                power_assert_1.default.deepEqual(resp.status, 201);
                const tBlkId = resp.body.id;
                // Create suspeneded service block
                blockPostBody.blockType = "service";
                resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
                power_assert_1.default.deepEqual(resp.status, 201);
                const sBlkId = resp.body.id;
                // Create an applet with special device Id and assign suspended blocks to applet
                const appletPostBody = util_1.TestUtil.getSamplePostApplet();
                appletPostBody.deviceId = deviceId;
                appletPostBody.action = aBlkId;
                appletPostBody.trigger = tBlkId;
                appletPostBody.service = sBlkId;
                // Create an applet with special device Id
                resp = await supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(appletPostBody);
                power_assert_1.default.deepStrictEqual(resp.status, 201);
                const appletId = resp.body.id;
                try {
                    const putBody = util_1.TestUtil.getSuspendBlock();
                    putBody.blockSuspendFlg = false;
                    putBody.blockId = aBlkId;
                    resp = await util_1.TestUtil.putSuspendBlock(blockServer, putBody, root_key);
                    power_assert_1.default.deepEqual(resp.status, 200);
                    putBody.blockId = tBlkId;
                    resp = await util_1.TestUtil.putSuspendBlock(blockServer, putBody, root_key);
                    power_assert_1.default.deepEqual(resp.status, 200);
                    putBody.blockId = sBlkId;
                    resp = await util_1.TestUtil.putSuspendBlock(blockServer, putBody, root_key);
                    power_assert_1.default.deepEqual(resp.status, 200);
                    // Apply appletSuspend
                    putAppletSuspendBody.deviceSuspendFlg = false;
                    resp = await supertest_1.default(server)
                        .put("/api/admin/appletSuspend")
                        .set("Accept", "application/json")
                        .set("Authorization", root_key)
                        .send(putAppletSuspendBody)
                        .expect("Content-Type", /json/);
                    power_assert_1.default.deepEqual(resp.status, 201);
                    // Check if appletSuspend is added to the created applet
                    resp = await supertest_1.default(server)
                        .get("/api/applets")
                        .query({ version: version, suspendFlg: false })
                        .set("Accept", "application/json")
                        .set("Authorization", dummy_user_key)
                        .expect("Content-Type", /json/)
                        .expect(200);
                    power_assert_1.default.deepStrictEqual(resp.status, 200);
                    const applets = resp.body.applets;
                    let appletInfo;
                    for (appletInfo of applets) {
                        const appletSuspend = appletInfo.applet.AppletSuspend;
                        if (appletSuspend) {
                            if (appletSuspend.device) {
                                deepStrictEqual(appletSuspend.device.deviceSuspendFlg, false);
                            }
                            if (appletSuspend.action) {
                                deepStrictEqual(appletSuspend.action.blockSuspendFlg, false);
                            }
                            if (appletSuspend.trigger) {
                                deepStrictEqual(appletSuspend.trigger.blockSuspendFlg, false);
                            }
                            if (appletSuspend.service) {
                                deepStrictEqual(appletSuspend.service.blockSuspendFlg, false);
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
                    resp = await util_1.TestUtil.deleteBlock(blockServer, aBlkId);
                    power_assert_1.default.deepStrictEqual(resp.status, 204);
                    resp = await util_1.TestUtil.deleteBlock(blockServer, tBlkId);
                    power_assert_1.default.deepStrictEqual(resp.status, 204);
                    resp = await util_1.TestUtil.deleteBlock(blockServer, sBlkId);
                    power_assert_1.default.deepStrictEqual(resp.status, 204);
                }
            });
            it("should accept request", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a vaild applet ID", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, appletId: appletID4GET })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a more than one applet IDs", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, appletId: [appletID4GET, appletID4GET2] })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a excluded applet ID", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, excludeAppletId: appletID4GET })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
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
                    .get("/api/applets")
                    .query({
                    version: version,
                    excludeAppletId: [appletID4GET, appletID4GET2]
                })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
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
                    .get("/api/applets")
                    .query({ version: version, toolId: toolID })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request with multiple valid tool ID", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, toolId: [toolID, appletID4GET2] })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a valid categoryId ID", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, categoryId: categoryID })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            const catID2 = "cat_0016";
            it("should accept request with multiple valid categoryId ID", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, categoryId: [categoryID, catID2] })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a vaild device ID", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, deviceId: deviceID })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a more than one device IDs", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, deviceId: [deviceID, deviceID2] })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a vaild vendor ID", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, vendorId: vendorID })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a vaild version", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a storeStatus are published", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, storeStatus: "published" })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a storeStatus are waiting_review", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, storeStatus: "waiting_review" })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a storeStatus are rejected", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, storeStatus: "rejected" })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request a valid ownerID", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, ownerId: ownerID })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should accept request multiple ownerIDs", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, ownerId: [ownerID, ownerID2] })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            const title1 = "説明";
            const lang1 = "ja";
            it("should accept request with a title", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, title: title1, lang: lang1 })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            const title2 = "descript";
            const lang2 = "en";
            it("should accept request with a english title", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, title: title2, lang: lang2 })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end(done);
            });
            it("should sort by like number", done => {
                supertest_1.default(server)
                    .get("/api/applets")
                    .query({ version: version, sortBy: "likeNum" })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
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
                    .get("/api/applets")
                    .query({ version: version, sortBy: "releaseDate" })
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
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
            it("should contain submitDate in appletInfo", async () => {
                const exampleReqBody = JSON.parse(require("fs").readFileSync(`${__dirname}/testJsonFiles/appletsPostReqBody.json`));
                let resp = await supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(exampleReqBody);
                power_assert_1.default.deepStrictEqual(resp.status, 201);
                const appletId = resp.body.id;
                try {
                    // Check if submitDate is added to the created applet
                    resp = await supertest_1.default(server)
                        .get("/api/applets")
                        .query({ version: version, appletId: appletId })
                        .set("Accept", "application/json")
                        .set("Authorization", dummy_user_key)
                        .expect("Content-Type", /json/)
                        .expect(200);
                    power_assert_1.default.deepStrictEqual(resp.status, 200);
                    const appletInfo = resp.body.applets[0].appletInfo;
                    power_assert_1.default.notDeepStrictEqual(appletInfo.submitDate, undefined);
                    power_assert_1.default.deepStrictEqual(util_1.TestUtil.isISO8601String(appletInfo.submitDate), true);
                }
                catch (e) {
                    console.log(e);
                    throw e;
                }
                finally {
                    await util_1.TestUtil.deleteApplet(appletId);
                }
            });
            describe("with parameter sdkVersion, minSdkVersion, maxSdkVersion", () => {
                let appletId1 = '';
                let appletId2 = '';
                before(async () => {
                    // Create suspeneded action block
                    const blockPostBody = util_1.TestUtil.getSamplePostBlock();
                    blockPostBody.blockType = "action";
                    let resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
                    const aBlkId = resp.body.id;
                    // Create suspeneded trigger block
                    blockPostBody.blockType = "trigger";
                    resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
                    const tBlkId = resp.body.id;
                    // Create suspeneded service block
                    blockPostBody.blockType = "service";
                    resp = await util_1.TestUtil.postBlock(blockServer, blockPostBody);
                    const sBlkId = resp.body.id;
                    // Create an applet with special device Id and assign suspended blocks to applet
                    const appletPostBody = util_1.TestUtil.getSamplePostApplet();
                    appletPostBody.deviceId = deviceId;
                    appletPostBody.action = aBlkId;
                    appletPostBody.trigger = tBlkId;
                    appletPostBody.sdkVersion = "1.10.0";
                    appletPostBody.version = version;
                    resp = await supertest_1.default(server)
                        .post("/api/applets")
                        .set("Accept", "application/json")
                        .set("Authorization", dummy_user_key)
                        .send(appletPostBody);
                    appletId1 = resp.body.id;
                    appletPostBody.sdkVersion = "1.5.0";
                    resp = await supertest_1.default(server)
                        .post("/api/applets")
                        .set("Accept", "application/json")
                        .set("Authorization", dummy_user_key)
                        .send(appletPostBody);
                    appletId2 = resp.body.id;
                });
                after(async () => {
                    await util_1.TestUtil.deleteApplet(appletId1);
                    await util_1.TestUtil.deleteApplet(appletId2);
                });
                it("GET /applets sdkVersion", async () => {
                    let sdkVersion = "1.5.0";
                    try {
                        const rep = await supertest_1.default(server)
                            .get("/api/applets")
                            .query({ version, sdkVersion })
                            .set("Accept", "application/json")
                            .set("Authorization", dummy_user_key);
                        power_assert_1.default.deepStrictEqual(rep.status, 200);
                        let rs = rep.body.applets || [];
                        power_assert_1.default(rs.length > 0);
                        let index = rs.findIndex((element) => element.applet.sdkVersion !== sdkVersion);
                        power_assert_1.default.deepStrictEqual(index, -1);
                    }
                    catch (e) {
                        console.log(e);
                        throw e;
                    }
                });
                it("GET /applets minSdkVersion", async () => {
                    let minSdkVersion = "1.0.0";
                    try {
                        const rep = await supertest_1.default(server)
                            .get("/api/applets")
                            .query({ version, minSdkVersion })
                            .set("Accept", "application/json")
                            .set("Authorization", dummy_user_key);
                        power_assert_1.default.deepStrictEqual(rep.status, 200);
                        let rs = rep.body.applets || [];
                        power_assert_1.default.deepStrictEqual(rs.length > 0, true);
                        let index = rs.findIndex((element) => element.applet.sdkVersion < minSdkVersion);
                        power_assert_1.default.deepStrictEqual(index, -1);
                    }
                    catch (e) {
                        console.log(e);
                        throw e;
                    }
                });
                it("GET /applets maxSdkVersion", async () => {
                    let maxSdkVersion = "1.5.0";
                    try {
                        const rep = await supertest_1.default(server)
                            .get("/api/applets")
                            .query({ version, maxSdkVersion })
                            .set("Accept", "application/json")
                            .set("Authorization", dummy_user_key);
                        power_assert_1.default.deepStrictEqual(rep.status, 200);
                        let rs = rep.body.applets || [];
                        power_assert_1.default(rs.length > 0);
                        let index = rs.findIndex((element) => element.applet.sdkVersion > maxSdkVersion);
                        power_assert_1.default.deepStrictEqual(index, -1);
                    }
                    catch (e) {
                        console.log(e);
                        throw e;
                    }
                });
                it("GET /applets maxSdkVersion sdkVersion", async () => {
                    let maxSdkVersion = "1.10.0";
                    let sdkVersion = "1.5.0";
                    try {
                        //sdkVersion < maxSdkVersion
                        let rep = await supertest_1.default(server)
                            .get("/api/applets")
                            .query({ version, maxSdkVersion, sdkVersion })
                            .set("Accept", "application/json")
                            .set("Authorization", dummy_user_key);
                        power_assert_1.default.deepStrictEqual(rep.status, 200);
                        let rs = rep.body.applets || [];
                        power_assert_1.default(rs.length > 0);
                        let index = rs.findIndex((element) => element.applet.sdkVersion !== sdkVersion);
                        power_assert_1.default.deepStrictEqual(index, -1);
                        //sdkVersion > maxSdkVersion
                        let tmp = sdkVersion;
                        sdkVersion = maxSdkVersion;
                        maxSdkVersion = tmp;
                        rep = await supertest_1.default(server)
                            .get("/api/applets")
                            .query({ version, maxSdkVersion, sdkVersion })
                            .set("Accept", "application/json")
                            .set("Authorization", dummy_user_key);
                        power_assert_1.default.deepStrictEqual(rep.status, 200);
                        rs = rep.body.applets || [];
                        power_assert_1.default(rs.length === 0);
                    }
                    catch (e) {
                        console.log(e);
                        throw e;
                    }
                });
                it("GET /applets minSdkVersion sdkVersion", async () => {
                    let minSdkVersion = "1.5.0";
                    let sdkVersion = "1.10.0";
                    try {
                        //sdkVersion > minSdkVersion
                        let rep = await supertest_1.default(server)
                            .get("/api/applets")
                            .query({ version, minSdkVersion, sdkVersion })
                            .set("Accept", "application/json")
                            .set("Authorization", dummy_user_key);
                        power_assert_1.default.deepStrictEqual(rep.status, 200);
                        let rs = rep.body.applets || [];
                        power_assert_1.default(rs.length > 0);
                        let index = rs.findIndex((element) => element.applet.sdkVersion !== sdkVersion);
                        power_assert_1.default.deepStrictEqual(index, -1);
                        //sdkVersion < minSdkVersion
                        let tmp = sdkVersion;
                        sdkVersion = minSdkVersion;
                        minSdkVersion = tmp;
                        rep = await supertest_1.default(server)
                            .get("/api/applets")
                            .query({ version, minSdkVersion, sdkVersion })
                            .set("Accept", "application/json")
                            .set("Authorization", dummy_user_key);
                        power_assert_1.default.deepStrictEqual(rep.status, 200);
                        rs = rep.body.applets || [];
                        power_assert_1.default(rs.length === 0);
                    }
                    catch (e) {
                        console.log(e);
                        throw e;
                    }
                });
                it("GET /applets minSdkVersion maxSdkVersion", async () => {
                    let minSdkVersion = "1.5.0";
                    let maxSdkVersion = "1.10.0";
                    try {
                        //minSdkVersion < maxSdkVersion
                        let rep = await supertest_1.default(server)
                            .get("/api/applets")
                            .query({ version, minSdkVersion, maxSdkVersion })
                            .set("Accept", "application/json")
                            .set("Authorization", dummy_user_key);
                        power_assert_1.default.deepStrictEqual(rep.status, 200);
                        let rs = rep.body.applets || [];
                        let index = rs.findIndex((element) => element.applet.sdkVersion.localeCompare(maxSdkVersion, {}, { numeric: true }) === 1 || element.applet.sdkVersion.localeCompare(minSdkVersion, {}, { numeric: true }) == -1);
                        power_assert_1.default.deepStrictEqual(index, -1);
                        //minSdkVersion > maxSdkVersion
                        let tmp = maxSdkVersion;
                        maxSdkVersion = minSdkVersion;
                        minSdkVersion = tmp;
                        rep = await supertest_1.default(server)
                            .get("/api/applets")
                            .query({ version, minSdkVersion, maxSdkVersion })
                            .set("Accept", "application/json")
                            .set("Authorization", dummy_user_key);
                        power_assert_1.default.deepStrictEqual(rep.status, 200);
                        rs = rep.body.applets || [];
                        power_assert_1.default(rs.length === 0);
                    }
                    catch (e) {
                        console.log(e);
                        throw e;
                    }
                });
                it("GET /applets minSdkVersion maxSdkVersion sdkVersion", async () => {
                    let minSdkVersion = "1.0.0";
                    let maxSdkVersion = "1.10.0";
                    let sdkVersion = "1.5.0";
                    try {
                        //sdkVersion in (minSdkVersion, maxSdkVersion)
                        let rep = await supertest_1.default(server)
                            .get("/api/applets")
                            .query({ version, minSdkVersion, maxSdkVersion, sdkVersion })
                            .set("Accept", "application/json")
                            .set("Authorization", dummy_user_key);
                        power_assert_1.default.deepStrictEqual(rep.status, 200);
                        let rs = rep.body.applets || [];
                        power_assert_1.default(rs.length > 0);
                        let index = rs.findIndex((element) => element.applet.sdkVersion !== sdkVersion);
                        power_assert_1.default.deepStrictEqual(index, -1);
                        //sdkVersion not in (minSdkVersion, maxSdkVersion)
                        sdkVersion = "0.0.0";
                        rep = await supertest_1.default(server)
                            .get("/api/applets")
                            .query({ version, minSdkVersion, maxSdkVersion, sdkVersion })
                            .set("Accept", "application/json")
                            .set("Authorization", dummy_user_key);
                        power_assert_1.default.deepStrictEqual(rep.status, 200);
                        rs = rep.body.applets || [];
                        power_assert_1.default(rs.length === 0);
                    }
                    catch (e) {
                        console.log(e);
                        throw e;
                    }
                });
                it("GET /applets sdkVersion on User-Agent", async () => {
                    let maxSdkVersion = "1.5.0";
                    try {
                        const rep = await supertest_1.default(server)
                            .get("/api/applets")
                            .query({ version })
                            .set("Accept", "application/json")
                            .set("Authorization", dummy_user_key)
                            .set("User-Agent", `CITIZEN/1.1.047 iOS/14.3/RiiiverSDK/${maxSdkVersion}somethingok`);
                        power_assert_1.default.deepStrictEqual(rep.status, 200);
                        let rs = rep.body.applets || [];
                        power_assert_1.default(rs.length > 0);
                        let index = rs.findIndex((element) => element.applet.sdkVersion > maxSdkVersion);
                        power_assert_1.default.deepStrictEqual(index, -1);
                    }
                    catch (e) {
                        console.log(e);
                        throw e;
                    }
                });
            });
        });
        /* Create at post test , used for test, and delete in put */
        let gTestAppletId = "";
        /*************************************************************************
         * Test POST /applets
         ************************************************************************/
        describe("POST /applets", () => {
            const exampleReqBody = JSON.parse(require("fs").readFileSync(`${__dirname}/testJsonFiles/appletsPostReqBody.json`));
            it("should reject request with 400 if personalInfoList parameters is invalid", done => {
                const invalidReqBody = Object.assign({}, exampleReqBody, {
                    personalInfoList: ""
                });
                supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(invalidReqBody)
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .end(done);
            });
            it("should reject with 400 if serviceCompanyName in personalInfoList is invalid", done => {
                let invalidReqBody = JSON.parse(JSON.stringify(exampleReqBody));
                invalidReqBody.personalInfoList[0].serviceCompanyName = false;
                supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(invalidReqBody)
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .end(done);
            });
            it("should reject request with 400 if privacyPolicy in personalInfoList is invalid", done => {
                let invalidReqBody = JSON.parse(JSON.stringify(exampleReqBody));
                invalidReqBody.personalInfoList[0].privacyPolicy = "test";
                supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(invalidReqBody)
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .end(done);
            });
            it("should reject request with 400 if description in personalInfoList is invalid", done => {
                let invalidReqBody = JSON.parse(JSON.stringify(exampleReqBody));
                invalidReqBody.personalInfoList[0].description = "test";
                supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(invalidReqBody)
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .end(done);
            });
            it("should accept request with 400 if serviceCompanyName in personalInfoList is string", done => {
                let invalidReqBody = JSON.parse(JSON.stringify(exampleReqBody));
                invalidReqBody.personalInfoList[0].serviceCompanyName = "test";
                supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(invalidReqBody)
                    .expect("Content-Type", /json/)
                    .expect(201)
                    .end(done);
            });
            it("should reject request with 400 if type of typeList in personalInfoList is string", done => {
                let invalidReqBody = JSON.parse(JSON.stringify(exampleReqBody));
                invalidReqBody.personalInfoList[0].typeList[0].type = "test";
                supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(invalidReqBody)
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .end(done);
            });
            it("should reject request with 400 if description of typeList in personalInfoList is string", done => {
                let invalidReqBody = JSON.parse(JSON.stringify(exampleReqBody));
                invalidReqBody.personalInfoList[0].typeList[0].description = "test";
                supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(invalidReqBody)
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .end(done);
            });
            it("should reject request with 400 if mandatory parameters are missing", done => {
                supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send({})
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .expect(/Missing required property: title/)
                    .expect(/Missing required property: trigger/)
                    .expect(/Missing required property: service/)
                    .expect(/Missing required property: action/)
                    .end(done);
            });
            it("should reject request with 400 if title/description have invalid values", done => {
                const invalidReqBody = Object.assign({}, exampleReqBody, {
                    title: "string_title",
                    lang: "ja",
                    description: "string_description"
                });
                supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(invalidReqBody)
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .expect(/"Expected type object but found type string","path":\["title"\]/)
                    .expect(/"Expected type object but found type string","path":\["description"\]/)
                    .end(done);
            });
            it("should reject request with 404 if trigger block does not exist", done => {
                const bodyWithNonExistingBlocks = Object.assign({}, exampleReqBody, {
                    trigger: "virtualButton-5c9b2c888feb0f162f000000"
                });
                supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(bodyWithNonExistingBlocks)
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .end(done);
            });
            it("should reject request with 404 if service block does not exist", done => {
                const bodyWithNonExistingBlocks = Object.assign({}, exampleReqBody, {
                    service: "serviceProxy-5c9c268e60d47d16f9000000"
                });
                supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(bodyWithNonExistingBlocks)
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .end(done);
            });
            it("should reject request with 404 if action block does not exist", done => {
                const bodyWithNonExistingAction = Object.assign({}, exampleReqBody, {
                    service: "localNotification-5c9884fa5222ca0e63000000"
                });
                supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(bodyWithNonExistingAction)
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .end(done);
            });
            it("should reject request with 400 if wirings have invalid value", done => {
                const invalidWirings = Object.assign({}, exampleReqBody.wirings, {
                    "watchHand-5a96423c1388f9fd918f5c21": {
                        time: {
                            id: "schedule-5a96423c1388f9fd918f5c20"
                            // removing `property`
                        }
                    }
                });
                const invalidReqBody = Object.assign({}, exampleReqBody, {
                    wirings: invalidWirings
                });
                supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(invalidReqBody)
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .expect(/"Missing required property: property","path":\["wirings","watchHand-5a96423c1388f9fd918f5c21","time"\]/)
                    .end(done);
            });
            it("should reject request with 400 if preferences have invalid value", done => {
                const invalidReqBody = Object.assign({}, exampleReqBody, {
                    preferences: { "watchHand-5a96423c1388f9fd918f5c21": "not_object" }
                });
                supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(invalidReqBody)
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .expect(/"Expected type object but found type string","path":\["preferences","watchHand-5a96423c1388f9fd918f5c21"\]/)
                    .end(done);
            });
            it("should accept request with valid parameters", async (done) => {
                supertest_1.default(server)
                    .post("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(exampleReqBody)
                    .expect("Content-Type", /json/)
                    .expect(201)
                    .expect(res => {
                    /* Use the applet ID for testing. Will removed at last test item */
                    gTestAppletId = res.body.id;
                })
                    .end(done);
            });
            if (process.env.NODE_ENV !== "test") {
                describe("with sample Blocks retrieved from Dodai (takes longer time)", () => {
                    it("should reject request with 404 if non-existing Blocks are specified", done => {
                        const bodyWithNonExistingBlocks = Object.assign({}, exampleReqBody, { trigger: "NotExist-5a96423c1388f9fd918f5c1f" });
                        supertest_1.default(server)
                            .post("/api/applets")
                            .set("Accept", "application/json")
                            .set("Authorization", dummy_user_key)
                            .send(bodyWithNonExistingBlocks)
                            .expect("Content-Type", /json/)
                            .expect(404)
                            .expect({
                            code: "404-50",
                            error: "BlocksNotFound",
                            message: "Blocks not found: NotExist-5a96423c1388f9fd918f5c1f"
                        })
                            .end(done);
                    });
                    it("should reject request with 400 if Trigger Block is used as a wiring target", done => {
                        const wiringsWithTriggerAsWiringTarget = Object.assign({}, exampleReqBody.wirings, { "watchButton-5a96423c1388f9fd918f5c1f": {} });
                        const bodyWithTriggerAsWiringTarget = Object.assign({}, exampleReqBody, { wirings: wiringsWithTriggerAsWiringTarget });
                        supertest_1.default(server)
                            .post("/api/applets")
                            .set("Accept", "application/json")
                            .set("Authorization", dummy_user_key)
                            .send(bodyWithTriggerAsWiringTarget)
                            .expect("Content-Type", /json/)
                            .expect(400)
                            .expect({
                            code: "400-50",
                            error: "InvalidAppletWiringTarget",
                            message: "Trigger block cannot become wiring target."
                        })
                            .end(done);
                    });
                    it("should reject request with 400 if specified Block has invalid blockType", done => {
                        const bodyWithInvalidBlockType = Object.assign({}, exampleReqBody, {
                            service: "watchButton-5a96423c1388f9fd918f5c1f",
                            trigger: "schedule-5a96423c1388f9fd918f5c20"
                        });
                        supertest_1.default(server)
                            .post("/api/applets")
                            .set("Accept", "application/json")
                            .set("Authorization", dummy_user_key)
                            .send(bodyWithInvalidBlockType)
                            .expect("Content-Type", /json/)
                            .expect(400)
                            .expect({
                            code: "400-51",
                            error: "InvalidBlockType",
                            // By `_id` order, 'schedule-5a96423c1388f9fd918f5c20' should come first so it must always be the following
                            message: "Block type of 'schedule-5a96423c1388f9fd918f5c20' is not equal to 'trigger'"
                        })
                            .end(done);
                    });
                    // NOTE: Currently seed (sample) blocks do not have `required` properties in inputs, so the case for `MissingRequiredProperty` is lacking
                    it("should reject request with 400 if required input properties are missing");
                });
            }
        });
        /*************************************************************************
         * Test PUT /applets
         ************************************************************************/
        describe("PUT /applets", () => {
            const exampleReqBody = JSON.parse(require("fs").readFileSync(`${__dirname}/testJsonFiles/appletsPutReqBody.json`));
            let gAppletId = "";
            before(async () => {
                gAppletId = await util_1.TestUtil.postSampleApplet(server);
                exampleReqBody.appletId = gAppletId;
            });
            after(async () => {
                await util_1.TestUtil.deleteApplet(gAppletId);
            });
            it("should accept request with valid parameters", done => {
                exampleReqBody.appletId = gAppletId;
                supertest_1.default(server)
                    .put("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(exampleReqBody)
                    .expect(201)
                    .expect("Content-Type", /json/)
                    .end(done);
            });
            it("should reject request with 404 if trigger block does not exist", done => {
                const bodyWithNonExistingBlocks = Object.assign({}, exampleReqBody, {
                    trigger: "NotExist-5a96423c1388f9fd918f5c1f"
                });
                exampleReqBody.appletId = gAppletId;
                supertest_1.default(server)
                    .put("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(bodyWithNonExistingBlocks)
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .end(done);
            });
            it("should reject request with 404 if action block does not exist", done => {
                const bodyWithNonExistingAction = Object.assign({}, exampleReqBody, {
                    action: "FAKE-Action-5a96423c1388f9fd918f5c1f"
                });
                exampleReqBody.appletId = gAppletId;
                supertest_1.default(server)
                    .put("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(bodyWithNonExistingAction)
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .end(done);
            });
            it("should reject request with 404 if service block does not exist", done => {
                const bodyWithNonExistingAction = Object.assign({}, exampleReqBody, {
                    service: "FAKE-Action-5a96423c1388f9fd918f5c1f"
                });
                exampleReqBody.appletId = gAppletId;
                supertest_1.default(server)
                    .put("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(bodyWithNonExistingAction)
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .end(done);
            });
            it("should reject request with 404 if appletId does not exist", done => {
                const bodyWithNonExistingAction = Object.assign({}, exampleReqBody, {
                    appletId: `${fakeAppletID2}`
                });
                supertest_1.default(server)
                    .put("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(bodyWithNonExistingAction)
                    .expect("Content-Type", /json/)
                    .expect(404)
                    .end(done);
            });
            it("should reject request with 400 if wirings have invalid value", async (done) => {
                const invalidWirings = Object.assign({}, exampleReqBody.wirings, {
                    "watchHand-5a96423c1388f9fd918f5c21": {
                        time: {
                            id: "schedule-5a96423c1388f9fd918f5c20"
                            // removing `property`
                        }
                    }
                });
                exampleReqBody.appletId = gAppletId;
                const invalidReqBody = Object.assign({}, exampleReqBody, {
                    wirings: invalidWirings
                });
                supertest_1.default(server)
                    .put("/api/applets")
                    .set("Accept", "application/json")
                    .set("Authorization", dummy_user_key)
                    .send(invalidReqBody)
                    .expect("Content-Type", /json/)
                    .expect(400)
                    .expect(/"Missing required property: property","path":\["wirings","watchHand-5a96423c1388f9fd918f5c21","time"\]/)
                    .end(done);
                /* Clean up the generated applet ID */
                await util_1.TestUtil.deleteApplet(gAppletId);
            });
        });
    }); /* users */
}); /* controllers */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcGxldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQTRCO0FBQzVCLDZEQUEwRDtBQUMxRCwwREFBZ0M7QUFDaEMsNkNBQThDO0FBRTlDLE1BQU0sZUFBZSxHQUFHLHNCQUFNLENBQUMsZUFBZSxDQUFDO0FBRS9DLHFDQUFxQztBQUNyQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbkMsb0NBQW9DO0FBQ3BDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDN0IsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN6QyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO0FBQzNDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDN0IsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztBQUNyQyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2pDLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDbkMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNqQyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQy9CLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDL0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNqQyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2pDLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7QUFDM0MsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQUU3QyxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtJQUMzQixRQUFRLENBQUMs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