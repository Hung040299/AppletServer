import { OSType } from "ER_Proto_Block_Server/test_api/client/api";
import { IncomingMessage } from "http";
import assert from "power-assert";
import request from "supertest";
import * as api from "../../utility/api";
import { TestUtil } from "../../utility/util";

/* tslint:disable: no-var-requires */
const config = require("./config");
/* tslint:enable: no-var-requires */

const server = config.server;
const deviceID = config.deviceID;
const deviceID2 = config.deviceID2;
const fakeDeviceID = config.fakeDeviceID;
const fakeAppletID = config.fakeAppletID;
const dummy_user_key = config.dummy_user_key;
const root_key = config.root_key;

const verifySuccessStatus = (ustatus: number | undefined) => {
  assert.notDeepEqual(ustatus, undefined);
  const status = ustatus as number;
  assert.strictEqual(status >= 200, true);
  assert.strictEqual(status < 300, true);
};

const verifyDeleteStatus = (
  ustatus: number | undefined,
  sstatus: string,
  storeStatus?: string | undefined
) => {
  assert.notDeepEqual(ustatus, undefined);
  const status = ustatus as number;
  assert.strictEqual(status >= 200, true);
  assert.strictEqual(status < 300, true);
  if (sstatus === "deleted" || sstatus === "published" || sstatus === "waiting_review" || sstatus === "testing") {
    assert.strictEqual(storeStatus === "deleted", true);
  } else if (sstatus === "rejected") {
    assert.deepStrictEqual(ustatus === 204, true);
  } else {
    // nothing to do
  }
};

