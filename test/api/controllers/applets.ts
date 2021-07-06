import moment from "moment";
import assert, { notDeepStrictEqual } from "power-assert";
import request from "supertest";
import { TestUtil } from "../../utility/util";

const deepStrictEqual = assert.deepStrictEqual;

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
        const blockPostBody = TestUtil.getSamplePostBlock();
        blockPostBody.blockType = "action";
        let resp = await TestUtil.postBlock(blockServer, blockPostBody);
        assert.deepEqual(resp.status, 201);
        const aBlkId = resp.body.id;

        // Create suspeneded trigger block
        blockPostBody.blockType = "trigger";
        resp = await TestUtil.postBlock(blockServer, blockPostBody);
        assert.deepEqual(resp.status, 201);
        const tBlkId = resp.body.id;

        // Create suspeneded service block
        blockPostBody.blockType = "service";
        resp = await TestUtil.postBlock(blockServer, blockPostBody);
        assert.deepEqual(resp.status, 201);
        const sBlkId = resp.body.id;

        // Create an applet with special device Id and assign suspended blocks to applet
        const appletPostBody = TestUtil.getSamplePostApplet();
        appletPostBody.deviceId = deviceId;
        appletPostBody.action = aBlkId;
        appletPostBody.trigger = tBlkId;
        appletPostBody.service = sBlkId;
        appletPostBody["personalUseFlg"] = true;
        resp = await request(server)
          .post("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(appletPostBody);
        assert.deepStrictEqual(resp.status, 201);
        const appletId = resp.body.id;

        try {
          const putBody = TestUtil.getSuspendBlock();
          putBody.blockId = aBlkId;
          resp = await TestUtil.putSuspendBlock(blockServer, putBody, root_key);
          assert.deepEqual(resp.status, 200);

          putBody.blockId = tBlkId;
          resp = await TestUtil.putSuspendBlock(blockServer, putBody, root_key);
          assert.deepEqual(resp.status, 200);

          putBody.blockId = sBlkId;
          resp = await TestUtil.putSuspendBlock(blockServer, putBody, root_key);
          assert.deepEqual(resp.status, 200);

          // Check if appletSuspend is added to the created applet
          resp = await request(server)
            .get("/api/applets")
            .query({ version: version, personalUseFlg: true })
            .set("Accept", "application/json")
            .set("Authorization", dummy_user_key)
            .expect("Content-Type", /json/)
            .expect(200);
          assert.deepStrictEqual(resp.status, 200);
          const applets = resp.body.applets;
          let applet: any;
          for (applet of applets) {
            const personalUseFlg = applet.applet.personalUseFlg;
            deepStrictEqual(personalUseFlg, true);
            notDeepStrictEqual(applet.appletInfo.submitDate, undefined);
          }
        } catch (e) {
          console.log(e);
          throw e;
        } finally {
          await TestUtil.deleteApplet(appletId);

          resp = await TestUtil.deleteBlock(blockServer, aBlkId);
          assert.deepStrictEqual(resp.status, 204);

          resp = await TestUtil.deleteBlock(blockServer, tBlkId);
          assert.deepStrictEqual(resp.status, 204);

          resp = await TestUtil.deleteBlock(blockServer, sBlkId);
          assert.deepStrictEqual(resp.status, 204);
        }
      });

      it("it should accept request with personalUseFlg is false", async () => {
        // Create suspeneded action block
        const blockPostBody = TestUtil.getSamplePostBlock();
        blockPostBody.blockType = "action";
        let resp = await TestUtil.postBlock(blockServer, blockPostBody);
        assert.deepEqual(resp.status, 201);
        const aBlkId = resp.body.id;

        // Create suspeneded trigger block
        blockPostBody.blockType = "trigger";
        resp = await TestUtil.postBlock(blockServer, blockPostBody);
        assert.deepEqual(resp.status, 201);
        const tBlkId = resp.body.id;

        // Create suspeneded service block
        blockPostBody.blockType = "service";
        resp = await TestUtil.postBlock(blockServer, blockPostBody);
        assert.deepEqual(resp.status, 201);
        const sBlkId = resp.body.id;

        // Create an applet with special device Id and assign suspended blocks to applet
        const appletPostBody = TestUtil.getSamplePostApplet();
        appletPostBody.deviceId = deviceId;
        appletPostBody.action = aBlkId;
        appletPostBody.trigger = tBlkId;
        appletPostBody.service = sBlkId;
        appletPostBody["personalUseFlg"] = false;
        resp = await request(server)
          .post("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(appletPostBody);
        assert.deepStrictEqual(resp.status, 201);
        const appletId = resp.body.id;

        try {
          const putBody = TestUtil.getSuspendBlock();
          putBody.blockId = aBlkId;
          resp = await TestUtil.putSuspendBlock(blockServer, putBody, root_key);
          assert.deepEqual(resp.status, 200);

          putBody.blockId = tBlkId;
          resp = await TestUtil.putSuspendBlock(blockServer, putBody, root_key);
          assert.deepEqual(resp.status, 200);

          putBody.blockId = sBlkId;
          resp = await TestUtil.putSuspendBlock(blockServer, putBody, root_key);
          assert.deepEqual(resp.status, 200);

          // Check if appletSuspend is added to the created applet
          resp = await request(server)
            .get("/api/applets")
            .query({ version: version, personalUseFlg: false })
            .set("Accept", "application/json")
            .set("Authorization", dummy_user_key)
            .expect("Content-Type", /json/)
            .expect(200);
          assert.deepStrictEqual(resp.status, 200);
          const applets = resp.body.applets;
          let applet: any;
          for (applet of applets) {
            const personalUseFlg = applet.applet.personalUseFlg;
            deepStrictEqual(
              typeof personalUseFlg === "undefined" || personalUseFlg === false,
              true
            );
          }
        } catch (e) {
          console.log(e);
          throw e;
        } finally {
          await TestUtil.deleteApplet(appletId);

          resp = await TestUtil.deleteBlock(blockServer, aBlkId);
          assert.deepStrictEqual(resp.status, 204);

          resp = await TestUtil.deleteBlock(blockServer, tBlkId);
          assert.deepStrictEqual(resp.status, 204);

          resp = await TestUtil.deleteBlock(blockServer, sBlkId);
          assert.deepStrictEqual(resp.status, 204);
        }
      });

      it("it should accept request with suspendFlg is true", async () => {
        // Create suspeneded action block
        const blockPostBody = TestUtil.getSamplePostBlock();
        blockPostBody.blockType = "action";
        let resp = await TestUtil.postBlock(blockServer, blockPostBody);
        assert.deepEqual(resp.status, 201);
        const aBlkId = resp.body.id;

        // Create suspeneded trigger block
        blockPostBody.blockType = "trigger";
        resp = await TestUtil.postBlock(blockServer, blockPostBody);
        assert.deepEqual(resp.status, 201);
        const tBlkId = resp.body.id;

        // Create suspeneded service block
        blockPostBody.blockType = "service";
        resp = await TestUtil.postBlock(blockServer, blockPostBody);
        assert.deepEqual(resp.status, 201);
        const sBlkId = resp.body.id;

        // Create an applet with special device Id and assign suspended blocks to applet
        const appletPostBody = TestUtil.getSamplePostApplet();
        appletPostBody.deviceId = deviceId;
        appletPostBody.action = aBlkId;
        appletPostBody.trigger = tBlkId;
        appletPostBody.service = sBlkId;
        resp = await request(server)
          .post("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(appletPostBody);
        assert.deepStrictEqual(resp.status, 201);
        const appletId = resp.body.id;

        try {
          const putBody = TestUtil.getSuspendBlock();
          putBody.blockId = aBlkId;
          resp = await TestUtil.putSuspendBlock(blockServer, putBody, root_key);
          assert.deepEqual(resp.status, 200);

          putBody.blockId = tBlkId;
          resp = await TestUtil.putSuspendBlock(blockServer, putBody, root_key);
          assert.deepEqual(resp.status, 200);

          putBody.blockId = sBlkId;
          resp = await TestUtil.putSuspendBlock(blockServer, putBody, root_key);
          assert.deepEqual(resp.status, 200);

          // Apply appletSuspend
          resp = await request(server)
            .put("/api/admin/appletSuspend")
            .set("Accept", "application/json")
            .set("Authorization", root_key)
            .send(putAppletSuspendBody)
            .expect("Content-Type", /json/);
          assert.deepEqual(resp.status, 201);

          // Check if appletSuspend is added to the created applet
          resp = await request(server)
            .get("/api/applets")
            .query({ version: version, suspendFlg: true })
            .set("Accept", "application/json")
            .set("Authorization", dummy_user_key)
            .expect("Content-Type", /json/)
            .expect(200);
          assert.deepStrictEqual(resp.status, 200);
          const applets = resp.body.applets;
          let appletInfo: any;
          for (appletInfo of applets) {
            const appletSuspend = appletInfo.applet.AppletSuspend;

            deepStrictEqual(
              (typeof appletSuspend.device !== "undefined" &&
                appletSuspend.device.deviceSuspendFlg) ||
                (typeof appletSuspend.action !== "undefined" &&
                  appletSuspend.action.blockSuspendFlg) ||
                (typeof appletSuspend.trigger !== "undefined" &&
                  appletSuspend.trigger.blockSuspendFlg) ||
                (typeof appletSuspend.service !== "undefined" &&
                  appletSuspend.service.blockSuspendFlg),
              true
            );
          }
        } catch (e) {
          console.log(e);
          throw e;
        } finally {
          await TestUtil.deleteApplet(appletId);

          resp = await TestUtil.deleteBlock(blockServer, aBlkId);
          assert.deepStrictEqual(resp.status, 204);

          resp = await TestUtil.deleteBlock(blockServer, tBlkId);
          assert.deepStrictEqual(resp.status, 204);

          resp = await TestUtil.deleteBlock(blockServer, sBlkId);
          assert.deepStrictEqual(resp.status, 204);
        }
      });

      it("it should accept request with suspendFlg is false", async () => {
        // Create suspeneded action block
        const blockPostBody = TestUtil.getSamplePostBlock();
        blockPostBody.blockType = "action";
        let resp = await TestUtil.postBlock(blockServer, blockPostBody);
        assert.deepEqual(resp.status, 201);
        const aBlkId = resp.body.id;

        // Create suspeneded trigger block
        blockPostBody.blockType = "trigger";
        resp = await TestUtil.postBlock(blockServer, blockPostBody);
        assert.deepEqual(resp.status, 201);
        const tBlkId = resp.body.id;

        // Create suspeneded service block
        blockPostBody.blockType = "service";
        resp = await TestUtil.postBlock(blockServer, blockPostBody);
        assert.deepEqual(resp.status, 201);
        const sBlkId = resp.body.id;

        // Create an applet with special device Id and assign suspended blocks to applet
        const appletPostBody = TestUtil.getSamplePostApplet();
        appletPostBody.deviceId = deviceId;
        appletPostBody.action = aBlkId;
        appletPostBody.trigger = tBlkId;
        appletPostBody.service = sBlkId;

        // Create an applet with special device Id
        resp = await request(server)
          .post("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(appletPostBody);
        assert.deepStrictEqual(resp.status, 201);
        const appletId = resp.body.id;

        try {
          const putBody = TestUtil.getSuspendBlock();
          putBody.blockSuspendFlg = false;
          putBody.blockId = aBlkId;
          resp = await TestUtil.putSuspendBlock(blockServer, putBody, root_key);
          assert.deepEqual(resp.status, 200);

          putBody.blockId = tBlkId;
          resp = await TestUtil.putSuspendBlock(blockServer, putBody, root_key);
          assert.deepEqual(resp.status, 200);

          putBody.blockId = sBlkId;
          resp = await TestUtil.putSuspendBlock(blockServer, putBody, root_key);
          assert.deepEqual(resp.status, 200);

          // Apply appletSuspend
          putAppletSuspendBody.deviceSuspendFlg = false;
          resp = await request(server)
            .put("/api/admin/appletSuspend")
            .set("Accept", "application/json")
            .set("Authorization", root_key)
            .send(putAppletSuspendBody)
            .expect("Content-Type", /json/);
          assert.deepEqual(resp.status, 201);

          // Check if appletSuspend is added to the created applet
          resp = await request(server)
            .get("/api/applets")
            .query({ version: version, suspendFlg: false })
            .set("Accept", "application/json")
            .set("Authorization", dummy_user_key)
            .expect("Content-Type", /json/)
            .expect(200);
          assert.deepStrictEqual(resp.status, 200);
          const applets = resp.body.applets;
          let appletInfo: any;
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
        } catch (e) {
          console.log(e);
          throw e;
        } finally {
          await TestUtil.deleteApplet(appletId);

          resp = await TestUtil.deleteBlock(blockServer, aBlkId);
          assert.deepStrictEqual(resp.status, 204);

          resp = await TestUtil.deleteBlock(blockServer, tBlkId);
          assert.deepStrictEqual(resp.status, 204);

          resp = await TestUtil.deleteBlock(blockServer, sBlkId);
          assert.deepStrictEqual(resp.status, 204);
        }
      });

      it("should accept request", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a vaild applet ID", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, appletId: appletID4GET })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a more than one applet IDs", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, appletId: [appletID4GET, appletID4GET2] })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a excluded applet ID", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, excludeAppletId: appletID4GET })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .expect(async res => {
            /* Verify if the ID is exclude */
            const applets = JSON.parse(JSON.stringify(res.body));
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < applets.length; i++) {
              if (applets[i].id === appletID4GET) {
                assert.fail("Exclude applet ID fail");
              }
            }
          })
          .end(done);
      });

      it("should accept request exclude more than one applet IDs", done => {
        request(server)
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
              if (
                applets[i].id === appletID4GET ||
                applets[i].id === appletID4GET2
              ) {
                assert.fail("Exclude applet ID fail");
              }
            }
          })
          .end(done);
      });

      it("should accept request a valid tool ID", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, toolId: toolID })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request with multiple valid tool ID", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, toolId: [toolID, appletID4GET2] })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a valid categoryId ID", done => {
        request(server)
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
        request(server)
          .get("/api/applets")
          .query({ version: version, categoryId: [categoryID, catID2] })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a vaild device ID", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, deviceId: deviceID })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a more than one device IDs", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, deviceId: [deviceID, deviceID2] })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a vaild vendor ID", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, vendorId: vendorID })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a vaild version", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a storeStatus are published", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, storeStatus: "published" })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a storeStatus are waiting_review", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, storeStatus: "waiting_review" })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a storeStatus are rejected", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, storeStatus: "rejected" })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a valid ownerID", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, ownerId: ownerID })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request multiple ownerIDs", done => {
        request(server)
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
        request(server)
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
        request(server)
          .get("/api/applets")
          .query({ version: version, title: title2, lang: lang2 })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should sort by like number", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, sortBy: "likeNum" })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .expect(res => {
            const appObj = res.body;
            const firstLikeNum = Number(appObj.applets[0].appletInfo.likeNum);
            const lastLikeNum = Number(
              appObj.applets[appObj.applets.length - 1].appletInfo.likeNum
            );
            assert.deepStrictEqual(
              firstLikeNum >= lastLikeNum,
              true,
              `Wrong sort order: ${firstLikeNum} > ${lastLikeNum}`
            );
          })
          .end(done);
      });

      it("should sort by release date", done => {
        request(server)
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
              firstReleaseDate = moment
                .utc(appObj.applets[0].appletInfo.release)
                .unix();
            }

            if (appObj.applets[appObj.applets.length - 1].appletInfo.release) {
              lastReleaseDate = moment
                .utc(
                  appObj.applets[appObj.applets.length - 1].appletInfo.release
                )
                .unix();
            }

            assert.deepStrictEqual(
              firstReleaseDate >= lastReleaseDate,
              true,
              `Wrong sort order: ${appObj.applets[0].appletInfo.release} > ${
                appObj.applets[appObj.applets.length - 1].appletInfo.release
              }`
            );
          })

          .end(done);
      });

      it("should contain submitDate in appletInfo", async () => {
        const exampleReqBody = JSON.parse(
          require("fs").readFileSync(
            `${__dirname}/testJsonFiles/appletsPostReqBody.json`
          )
        );
        let resp = await request(server)
          .post("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(exampleReqBody);
        assert.deepStrictEqual(resp.status, 201);
        const appletId = resp.body.id;

        try {
          // Check if submitDate is added to the created applet
          resp = await request(server)
            .get("/api/applets")
            .query({ version: version, appletId: appletId })
            .set("Accept", "application/json")
            .set("Authorization", dummy_user_key)
            .expect("Content-Type", /json/)
            .expect(200);
          assert.deepStrictEqual(resp.status, 200);
          const appletInfo = resp.body.applets[0].appletInfo;
          assert.notDeepStrictEqual(appletInfo.submitDate, undefined);
          assert.deepStrictEqual(
            TestUtil.isISO8601String(appletInfo.submitDate),
            true
          );
        } catch (e) {
          console.log(e);
          throw e;
        } finally {
          await TestUtil.deleteApplet(appletId);
        }
      });
      describe("with parameter sdkVersion, minSdkVersion, maxSdkVersion", () => {
        let appletId1 = '';
        let appletId2 = '';
        before(async () => {
          // Create suspeneded action block
          const blockPostBody = TestUtil.getSamplePostBlock();
          blockPostBody.blockType = "action";
          let resp = await TestUtil.postBlock(blockServer, blockPostBody);
          const aBlkId = resp.body.id;
  
          // Create suspeneded trigger block
          blockPostBody.blockType = "trigger";
          resp = await TestUtil.postBlock(blockServer, blockPostBody);
          const tBlkId = resp.body.id;
  
          // Create suspeneded service block
          blockPostBody.blockType = "service";
          resp = await TestUtil.postBlock(blockServer, blockPostBody);
          const sBlkId = resp.body.id;
  
          // Create an applet with special device Id and assign suspended blocks to applet
          const appletPostBody = TestUtil.getSamplePostApplet();
          appletPostBody.deviceId = deviceId;
          appletPostBody.action = aBlkId;
          appletPostBody.trigger = tBlkId;
          appletPostBody.sdkVersion = "1.10.0";
          appletPostBody.version = version;
          resp = await request(server)
            .post("/api/applets")
            .set("Accept", "application/json")
            .set("Authorization", dummy_user_key)
            .send(appletPostBody);
  
          appletId1 = resp.body.id;
  
          appletPostBody.sdkVersion = "1.5.0";
          resp = await request(server)
            .post("/api/applets")
            .set("Accept", "application/json")
            .set("Authorization", dummy_user_key)
            .send(appletPostBody);
  
          appletId2 = resp.body.id;
        });
  
        after(async () => {
          await TestUtil.deleteApplet(appletId1);
          await TestUtil.deleteApplet(appletId2);
        });
  
        it("GET /applets sdkVersion", async () => {
          let sdkVersion = "1.5.0"
          try {
            const rep = await request(server)
              .get("/api/applets")
              .query({ version, sdkVersion })
              .set("Accept", "application/json")
              .set("Authorization", dummy_user_key)
  
            assert.deepStrictEqual(rep.status, 200);
            let rs = rep.body.applets || [];
            assert(rs.length > 0);
            let index = rs.findIndex((element : any) => element.applet.sdkVersion !== sdkVersion);
            assert.deepStrictEqual(index, -1);
          } catch (e) {
            console.log(e);
            throw e;
          }
        });
  
        it("GET /applets minSdkVersion", async () => {
          let minSdkVersion = "1.0.0"
          try {
            const rep = await request(server)
              .get("/api/applets")
              .query({ version, minSdkVersion })
              .set("Accept", "application/json")
              .set("Authorization", dummy_user_key)
            assert.deepStrictEqual(rep.status, 200);
            let rs = rep.body.applets || [];
            assert.deepStrictEqual(rs.length > 0, true);
            let index = rs.findIndex((element : any) => element.applet.sdkVersion < minSdkVersion);
            assert.deepStrictEqual(index, -1);
          } catch (e) {
            console.log(e);
            throw e;
          }
        });
  
        it("GET /applets maxSdkVersion", async () => {
          let maxSdkVersion = "1.5.0"
          try {
            const rep = await request(server)
              .get("/api/applets")
              .query({ version, maxSdkVersion })
              .set("Accept", "application/json")
              .set("Authorization", dummy_user_key)
  
            assert.deepStrictEqual(rep.status, 200);
            let rs = rep.body.applets || [];
            assert(rs.length > 0);
            let index = rs.findIndex((element : any) => element.applet.sdkVersion > maxSdkVersion);
            assert.deepStrictEqual(index, -1);
          } catch (e) {
            console.log(e);
            throw e;
          }
        });
  
        it("GET /applets maxSdkVersion sdkVersion", async () => {
          let maxSdkVersion = "1.10.0";
          let sdkVersion = "1.5.0";
          try {
            //sdkVersion < maxSdkVersion
            let rep = await request(server)
              .get("/api/applets")
              .query({ version, maxSdkVersion, sdkVersion })
              .set("Accept", "application/json")
              .set("Authorization", dummy_user_key)
  
            assert.deepStrictEqual(rep.status, 200);
            let rs = rep.body.applets || [];
            assert(rs.length > 0);
            let index = rs.findIndex((element : any) => element.applet.sdkVersion !== sdkVersion);
            assert.deepStrictEqual(index, -1);
  
            //sdkVersion > maxSdkVersion
            let tmp = sdkVersion;
            sdkVersion = maxSdkVersion;
            maxSdkVersion = tmp;
  
            rep = await request(server)
              .get("/api/applets")
              .query({ version, maxSdkVersion, sdkVersion })
              .set("Accept", "application/json")
              .set("Authorization", dummy_user_key)
  
            assert.deepStrictEqual(rep.status, 200);
            rs = rep.body.applets || [];
            assert(rs.length === 0);
  
          } catch (e) {
            console.log(e);
            throw e;
          }
        });
  
        it("GET /applets minSdkVersion sdkVersion", async () => {
          let minSdkVersion = "1.5.0";
          let sdkVersion = "1.10.0";
          try {
            //sdkVersion > minSdkVersion
            let rep = await request(server)
              .get("/api/applets")
              .query({ version, minSdkVersion, sdkVersion })
              .set("Accept", "application/json")
              .set("Authorization", dummy_user_key)
  
            assert.deepStrictEqual(rep.status, 200);
            let rs = rep.body.applets || [];
            assert(rs.length > 0);
            let index = rs.findIndex((element : any) => element.applet.sdkVersion !== sdkVersion);
            assert.deepStrictEqual(index, -1);
  
            //sdkVersion < minSdkVersion
            let tmp = sdkVersion;
            sdkVersion = minSdkVersion;
            minSdkVersion = tmp;
  
            rep = await request(server)
              .get("/api/applets")
              .query({ version, minSdkVersion, sdkVersion })
              .set("Accept", "application/json")
              .set("Authorization", dummy_user_key)
  
            assert.deepStrictEqual(rep.status, 200);
            rs = rep.body.applets || [];
            assert(rs.length === 0);
  
          } catch (e) {
            console.log(e);
            throw e;
          }
        });
  
        it("GET /applets minSdkVersion maxSdkVersion", async () => {
          let minSdkVersion = "1.5.0";
          let maxSdkVersion = "1.10.0";
          try {
            //minSdkVersion < maxSdkVersion
            let rep = await request(server)
              .get("/api/applets")
              .query({ version, minSdkVersion, maxSdkVersion })
              .set("Accept", "application/json")
              .set("Authorization", dummy_user_key)
  
            assert.deepStrictEqual(rep.status, 200);
            let rs = rep.body.applets || [];
            let index = rs.findIndex((element : any) => element.applet.sdkVersion.localeCompare(maxSdkVersion, {}, {numeric: true}) === 1 || element.applet.sdkVersion.localeCompare(minSdkVersion, {}, {numeric: true}) ==- 1);
            assert.deepStrictEqual(index, -1);
  
            //minSdkVersion > maxSdkVersion
            let tmp = maxSdkVersion;
            maxSdkVersion = minSdkVersion;
            minSdkVersion = tmp;
            rep = await request(server)
              .get("/api/applets")
              .query({ version, minSdkVersion, maxSdkVersion })
              .set("Accept", "application/json")
              .set("Authorization", dummy_user_key)
  
            assert.deepStrictEqual(rep.status, 200);
            rs = rep.body.applets || [];
            assert(rs.length === 0);
          } catch (e) {
            console.log(e);
            throw e;
          }
        });
  
        it("GET /applets minSdkVersion maxSdkVersion sdkVersion", async () => {
          let minSdkVersion = "1.0.0";
          let maxSdkVersion = "1.10.0";
          let sdkVersion = "1.5.0"
          try {
            //sdkVersion in (minSdkVersion, maxSdkVersion)
            let rep = await request(server)
              .get("/api/applets")
              .query({ version, minSdkVersion, maxSdkVersion, sdkVersion })
              .set("Accept", "application/json")
              .set("Authorization", dummy_user_key)
  
            assert.deepStrictEqual(rep.status, 200);
            let rs = rep.body.applets || [];
            assert(rs.length > 0);
            let index = rs.findIndex((element : any) => element.applet.sdkVersion !== sdkVersion);
            assert.deepStrictEqual(index, -1);
            //sdkVersion not in (minSdkVersion, maxSdkVersion)
            sdkVersion = "0.0.0";
            rep = await request(server)
              .get("/api/applets")
              .query({ version, minSdkVersion, maxSdkVersion, sdkVersion })
              .set("Accept", "application/json")
              .set("Authorization", dummy_user_key)
  
            assert.deepStrictEqual(rep.status, 200);
            rs = rep.body.applets || [];
            assert(rs.length === 0);
  
          } catch (e) {
            console.log(e);
            throw e;
          }
        });
  
        it("GET /applets sdkVersion on User-Agent", async () => {
          let maxSdkVersion = "1.5.0"
          try {
            const rep = await request(server)
              .get("/api/applets")
              .query({ version})
              .set("Accept", "application/json")
              .set("Authorization", dummy_user_key)
              .set("User-Agent", `CITIZEN/1.1.047 iOS/14.3/RiiiverSDK/${maxSdkVersion}somethingok`)
  
            assert.deepStrictEqual(rep.status, 200);
            let rs = rep.body.applets || [];
            assert(rs.length > 0);
            let index = rs.findIndex((element : any) => element.applet.sdkVersion > maxSdkVersion);
            assert.deepStrictEqual(index, -1);
          } catch (e) {
            console.log(e);
            throw e;
          }
        });
  
      })
    });

    /* Create at post test , used for test, and delete in put */
    let gTestAppletId = "";
    /*************************************************************************
     * Test POST /applets
     ************************************************************************/
    describe("POST /applets", () => {
      const exampleReqBody = JSON.parse(
        require("fs").readFileSync(
          `${__dirname}/testJsonFiles/appletsPostReqBody.json`
        )
      );

      it("should reject request with 400 if personalInfoList parameters is invalid", done => {
        const invalidReqBody = Object.assign({}, exampleReqBody, {
          personalInfoList: ""
        });
        request(server)
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
        invalidReqBody.personalInfoList[0].serviceCompanyName = false
        request(server)
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
        invalidReqBody.personalInfoList[0].privacyPolicy = "test"
        request(server)
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
        invalidReqBody.personalInfoList[0].description = "test"
        request(server)
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
        invalidReqBody.personalInfoList[0].serviceCompanyName = "test"
        request(server)
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
        invalidReqBody.personalInfoList[0].typeList[0].type = "test"
        request(server)
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
        invalidReqBody.personalInfoList[0].typeList[0].description = "test"
        request(server)
          .post("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(invalidReqBody)
          .expect("Content-Type", /json/)
          .expect(400)
          .end(done);
      });


      it("should reject request with 400 if mandatory parameters are missing", done => {
        request(server)
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
        request(server)
          .post("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(invalidReqBody)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect(
            /"Expected type object but found type string","path":\["title"\]/
          )
          .expect(
            /"Expected type object but found type string","path":\["description"\]/
          )
          .end(done);
      });

      it("should reject request with 404 if trigger block does not exist", done => {
        const bodyWithNonExistingBlocks = Object.assign({}, exampleReqBody, {
          trigger: "virtualButton-5c9b2c888feb0f162f000000"
        });
        request(server)
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
        request(server)
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

        request(server)
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
        request(server)
          .post("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(invalidReqBody)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect(
            /"Missing required property: property","path":\["wirings","watchHand-5a96423c1388f9fd918f5c21","time"\]/
          )
          .end(done);
      });

      it("should reject request with 400 if preferences have invalid value", done => {
        const invalidReqBody = Object.assign({}, exampleReqBody, {
          preferences: { "watchHand-5a96423c1388f9fd918f5c21": "not_object" }
        });
        request(server)
          .post("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(invalidReqBody)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect(
            /"Expected type object but found type string","path":\["preferences","watchHand-5a96423c1388f9fd918f5c21"\]/
          )
          .end(done);
      });

      it("should accept request with valid parameters", async done => {
        request(server)
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
            const bodyWithNonExistingBlocks = Object.assign(
              {},
              exampleReqBody,
              { trigger: "NotExist-5a96423c1388f9fd918f5c1f" }
            );

            request(server)
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
            const wiringsWithTriggerAsWiringTarget = Object.assign(
              {},
              exampleReqBody.wirings,
              { "watchButton-5a96423c1388f9fd918f5c1f": {} }
            );
            const bodyWithTriggerAsWiringTarget = Object.assign(
              {},
              exampleReqBody,
              { wirings: wiringsWithTriggerAsWiringTarget }
            );

            request(server)
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

            request(server)
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
                message:
                  "Block type of 'schedule-5a96423c1388f9fd918f5c20' is not equal to 'trigger'"
              })
              .end(done);
          });

          // NOTE: Currently seed (sample) blocks do not have `required` properties in inputs, so the case for `MissingRequiredProperty` is lacking
          it(
            "should reject request with 400 if required input properties are missing"
          );
        });
      }
    });

    /*************************************************************************
     * Test PUT /applets
     ************************************************************************/
    describe("PUT /applets", () => {
      const exampleReqBody = JSON.parse(
        require("fs").readFileSync(
          `${__dirname}/testJsonFiles/appletsPutReqBody.json`
        )
      );

      let gAppletId = "";
      before(async () => {
        gAppletId = await TestUtil.postSampleApplet(server);
        exampleReqBody.appletId = gAppletId;
      });
      after(async () => {
        await TestUtil.deleteApplet(gAppletId);
      });

      it("should accept request with valid parameters", done => {
        exampleReqBody.appletId = gAppletId;
        request(server)
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
        request(server)
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
        request(server)
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
        request(server)
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

        request(server)
          .put("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(bodyWithNonExistingAction)
          .expect("Content-Type", /json/)
          .expect(404)
          .end(done);
      });

      it("should reject request with 400 if wirings have invalid value", async done => {
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

        request(server)
          .put("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(invalidReqBody)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect(
            /"Missing required property: property","path":\["wirings","watchHand-5a96423c1388f9fd918f5c21","time"\]/
          )
          .end(done);

        /* Clean up the generated applet ID */
        await TestUtil.deleteApplet(gAppletId);
      });
    });
  }); /* users */
}); /* controllers */
