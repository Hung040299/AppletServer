import { IncomingMessage } from "http";
import assert from "power-assert";
import request from "supertest";
import * as api from "../../utility/api";
import { getCookie } from "../../utility/cookie_getter";
import { TestUtil } from "../../utility/util";
import { fail } from "assert";

/* tslint:disable: no-var-requires */
const config = require("./config");
/* tslint:enable: no-var-requires */

const server = config.server;
const fakeAppletID = config.fakeAppletID;
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
     * Test GET /appletGoodNum
     ************************************************************************/
    describe("GET /appletGoodNum", () => {
      it("should accept request", async done => {
        const appletId = await TestUtil.postSampleAppletWithKey(
          server,
          dummy_user_key
        );
        try {
          request(server)
            .get("/api/appletGoodNum")
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

      it("should not accept a non existed appletID request", done => {
        request(server)
          .get("/api/appletGoodNum")
          .query({ appletId: fakeAppletID })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(404)
          .end(done);
      });
    });

    /*************************************************************************
     * Test PUT /appletGoodNum
     ************************************************************************/
    describe("PUT /appletGoodNum", () => {
      it("should accept request with valid parameters", async () => {
        const appletId = await TestUtil.postSampleAppletWithKey(
          server,
          dummy_user_key
        );
        const body = new api.Body2();
        body.appletId = appletId;
        body.changeNum = 45;

        try {
          const resp = await gDefaultApi.putAppletGoodNum(body);
          fail("putAppletGoodNum should not be succeeded");
        } catch (e) {
          assert.deepStrictEqual(e.response.statusCode, 404);
        } finally {
          await TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
        }
      });

      it("should return 400 if applet ID is not found", async () => {
        const appletId = "0000895b24000025007e9a10"; // not exist
        const body = new api.Body2();
        body.appletId = appletId;
        body.changeNum = 45;

        try {
          await gDefaultApi.putAppletGoodNum(body);
        } catch (e) {
          const resp = e.response as IncomingMessage;
          assert.deepStrictEqual(resp.statusCode, 404);
          return;
        }
        assert.fail("invalid success");
      });
    });
  });
});
