import moment from "moment";
import assert, { deepStrictEqual } from "power-assert";
import request from "supertest";
import { TestUtil } from "../../utility/util";
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
        const appletPostBody = TestUtil.getSamplePostApplet();
        appletPostBody.deviceId = deviceId;
        appletPostBody["personalUseFlg"] = true;
        let resp = await request(server)
          .post("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", userKey)
          .send(appletPostBody);
        assert.deepStrictEqual(resp.status, 201);
        const appletId = resp.body.id;

        try {
          // Check if appletSuspend is added to the created applet
          resp = await request(server)
            .get("/api/admin/applets")
            .query({ version: version, personalUseFlg: true })
            .set("Accept", "application/json")
            .set("Authorization", root_key)
            .expect("Content-Type", /json/)
            .expect(200);
          assert.deepStrictEqual(resp.status, 200);
          const applets = resp.body.applets;
          let applet: any;
          for (applet of applets) {
            //console.log(applet.applet);
            const personalUseFlg = applet.applet.personalUseFlg;
            deepStrictEqual(personalUseFlg, true);
          }
        } catch (e) {
          console.log(e);
          throw e;
        } finally {
          await TestUtil.deleteApplet(appletId);
        }
      });

      it("it should accept request with personalUseFlg is false", async () => {
        const deviceId = "getAppletTestPersonalUseBody201912";

        // Create an applet with special device Id
        const appletPostBody = TestUtil.getSamplePostApplet();
        appletPostBody.deviceId = deviceId;
        appletPostBody["personalUseFlg"] = false;
        let resp = await request(server)
          .post("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", userKey)
          .send(appletPostBody);
        assert.deepStrictEqual(resp.status, 201);
        const appletId = resp.body.id;

        try {
          // Check if appletSuspend is added to the created applet
          resp = await request(server)
            .get("/api/admin/applets")
            .query({ version: version, personalUseFlg: false })
            .set("Accept", "application/json")
            .set("Authorization", root_key)
            .expect("Content-Type", /json/)
            .expect(200);
          assert.deepStrictEqual(resp.status, 200);
          const applets = resp.body.applets;
          let applet: any;      
          for (applet of applets) {
            //console.log(applet.applet);
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
        const appletPostBody = TestUtil.getSamplePostApplet();
        appletPostBody.deviceId = deviceId;
        let resp = await request(server)
          .post("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", userKey)
          .send(appletPostBody);
        assert.deepStrictEqual(resp.status, 201);
        const appletId = resp.body.id;

        try {
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
            .get("/api/admin/applets")
            .query({ version: version, suspendFlg: true })
            .set("Accept", "application/json")
            .set("Authorization", root_key)
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
        const appletPostBody = TestUtil.getSamplePostApplet();
        appletPostBody.deviceId = deviceId;
        let resp = await request(server)
          .post("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", userKey)
          .send(appletPostBody);
        assert.deepStrictEqual(resp.status, 201);
        const appletId = resp.body.id;

        try {
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
            .get("/api/admin/applets")
            .query({ version: version, suspendFlg: false })
            .set("Accept", "application/json")
            .set("Authorization", root_key)
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
        }
      });

      it("should accept request", done => {
        request(server)
          .get("/api/admin/applets")
          .query({ version: version })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a vaild applet ID", done => {
        request(server)
          .get("/api/admin/applets")
          .query({ version: version, appletId: appletID4GET })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a more than one applet IDs", done => {
        request(server)
          .get("/api/admin/applets")
          .query({ version: version, appletId: [appletID4GET, appletID4GET2] })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a excluded applet ID", done => {
        request(server)
          .get("/api/admin/applets")
          .query({ version: version, excludeAppletId: appletID4GET })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
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
          .get("/api/admin/applets")
          .query({ version: version, toolId: toolID })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request with multiple valid tool ID", done => {
        request(server)
          .get("/api/admin/applets")
          .query({ version: version, toolId: [toolID, appletID4GET2] })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a valid categoryId ID", done => {
        request(server)
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
        request(server)
          .get("/api/admin/applets")
          .query({ version: version, categoryId: [categoryID, catID2] })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a vaild device ID", done => {
        request(server)
          .get("/api/admin/applets")
          .query({ version: version, deviceId: deviceID })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a more than one device IDs", done => {
        request(server)
          .get("/api/admin/applets")
          .query({ version: version, deviceId: [deviceID, deviceID2] })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a vaild vendor ID", done => {
        request(server)
          .get("/api/admin/applets")
          .query({ version: version, vendorId: vendorID })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a vaild version", done => {
        request(server)
          .get("/api/admin/applets")
          .query({ version: version })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a storeStatus are published", done => {
        request(server)
          .get("/api/admin/applets")
          .query({ version: version, storeStatus: "published" })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a storeStatus are waiting_review", done => {
        request(server)
          .get("/api/admin/applets")
          .query({ version: version, storeStatus: "waiting_review" })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a storeStatus are rejected", done => {
        request(server)
          .get("/api/admin/applets")
          .query({ version: version, storeStatus: "rejected" })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request a valid ownerID", done => {
        request(server)
          .get("/api/admin/applets")
          .query({ version: version, ownerId: ownerID })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request multiple ownerIDs", done => {
        request(server)
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
        request(server)
          .get("/api/admin/applets")
          .query({ version: version, title: title1, lang: lang1 })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should sort by like number", done => {
        request(server)
          .get("/api/admin/applets")
          .query({ version: version, sortBy: "likeNum" })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
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

      it("should accept a limited number of request body", done => {
        request(server)
          .get("/api/admin/applets")
          .query({ version: version, limit: limit })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .expect(async ret => {
            assert.strictEqual(ret.body.length, limit);
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
      request(server)
        .get("/api/admin/applets")
        .query({ version: version, osType: "none" })
        .set("Accept", "application/json")
        .set("Authorization", root_key)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(done);
    });

    it("should accept request with osType=iOS", done => {
      request(server)
        .get("/api/admin/applets")
        .query({ version: version, osType: "iOS" })
        .set("Accept", "application/json")
        .set("Authorization", root_key)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(done);
    });

    it("should accept request with osType=Android", done => {
      request(server)
        .get("/api/admin/applets")
        .query({ version: version, osType: "Android" })
        .set("Accept", "application/json")
        .set("Authorization", root_key)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(done);
    });

    it("should reject request with invalid osType", done => {
      request(server)
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