describe("controllers", () => {
  /* Test entry */
  const gDefaultApi = new api.DefaultApi();
  const gRootKeyApi = new api.DefaultApi();
  let gAppletId = "";
  let gAppletId2 = "";
  before(async () => {
    gDefaultApi.setApiKey(api.DefaultApiApiKeys.JWTToken, dummy_user_key);
    gDefaultApi.basePath = TestUtil.mServerBaseUrl;

    gRootKeyApi.setApiKey(api.DefaultApiApiKeys.JWTToken, root_key);
    gRootKeyApi.basePath = TestUtil.mServerBaseUrl;

    gAppletId = await TestUtil.postSampleAppletWithKey(server, dummy_user_key);
    gAppletId2 = await TestUtil.postSampleAppletWithKey(server, dummy_user_key);
  });

  after(async () => {
    await TestUtil.deleteAppletWithKey(gAppletId, dummy_user_key);
    await TestUtil.deleteAppletWithKey(gAppletId2, dummy_user_key);
  });

  describe("users", () => {
    /*************************************************************************
     * Test GET /applets/{id}
     ************************************************************************/
    describe("GET /applets/{id}", () => {
      // For osType testing
      let testOSTypeAppletID = "";

      before(async () => {
        const postJson = TestUtil.getSamplePostApplet();
        postJson.osType = OSType.OSTypeEnum.Android;
        testOSTypeAppletID = await TestUtil.postApplet(server, postJson);
      });

      after(async () => {
        await TestUtil.deleteAppletWithKey(testOSTypeAppletID, dummy_user_key);
      });

      // Test starts here
      it("should reject request with 400 if id is invalid", done => {
        request(server)
          .get("/api/applets/not_bson_object_id")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect(
            '{"code":"PATTERN","failedValidation":true,"path":["paths","/applets/{id}","get","parameters","0"],"paramName":"id"}'
          )
          .end(done);
      });

      it("should accept request without deviceID", done => {
        request(server)
          .get(`/api/applets/${gAppletId}`)
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request if deviceId is valid", done => {
        request(server)
          .get(`/api/applets/${gAppletId}`)
          .query({ deviceId: deviceID })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request if thre are more than one device id, and are valid", done => {
        request(server)
          .get(`/api/applets/${gAppletId}`)
          .query({ deviceId: deviceID, deviceID2 })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should not accept a non existed device id", done => {
        request(server)
          .get(`/api/applets/${gAppletId}`)
          .query({ deviceId: fakeDeviceID })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(404)
          .end(done);
      });
    });

    /*************************************************************************
     * Test DELETE /applets/{id}
     ************************************************************************/
    describe("DELETE /applets/{id}", () => {
      it("should reject request with 400 if id is invalid", done => {
        request(server)
          .delete("/api/applets/not_bson_object_id")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect(
            '{"code":"PATTERN","failedValidation":true,"path":["paths","/applets/{id}","delete","parameters","0"],"paramName":"id"}'
          )
          .end(done);
      });

      it("should accept request if id is valid", async () => {
        const appletId = await TestUtil.postSampleAppletWithKey(
          server,
          dummy_user_key
        );
        try {
          const resp = await gDefaultApi.deleteApplet(appletId);
          verifySuccessStatus(resp.response.statusCode);
        } catch (e) {
          throw e;
        }
      });

      it("should chage AppletStoreStatus to deleted when it was published", async () => {
        const appletId = await TestUtil.postSampleAppletWithKey(
          server,
          dummy_user_key
        );

        const sbody = new api.Body7();
        sbody.appletId = appletId;
        sbody.status = api.Body7.StatusEnum.Published;
        sbody.message = "test";
        const resp = await gRootKeyApi.putAppletStoreStatus(sbody);
        assert.deepStrictEqual(resp.response.statusCode, 201);

        try {
          const resp2 = await gDefaultApi.deleteApplet(appletId);
          assert.deepStrictEqual(resp2.response.statusCode, 204);
          const resp3 = await gDefaultApi.getApplet(appletId);
          // applet logically deleted
          assert.deepStrictEqual(resp3.response.statusCode, 200);
          const resp4 = await gRootKeyApi.getAppletStoreStatus(appletId);
          assert.deepStrictEqual(resp4.response.statusCode, 200);
          assert.deepStrictEqual(resp4.body.status, "deleted");
        } catch (e) {
          throw e;
        }
      });

      it("should delete data if AppletStoreStatus is Rejected", async () => {
        const appletId = await TestUtil.postSampleAppletWithKey(
          server,
          dummy_user_key
        );

        const sbody = new api.Body7();
        sbody.appletId = appletId;
        sbody.status = api.Body7.StatusEnum.Rejected;
        sbody.message = "test";
        const resp = await gRootKeyApi.putAppletStoreStatus(sbody);
        assert.deepStrictEqual(resp.response.statusCode, 201);

        try {
          const resp2 = await gDefaultApi.deleteApplet(appletId);
          verifyDeleteStatus(resp2.response.statusCode, "rejected");
        } catch (e) {
          throw e;
        }
        let success = true;
        try {
          const resp3 = await gDefaultApi.getApplet(appletId);
          success = false;
        } catch (e) {
          const eresp = e.response as IncomingMessage;
          assert.deepStrictEqual(eresp.statusCode, 404);
        }
        assert.deepStrictEqual(success, true);
      });

      it("should change AppletStoreStatus to deleted when it is WaitingReview", async () => {
        const appletId = await TestUtil.postSampleAppletWithKey(
          server,
          dummy_user_key
        );

        const sbody = new api.Body7();
        sbody.appletId = appletId;
        sbody.status = api.Body7.StatusEnum.WaitingReview;
        const resp = await gRootKeyApi.putAppletStoreStatus(sbody);
        assert.deepStrictEqual(resp.response.statusCode, 201);

        try {
          const resp2 = await gDefaultApi.deleteApplet(appletId);
          assert.deepStrictEqual(resp2.response.statusCode, 204);
          const resp3 = await gRootKeyApi.getAppletStoreStatus(appletId);
          assert.deepStrictEqual(resp3.response.statusCode, 200);
          // verifyDeleteStatus(resp2.response.statusCode, "waiting_review", resp3.body.status);
          assert.deepStrictEqual(resp3.body.status, "deleted");

        } catch (e) {
          throw e;
        }
      });

      it("should do nothing if AppletStoreStatus is deleted", async () => {
        const appletId = await TestUtil.postSampleAppletWithKey(
          server,
          dummy_user_key
        );

        const sbody = new api.Body7();
        sbody.appletId = appletId;
        sbody.status = api.Body7.StatusEnum.Deleted;
        const resp = await gRootKeyApi.putAppletStoreStatus(sbody);
        assert.deepStrictEqual(resp.response.statusCode, 201);

        try {
          const resp2 = await gDefaultApi.deleteApplet(appletId);
          assert.deepStrictEqual(resp2.response.statusCode, 204);
        } catch (e) {
          throw e;
        }
      });

      it("should reject request if id is not valid", done => {
        request(server)
          .delete("/api/applets/" + fakeAppletID)
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(404)
          .end(done);
      });
    });
  });
});
