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
  if (sstatus === "deleted" || sstatus === "published") {
    assert.strictEqual(storeStatus === "deleted", true);
  } else if (sstatus === "rejected" || sstatus === "waiting_review") {
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
     * Test GET /appletCopy
     ************************************************************************/
    describe("GET /appletCopy", () => {
      let appletId = "";
      let appletCopyId = "";
      let preferenceId = "";

      before(async () => {
        appletId = await TestUtil.postSampleApplet(server);
        preferenceId = await TestUtil.putUserPreference({
          appletId: appletId,
          preferenceName: null,
          triggerBlockId: null,
          triggerDeviceId: null,
          triggerUserId: null,
          serviceBlockId: null,
          serviceDeviceId: null,
          serviceUserId: null,
          actionBlockId: null,
          actionDeviceId: null,
          actionUserId: null,
          actionTagId: null
        });
        appletCopyId = await TestUtil.postAppletCopy(server, {
          userId: config.ownerID,
          appletId: appletId,
          userPreferenceId: preferenceId
        });
      });

      after(async () => {
        await TestUtil.deleteAppletCopy(server, appletCopyId);
        await TestUtil.delUserPreference(preferenceId);
        await TestUtil.deleteApplet(appletId);
      });

      // Test starts here
      it("should reject request with 400 if id is invalid", done => {
        request(server)
          .get("/api/appletCopy?userPreferenceId=not_bson_object_id")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect(
            '{"code":"PATTERN","failedValidation":true,"path":["paths","/appletCopy","get","parameters","0"],"paramName":"userPreferenceId"}'
          )
          .end(done);
      });

      it("should reject request with 400 no parameter", done => {
        request(server)
          .get("/api/appletCopy")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect(
            '{"code":"REQUIRED","failedValidation":true,"path":["paths","/appletCopy","get","parameters","0"],"paramName":"userPreferenceId"}'
          )
          .end(done);
      });

      it("should reject request with 400 bad parameter", done => {
        request(server)
          .get("/api/appletCopy?u=x")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(400)
          .expect(
            '{"code":"REQUIRED","failedValidation":true,"path":["paths","/appletCopy","get","parameters","0"],"paramName":"userPreferenceId"}'
          )
          .end(done);
      });

      it("should reject request with 401 No auth", done => {
        request(server)
          .get("/api/appletCopy?u=x")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(401)
          .expect(
            '{"code":"401-00","message":"InvalidCredential"}'
          )
          .end(done);
      });

      it("should accept request", done => {
        request(server)
          .get(`/api/appletCopy?userPreferenceId=${preferenceId}`)
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });
    });

    /*************************************************************************
     * Test POST /appletCopy
     ************************************************************************/
    describe("POST /appletCopy", () => {
      let appletId = "";
      let preferenceId = "";

      before(async () => {
        appletId = await TestUtil.postSampleApplet(server);
        preferenceId = await TestUtil.putUserPreference({
          appletId: appletId,
          preferenceName: null,
          triggerBlockId: null,
          triggerDeviceId: null,
          triggerUserId: null,
          serviceBlockId: null,
          serviceDeviceId: null,
          serviceUserId: null,
          actionBlockId: null,
          actionDeviceId: null,
          actionUserId: null,
          actionTagId: null
        });
      });

      after(async () => {
        await TestUtil.delUserPreference(preferenceId);
        await TestUtil.deleteApplet(appletId);
      });

      // Test starts here
      it("should reject request with 400 if mandatory parameters are missing", done => {
        request(server)
          .post("/api/appletCopy")
          .set("Accept", "application/json")
          .send({})
          .expect("Content-Type", /json/)
          .expect(400)
          .expect(/Missing required property: userId/)
          .expect(/Missing required property: userPreferenceId/)
          .expect(/Missing required property: appletId/)
          .end(done);
      });

      it("should reject request with 404 if appletId is invalid", done => {
        request(server)
          .post("/api/appletCopy")
          .set("Accept", "application/json")
          .send({
            appletId: 'noapplet',
            userPreferenceId: preferenceId,
            userId: config.ownerID
          })
          .expect("Content-Type", /json/)
          .expect(404)
          .expect(
            '{"code":"404-01","message":"invalid parameters: appletId"}'
          )
          .end(done);
      });

      it("should reject request with 404 if userPreferenceId is invalid", done => {
        request(server)
          .post("/api/appletCopy")
          .set("Accept", "application/json")
          .send({
            appletId: appletId,
            userPreferenceId: 'illegalid',
            userId: config.ownerID
          })
          .expect("Content-Type", /json/)
          .expect(404)
          .expect(
            '{"code":"404-01","message":"invalid parameters: userPreferenceId"}'
          )
          .end(done);
      });

      it("should accept request", async done => {
        let result = await request(server)
          .post(`/api/appletCopy`)
          .set("Accept", "application/json")
          .send({
            appletId: appletId,
            userPreferenceId: preferenceId,
            userId: config.ownerID
          })
          .expect("Content-Type", /json/)
          .expect(201);

        TestUtil.deleteAppletCopy(server, result.body.applet_copy_id);
        done();
      });
    });
    /*************************************************************************
     * Test DELETE /appletCopy
     ************************************************************************/
    describe("DELETE /appletCopy", () => {
      let appletId = "";
      let preferenceId = "";

      before(async () => {
        appletId = await TestUtil.postSampleApplet(server);
        preferenceId = await TestUtil.putUserPreference({
          appletId: appletId,
          preferenceName: null,
          triggerBlockId: null,
          triggerDeviceId: null,
          triggerUserId: null,
          serviceBlockId: null,
          serviceDeviceId: null,
          serviceUserId: null,
          actionBlockId: null,
          actionDeviceId: null,
          actionUserId: null,
          actionTagId: null
        });
      });

      after(async () => {
        await TestUtil.delUserPreference(preferenceId);
        await TestUtil.deleteApplet(appletId);
      });

      // Test starts here
      it("should reject request with 400 if mandatory parameters are missing", done => {
        request(server)
          .delete("/api/appletCopy")
          .set("Accept", "application/json")
          .expect(404)
          .expect(/Cannot DELETE \/api\/appletCopy/)
          .end(done);
      });

      it("should reject request with 400 if appletCopyId is invalid", done => {
        request(server)
          .delete("/api/appletCopy/not_bson_object_id")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(400)
          .expect(
            '{"code":"PATTERN","failedValidation":true,"path":["paths","/appletCopy/{applet_copy_id}","delete","parameters","0"],"paramName":"applet_copy_id"}'
          )
          .end(done);
      });

      it("should reject request with 404 if userPreferenceId is invalid", done => {
        request(server)
          .delete("/api/appletCopy/" + config.ownerID)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(404)
          .expect(
            '{"code":"404-04","description":"The resource does not exist in the database.","error":"ResourceNotFound"}')
          .end(done);
      });

      it("should accept request", async done => {
        let appletCopyId = await TestUtil.postAppletCopy(server, {
          userId: config.ownerID,
          appletId: appletId,
          userPreferenceId: preferenceId
        });
        let result = await request(server)
          .delete(`/api/appletCopy/${appletCopyId}`)
          .set("Accept", "application/json")
          .expect(204);
        done();
      });
    });
  });
});
