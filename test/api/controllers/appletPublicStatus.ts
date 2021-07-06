import { IncomingMessage } from "http";
import assert from "power-assert";
import request from "supertest";
import * as api from "../../utility/api";
import { getCookie } from "../../utility/cookie_getter";
import { TestUtil } from "../../utility/util";

/* tslint:disable: no-var-requires */
const config = require("./config");
/* tslint:enable: no-var-requires */

const server = config.server;
const fakeAppletID2 = config.fakeAppletID2;
const dummy_user_key = config.dummy_user_key;

describe("controllers", () => {
  /* Test entry */

  const gDefaultApi = new api.DefaultApi();
  before(async () => {
    gDefaultApi.setApiKey(api.DefaultApiApiKeys.JWTToken, dummy_user_key);
    gDefaultApi.basePath = TestUtil.mServerBaseUrl;
  });

  describe("users", () => {
    /*************************************************************************
     * Test GET /appletPublicStatus
     ************************************************************************/
    describe("GET /appletPublicStatus", () => {
      it("should accept request", async done => {
        const appletId = await TestUtil.postSampleAppletWithKey(
          server,
          dummy_user_key
        );
        try {
          request(server)
            .get("/api/appletPublicStatus")
            .query({ appletId: appletId })
            .set("Accept", "application/json")
            .set("Authorization", dummy_user_key)
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
          .get("/api/appletPublicStatus")
          .query({ appletId: fakeAppletID2 }) // To avoid fakeAppID success in previous PUT
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(404)
          .end(done);
      });
    });

    /*************************************************************************
     * Test PUT /appletPublicStatus
     ************************************************************************/
    describe("PUT /appletPublicStatus", () => {
      it("should accept request with valid parameters", async () => {
        // Should fail with 401 when actually requesting to Dodai (NODE_ENV !== 'test')
        const appletId = await TestUtil.postSampleAppletWithKey(
          server,
          dummy_user_key
        );
        const body = new api.Body4();
        body.appletId = appletId;
        body.status = true;
        try {
          const resp = await gDefaultApi.putAppletPublicStatus(body);
          assert.deepStrictEqual(resp.response.statusCode, 201);
        } catch (e) {
          const resp = e.response as IncomingMessage;
          assert.fail(resp.statusCode);
          return;
        } finally {
          await TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
        }
      });

      const exampleNGReqBody = JSON.parse(
        require("fs").readFileSync(
          `${__dirname}/testJsonFiles/appletNGPublicStatusPutReqBody.json`
        )
      );
      it("should fail due to unavailable ID", done => {
        request(server)
          .put("/api/appletPublicStatus")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(exampleNGReqBody)
          .expect("Content-Type", /json/)
          .expect(404)
          .end(done);
      });
    });
  }); /* users */
}); /* controllers */
