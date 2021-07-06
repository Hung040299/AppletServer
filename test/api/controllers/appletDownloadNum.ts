import assert from "power-assert";
import request from "supertest";
import { getCookie } from "../../utility/cookie_getter";
import { TestUtil } from "../../utility/util";

const config = require("./config");

const server = config.server;
const appletID4GET = config.appletID4GET;
const appletID4GET2 = config.appletID4GET2;
const toolID = config.toolID;
const categoryID = config.categoryID;
const deviceID = config.deviceID;
const deviceID2 = config.deviceID2;
const fakeDeviceID = config.fakeDeviceID;
const vendorID = config.vendorID;
const version = config.version;
const ownerID = config.ownerID;
const ownerID2 = config.ownerID2;
const appletID = config.appletID;
const fakeAppletID = config.fakeAppletID;
const fakeAppletID2 = config.fakeAppletID2;
const dummy_user_key = config.dummy_user_key;

describe("controllers", () => {
  /* Test entry */
  describe("users", () => {
    /*************************************************************************
     * Test GET /appletDownloadNum
     ************************************************************************/
    describe("GET /appletDownloadNum", () => {
      it("should accept request", async done => {
        const appletId = await TestUtil.postSampleApplet(server);
        request(server)
          .get("/api/appletDownloadNum")
          .query({ appletId: appletId })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .expect(res => {
            assert.deepStrictEqual(res.body.num, 0);
            assert.deepStrictEqual(res.body.appletId, appletId);
          })
          .end(done);
      });

      it("should get 404 if appletID is not valid", done => {
        request(server)
          .get("/api/appletDownloadNum")
          .query({ appletId: fakeAppletID })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(404)
          .end(done);
      });
    });
  }); /* users */
}); /* controllers */
