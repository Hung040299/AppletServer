import * as fs from "fs";
import assert from "power-assert";
import request from "supertest";
import { TestUtil } from "../../utility/util";

const config = require("./config");

const server = config.server;
const root_key = config.root_key;
const dummy_user_key = config.dummy_user_key;

describe("controllers", () => {
  /* Test entry */
  describe("users", () => {
    /*************************************************************************
     * Test GET /createownapplets
     ************************************************************************/
    it("should accept request if id is valid", async () => {
      const blockServer = "http://127.0.0.1:10011"; // Refer to package.json
      const deviceId = "testDeviceId201908";
      const putAppletSuspendBody = {
        deviceId: `${deviceId}`,
        deviceSuspendFlg: true,
        deviceSuspendCode: "900"
      };

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

      assert.deepEqual(resp.status, 201);
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

        // Put enable appletSuspend
        resp = await request(server)
          .put("/api/admin/appletSuspend")
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .send(putAppletSuspendBody)
          .expect(201)
          .expect("Content-Type", /json/);

        // Get the result
        resp = await request(server)
          .get("/api/suspendCreateownapplets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/);
        assert.deepStrictEqual(resp.status, 200);
        assert.deepStrictEqual(resp.body.AppletSuspend.length > 0, true);
        let i = 0;

        // At least our post is in the records
        for (i = 0; i < resp.body.AppletSuspend.length; i++) {
          console.log(JSON.stringify(resp.body.AppletSuspend[i]));
          if (resp.body.AppletSuspend[i].action) {
            assert.deepStrictEqual(
              resp.body.AppletSuspend[i].action.blockSuspendFlg,
              true
            );
          } else if (resp.body.AppletSuspend[i].trigger) {
            assert.deepStrictEqual(
              resp.body.AppletSuspend[i].trigger.blockSuspendFlg,
              true
            );
          } else if (resp.body.AppletSuspend[i].service) {
            assert.deepStrictEqual(
              resp.body.AppletSuspend[i].service.blockSuspendFlg,
              true
            );
          } else if (resp.body.AppletSuspend[i].device) {
            assert.deepStrictEqual(
              resp.body.AppletSuspend[i].device.deviceSuspendFlg,
              true
            );
          }
        }
      } catch (e) {
        console.error(e);
        throw e;
      } finally {
        // Clean up useless applet
        await TestUtil.deleteApplet(appletId);

        resp = await TestUtil.deleteBlock(blockServer, aBlkId);
        assert.deepStrictEqual(resp.status, 204);

        resp = await TestUtil.deleteBlock(blockServer, tBlkId);
        assert.deepStrictEqual(resp.status, 204);

        resp = await TestUtil.deleteBlock(blockServer, sBlkId);
        assert.deepStrictEqual(resp.status, 204);
      }
    });

    it("should accept request if id is valid", async () => {
      try {
        // Get the result
        const resp = await request(server)
          .get("/api/suspendCreateownapplets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/);
        assert.deepStrictEqual(resp.status, 200);
        console.log(resp.body);
        assert.deepStrictEqual(resp.body.AppletSuspend.length, 0);
      } catch (e) {
        console.error(e);
        throw e;
      }
    });
  });
});
