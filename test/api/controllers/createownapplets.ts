import { fail } from "power-assert";
import assert from "power-assert";
import request from "supertest";
import {
  AppletWholeInfo,
  Body6,
  DefaultApi,
  DefaultApiApiKeys
} from "../../utility/api";
import { TestUtil } from "../../utility/util";

const config = require("./config");

const server = config.server;
const dummy_user_key = config.dummy_user_key;

describe("controllers", () => {
  /* Test entry */
  const gDefaultApi = new DefaultApi();
  const gRootkeyApi = new DefaultApi();

  before(async () => {
    gDefaultApi.setApiKey(DefaultApiApiKeys.JWTToken, dummy_user_key);
    gDefaultApi.basePath = TestUtil.mServerBaseUrl;

    gRootkeyApi.setApiKey(DefaultApiApiKeys.JWTToken, config.root_key);
    gRootkeyApi.basePath = TestUtil.mServerBaseUrl;
  });

  describe("users", () => {
    /*************************************************************************
     * Test GET /createownapplets
     ************************************************************************/
    describe("GET /createownapplets", () => {
      it("should accept request if id is valid", done => {
        request(server)
          .get("/api/createownapplets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request if storeStatus is published", done => {
        request(server)
          .get("/api/createownapplets")
          .query({ storeStatus: "published" })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request if storeStatus is waiting_review", done => {
        request(server)
          .get("/api/createownapplets")
          .query({ storeStatus: "waiting_review" })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request if storeStatus is rejected", done => {
        request(server)
          .get("/api/createownapplets")
          .query({ storeStatus: "rejected" })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request if publicStatus is rejected", done => {
        request(server)
          .get("/api/createownapplets")
          .query({ publicStatus: true })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("acsmine #177237. logically deleted applets does not show", async () => {
        const appletId = await TestUtil.postSampleApplet(server);
        try {
          const body = new Body6();
          body.appletId = appletId;
          body.status = Body6.StatusEnum.Deleted;
          body.message = "delete test";
          await gRootkeyApi.putAppletStoreStatus(body);
          const resp = await gDefaultApi.getMyApplets(undefined, undefined);
          assert.deepStrictEqual(resp.response.statusCode, 200);
          assert.notDeepStrictEqual(resp.body.applets, undefined);
          const applets = resp.body.applets as AppletWholeInfo[];
          const targetApplet = applets.find(applet => {
            return applet.id === appletId;
          });
          assert.deepStrictEqual(targetApplet, undefined);
        } catch (e) {
          fail(e);
        } finally {
          TestUtil.deleteApplet(appletId);
        }
      });
    });
  });
});
