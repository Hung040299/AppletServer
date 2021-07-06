import { IncomingMessage } from "http";
import assert from "power-assert";
import request from "supertest";
import * as api from "../../utility/api";
import { TestUtil } from "../../utility/util";

/* tslint:disable: no-var-requires */
const config = require("./config");
/* tslint:enable: no-var-requires */

const server = config.server;
const fakeAppletID = config.fakeAppletID;
const dummy_user_key = config.dummy_user_key;
const root_key = config.root_key;

describe("controllers", () => {
  /* Test entry */
  const gDefaultApi = new api.DefaultApi();
  const gRootKeyApi = new api.DefaultApi();
  before(async () => {
    gDefaultApi.setApiKey(api.DefaultApiApiKeys.JWTToken, dummy_user_key);
    gDefaultApi.basePath = TestUtil.mServerBaseUrl;

    gRootKeyApi.setApiKey(api.DefaultApiApiKeys.JWTToken, root_key);
    gRootKeyApi.basePath = TestUtil.mServerBaseUrl;
  });

  describe("users", () => {
    /*************************************************************************
     * Test GET /appletStoreStatus
     ************************************************************************/
    describe("GET /appletStoreStatus", () => {
      it("should accept request", async done => {
        const appletId = await TestUtil.postSampleAppletWithKey(
          server,
          dummy_user_key
        );
        try {
          request(server)
            .get("/api/appletStoreStatus")
            .query({ appletId: appletId })
            .set("Accept", "application/json")
            .set("Authorization", root_key)
            .expect("Content-Type", /json/)
            .expect(200)
            .end(done);
        } catch (e) {
          const resp = e.response as IncomingMessage;
          assert.fail(resp.statusCode);
          return;
        } finally {
          await TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
        }
      });

      it("should fail due to unavailable ID", done => {
        request(server)
          .get("/api/appletStoreStatus")
          .query({ appletId: fakeAppletID })
          .set("Accept", "application/json")
          .set("Authorization", root_key)
          .expect("Content-Type", /json/)
          .expect(404)
          .end(done);
      });
    });

    /*************************************************************************
     * Test POST /appletStoreStatus
     ************************************************************************/
    describe("POST /appletStoreStatus", () => {
      it("should accept request with valid parameters", async () => {
        // Should fail with 401 when actually requesting to Dodai (NODE_ENV !== 'test')a
        const appletId = await TestUtil.postSampleAppletWithKey(
          server,
          dummy_user_key
        );
        const body = new api.Body7();
        body.appletId = appletId;
        body.status = api.Body7.StatusEnum.Rejected;
        body.message = "test";
        try {
          const resp = await gDefaultApi.postAppletStoreStatus(body);
          assert.deepStrictEqual(resp.response.statusCode, 201);
        } catch (e) {
          const resp = e.response as IncomingMessage;
          assert.fail(resp.statusCode);
        } finally {
          await TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
        }
      });

      it("should fail due to unavailable ID", async () => {
        // Should fail with 401 when actually requesting to Dodai (NODE_ENV !== 'test')a

        const body = new api.Body7();
        body.appletId = "500000000000000000000001";
        body.status = api.Body7.StatusEnum.Rejected;
        body.message = "test";
        try {
          const resp = await gDefaultApi.postAppletStoreStatus(body);
        } catch (e) {
          const resp = e;
          assert.deepStrictEqual(resp.response.statusCode, 404);
          return;
        }
      });
    });

    /*************************************************************************
     * Test PUT /appletStoreStatus
     ************************************************************************/
    describe("PUT /appletStoreStatus", () => {
      it("should accept request with valid parameters", async () => {
        // Should fail with 401 when actually requesting to Dodai (NODE_ENV !== 'test')
        const appletId = await TestUtil.postSampleAppletWithKey(
          server,
          dummy_user_key
        );
        const body = new api.Body7();
        body.appletId = appletId;
        body.status = api.Body7.StatusEnum.Rejected;
        body.message = "test";
        let resp = await gDefaultApi.postAppletStoreStatus(body);
        assert.deepStrictEqual(resp.response.statusCode, 201);

        try {
          // release must not be set
          let ares = await gDefaultApi.listApplets("1.0.0", [appletId]);
          assert.deepStrictEqual(ares.response.statusCode, 200);
          assert.notDeepStrictEqual(ares.body.applets, undefined);
          let list = ares.body.applets as api.AppletWholeInfo[];
          assert.deepStrictEqual(list.length, 1);
          assert.deepStrictEqual(list[0].appletInfo.release, undefined);

          const sbody = new api.Body6();
          sbody.appletId = appletId;
          sbody.status = api.Body7.StatusEnum.Published;
          sbody.message = "test";
          resp = await gRootKeyApi.putAppletStoreStatus(sbody);
          const res = JSON.parse(JSON.stringify(resp.response));
          const date = Date.parse(res.body.release);
          assert.notDeepStrictEqual(date, NaN); // Date must valid
          assert.deepStrictEqual(resp.response.statusCode, 201);

          // release must be set
          ares = await gDefaultApi.listApplets("1.0.0", [appletId]);
          assert.deepStrictEqual(ares.response.statusCode, 200);
          assert.notDeepStrictEqual(ares.body.applets, undefined);
          list = ares.body.applets as api.AppletWholeInfo[];
          assert.deepStrictEqual(list.length, 1);
          assert.notDeepStrictEqual(list[0].appletInfo.release, undefined);
          assert.deepStrictEqual(
            TestUtil.isISO8601String(list[0].appletInfo.release as any),
            true
          );
        } catch (e) {
          const eresp = e.response as IncomingMessage;
          assert.fail(eresp.statusCode);
        } finally {
          await TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
        }
      });

      it("should fail due to unavailable ID", async () => {
        // Should fail with 401 when actually requesting to Dodai (NODE_ENV !== 'test')
        const body = new api.Body6();
        body.appletId = "500000000000000000000001";
        body.status = api.Body6.StatusEnum.Rejected;
        body.message = "test";
        try {
          const resp = await gRootKeyApi.putAppletStoreStatus(body);
        } catch (e) {
          const resp = e;
          assert.deepStrictEqual(resp.response.statusCode, 404);
          return;
        }
      });
    });
  }); /* users */
}); /* controllers */
