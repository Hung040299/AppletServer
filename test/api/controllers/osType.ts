import { OSType } from "ER_Proto_Block_Server/test_api/client/api";
import { IncomingMessage } from "http";
import assert from "power-assert";
import request from "supertest";
import * as api from "../../utility/api";
import { TestUtil } from "../../utility/util";

/* tslint:disable: no-var-requires */
const config = require("./config");
/* tslint:enable: no-var-requires */

const dummy_user_key = config.dummy_user_key;
const server = config.server;
const version = config.version;
const root_key = config.root_key;
let gAppletId = "";
let gAppletIdiOS = "";
let gAppletIdAndroid = "";
const gDefaultApi = new api.DefaultApi();

describe("controllers", () => {
  after(async () => {
    // Delete the applets above
    await TestUtil.deleteApplet(gAppletIdiOS);
    await TestUtil.deleteApplet(gAppletIdAndroid);
    await TestUtil.deleteApplet(gAppletId);
  });

  describe("users", () => {
    /*************************************************************************
     * Test POST /applets with osType
     ************************************************************************/
    let body: any = {};
    before(async () => {
      gDefaultApi.setApiKey(api.DefaultApiApiKeys.JWTToken, dummy_user_key);
      gDefaultApi.basePath = TestUtil.mServerBaseUrl;
      body = JSON.parse(
        require("fs").readFileSync(
          `${__dirname}/testJsonFiles/appletsPostReqBody.json`
        )
      );
    });

    // Post three new applets. It is also a unit test
    it("Post applets with osType=none should success", done => {
      body.osType = "none";
      request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key)
        .send(body)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(async res => {
          gAppletId = res.body.id;

          // Make sure osType is set
          await request(server)
            .get(`/api/applets/${res.body.id}`)
            .set("Accept", "application/json")
            .set("Authorization", dummy_user_key)
            .expect("Content-Type", /json/)
            .expect(200)
            .expect(async ret => {
              assert.strictEqual(ret.body.osType, "none");
            });
        })
        .end(done);
    });

    it("Post applets with osType=iOS should success", done => {
      body.osType = "iOS";
      request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key)
        .send(body)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(async res => {
          gAppletIdiOS = res.body.id;

          // Make sure osType is set
          await request(server)
            .get(`/api/applets/${res.body.id}`)
            .set("Accept", "application/json")
            .set("Authorization", dummy_user_key)
            .expect("Content-Type", /json/)
            .expect(200)
            .expect(async ret => {
              assert.strictEqual(ret.body.osType, "iOS");
            });
        })
        .end(done);
    });

    it("Post applets with osType=Android should success", done => {
      body.osType = "Android";
      request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key)
        .send(body)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(async res => {
          gAppletIdAndroid = res.body.id;

          await request(server)
            .get(`/api/applets/${res.body.id}`)
            .set("Accept", "application/json")
            .set("Authorization", dummy_user_key)
            .expect("Content-Type", /json/)
            .expect(200)
            .expect(async ret => {
              assert.strictEqual(ret.body.osType, "Android");
            });
        })
        .end(done);
    });

    it("Post applets with invalid osType should fail", done => {
      body.osType = "test";
      request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key)
        .send(body)
        .expect("Content-Type", /json/)
        .expect(400)
        .end(done);
    });

    /*************************************************************************
     * Test GET /applets
     ************************************************************************/
    describe("GET /applets with osType", () => {
      it("should accept request with osType=none", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, osType: "none" })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request with osType=iOS", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, osType: "iOS" })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should accept request with osType=Android", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, osType: "Android" })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should reject request with invalid osType", done => {
        request(server)
          .get("/api/applets")
          .query({ version: version, osType: "test" })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(400)
          .end(done);
      });
    });

    /**************************************************
     * PUT /block/{id} with osType
     **************************************************/
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

      it("should accept request if osType is valid", done => {
        request(server)
          .get(`/api/applets/${testOSTypeAppletID}`)
          .query({ osType: OSType.OSTypeEnum.Android })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(done);
      });

      it("should not accept a non-matched osType", done => {
        request(server)
          .get(`/api/applets/${testOSTypeAppletID}`)
          .query({ osType: OSType.OSTypeEnum.iOS })
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .expect("Content-Type", /json/)
          .expect(404)
          .end(done);
      });
    });

    /*************************************************************************
     * Test PUT /applets
     ************************************************************************/
    describe("PUT /applets", () => {
      const putBody = JSON.parse(
        require("fs").readFileSync(
          `${__dirname}/testJsonFiles/appletsPutReqBody.json`
        )
      );
      it("should accept osType=iOS", done => {
        putBody.appletId = gAppletId;
        putBody.osType = "iOS";
        request(server)
          .put("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(putBody)
          .expect(201)
          .expect("Content-Type", /json/)
          .expect(async res => {
            await request(server)
              .get(`/api/applets/${res.body.id}`)
              .set("Accept", "application/json")
              .set("Authorization", dummy_user_key)
              .expect("Content-Type", /json/)
              .expect(200)
              .expect(async ret => {
                assert.strictEqual(ret.body.osType, "iOS");
              });
          })
          .end(done);
      });

      it("should accept osType=Android", done => {
        putBody.appletId = gAppletId;
        putBody.osType = "Android";
        request(server)
          .put("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(putBody)
          .expect(201)
          .expect("Content-Type", /json/)
          .expect(async res => {
            await request(server)
              .get(`/api/applets/${res.body.id}`)
              .set("Accept", "application/json")
              .set("Authorization", dummy_user_key)
              .expect("Content-Type", /json/)
              .expect(200)
              .expect(async ret => {
                assert.strictEqual(ret.body.osType, "Android");
              });
          })
          .end(done);
      });

      it("should accept osType=Android Specify Android", async () => {
        putBody.appletId = gAppletId;
        putBody.osType = "Android";
        let resp: request.Response | undefined;
        await request(server)
          .put("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(putBody)
          .expect(201)
          .expect("Content-Type", /json/)
          .expect(res => {
            resp = res;
          });
        if (resp === undefined) {
          assert.fail("cannot put");
          return;
        }
        const ares = await gDefaultApi.getApplet(
          resp.body.id,
          undefined,
          "Android"
        );
        assert.deepStrictEqual(ares.response.statusCode, 200);
        assert.deepStrictEqual(ares.body.osType, "Android");
      });

      it("should accept osType=None, specify Android", async () => {
        putBody.appletId = gAppletId;
        putBody.osType = "none";
        let resp: request.Response | undefined;
        await request(server)
          .put("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(putBody)
          .expect(201)
          .expect("Content-Type", /json/)
          .expect(async res => {
            resp = res;
          });
        if (resp === undefined) {
          assert.fail("cannot put");
          return;
        }
        const ares = await gDefaultApi.getApplet(
          resp.body.id,
          undefined,
          "Android"
        );
        assert.deepStrictEqual(ares.response.statusCode, 200);
        assert.deepStrictEqual(ares.body.osType, "none");
      });

      it("should accept osType=Android, specify iOS", done => {
        putBody.appletId = gAppletId;
        putBody.osType = "none";
        request(server)
          .put("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(putBody)
          .expect(201)
          .expect("Content-Type", /json/)
          .expect(async res => {
            try {
              await gDefaultApi.getApplet(res.body.id, undefined, "iOS");
              assert.fail("not run this line");
            } catch (e) {
              assert.deepStrictEqual(e.response.statusCode, 200);
              return Promise.resolve();
            }
          })
          .end(done);
      });

      it("should accept osType=none", done => {
        putBody.appletId = gAppletId;
        putBody.osType = "none";
        request(server)
          .put("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(putBody)
          .expect(201)
          .expect("Content-Type", /json/)
          .expect(async res => {
            await request(server)
              .get(`/api/applets/${res.body.id}`)
              .set("Accept", "application/json")
              .set("Authorization", dummy_user_key)
              .expect("Content-Type", /json/)
              .expect(200)
              .expect(async ret => {
                assert.strictEqual(ret.body.osType, "none");
              });
          })
          .end(done);
      });

      it("should reject request with invalid osType", done => {
        putBody.appletId = gAppletId;
        putBody.osType = "test";
        request(server)
          .put("/api/applets")
          .set("Accept", "application/json")
          .set("Authorization", dummy_user_key)
          .send(putBody)
          .expect(400)
          .expect("Content-Type", /json/)
          .end(done);
      });
    });
  });
});
