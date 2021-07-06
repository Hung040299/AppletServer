import assert from "power-assert";
import request from "supertest";
import { TestUtil } from "../../utility/util";

/* tslint:disable: no-var-requires */
const config = require("./config");
/* tslint:enable: no-var-requires */

const root_key = config.root_key;
const server = config.server;
const userKey = config.dummy_user_key;
const version = config.version;
const deviceId = "putAppletSuspendBody201908";
const putAppletSuspendBody = {
  deviceId: `${deviceId}`,
  deviceSuspendFlg: false,
  deviceSuspendCode: "900"
};

describe("controllers", () => {
  /*************************************************************************
   * Test PUT /appletSuspend
   ************************************************************************/
  describe("PUT /appletSuspend", () => {
    it("it should accept request with valid parameters", async () => {
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
          .query({ version: version, appletId: appletId })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(200);
        assert.deepStrictEqual(resp.status, 200);
        assert.deepStrictEqual(resp.body.applets.length, 1);
        assert.deepStrictEqual(
          resp.body.applets[0].applet.AppletSuspend.device.deviceId,
          deviceId
        );
        console.log(JSON.stringify(resp.body.applets[0].applet));
      } catch (e) {
        console.log(e);
        throw e;
      } finally {
        await TestUtil.deleteApplet(appletId);
      }
    });

    it("it should reject request if deviceSuspendFlg is true and deviceSuspendCode is empty", async done => {
      const exampleReqBody = putAppletSuspendBody;
      exampleReqBody.deviceSuspendFlg = true;
      delete exampleReqBody.deviceSuspendCode;
      request(server)
        .put("/api/admin/appletSuspend")
        .set("Accept", "application/json")
        .set("Authorization", root_key)
        .send(exampleReqBody)
        .expect(400)
        .expect("Content-Type", /json/)
        .end(done);
    });
  });
});
