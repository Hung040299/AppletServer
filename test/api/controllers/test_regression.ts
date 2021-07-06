import * as fs from "fs";
import * as assert from "power-assert";
import request from "supertest";
import * as api from "../../utility/api";
import { getCookieWithEmail } from "../../utility/cookie_getter";
import { TestUtil } from "../../utility/util";

/* tslint:disable: no-var-requires */
const config = require("./config");
const session = require("ER_Proto_Block_Server/lib/user-session/api.js");
/* tslint:enable: no-var-requires */

const server = config.server;
const email = config.mEmailAddr;
const pass = config.mPassword;
const dummy_user_key = config.dummy_user_key;
const root_key = config.root_key;

let gAnotherUserKey = "";

let anotherUserEmail = config.mEmailAddr2;
let anotherUserPass = config.mPassword2;

// Change to prod setting
if (config.test_mode === "prod") {
  anotherUserEmail = config.mEmailAddr3;
  anotherUserPass = config.mPassword3;
}

const getUserId = async (jwtToken: string) => {
  const req = {
    headers: { authorization: jwtToken }
  };
  const user = await session.checkSession(req);
  return user.dodaiUserId;
};

describe("controllers", () => {
  /* Test entry */
  const gDefaultApi = new api.DefaultApi();
  const gAnotherApi = new api.DefaultApi();
  before(async () => {
    // gDefaultApi = await TestUtil.getDefaultApi();
    gDefaultApi.setApiKey(api.DefaultApiApiKeys.JWTToken, dummy_user_key);
    gDefaultApi.basePath = TestUtil.mServerBaseUrl;

    gAnotherUserKey = await getCookieWithEmail(
      anotherUserEmail,
      anotherUserPass
    );

    if (!gAnotherUserKey) {
      console.log("Fail to login. Scenarios test failed");
    }

    gAnotherApi.setApiKey(api.DefaultApiApiKeys.JWTToken, gAnotherUserKey);
    gAnotherApi.basePath = TestUtil.mServerBaseUrl;
  });

  it("acsmine183463 POST /appletIcon by using another account", async () => {
    const appletId = await TestUtil.postSampleApplet(server);
    try {
      const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
      assert.notDeepStrictEqual(buf, null);
      const img = buf as Buffer;

      await gAnotherApi.postAppletIcon(appletId, img, "icon.png");
      assert.fail("invalid. appletIcon should not be posted.");
    } catch (e) {
      assert.deepStrictEqual(e.response.statusCode, 404);
    } finally {
      await TestUtil.deleteApplet(appletId);
    }
  });

  it("acsmine204984. set PersonalUseFlg", async () => {
    const deviceId = "getAppletTestPersonalUseBody201912";

    // Create an applet with special device Id
    const appletPostBody = TestUtil.getSamplePostApplet();
    appletPostBody.deviceId = deviceId;
    appletPostBody.personalUseFlg = true;
    const resp = await request(server)
      .post("/api/applets")
      .set("Accept", "application/json")
      .set("Authorization", dummy_user_key)
      .send(appletPostBody);
    assert.deepStrictEqual(resp.status, 201);
    const appletId = resp.body.id;
    const personalUseFlg = false;

    let gResp = await request(server)
      .get(`/api/applets/${appletId}`)
      .set("Accept", "application/json")
      .set("Authorization", dummy_user_key);
    assert.deepStrictEqual(gResp.status, 200);
    const originalBody = gResp.body;

    try {
      // Check if appletSuspend is added to the created applet
      const putResp = await request(server)
        .put("/api/admin/appletPersonalUseFlg")
        .set("Accept", "application/json")
        .set("Authorization", root_key)
        .send({
          appletId,
          personalUseFlg
        });
      assert.deepStrictEqual(putResp.status, 201);
      assert.deepStrictEqual(putResp.body, {});

      gResp = await request(server)
        .get(`/api/applets/${appletId}`)
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key);
      assert.deepStrictEqual(gResp.status, 200);
      assert.notDeepStrictEqual(gResp.body, originalBody);
      originalBody.personalUseFlg = false;
      assert.deepStrictEqual(gResp.body, originalBody);
    } finally {
      await TestUtil.deleteApplet(appletId);
    }
  });

  it("acsmine204984. set PersonalUseFlg to data without personalUseFlg", async () => {
    const deviceId = "getAppletTestPersonalUseBody201912";

    // Create an applet with special device Id
    const appletPostBody = TestUtil.getSamplePostApplet();
    appletPostBody.deviceId = deviceId;
    const resp = await request(server)
      .post("/api/applets")
      .set("Accept", "application/json")
      .set("Authorization", dummy_user_key)
      .send(appletPostBody);
    assert.deepStrictEqual(resp.status, 201);
    const appletId = resp.body.id;
    const personalUseFlg = true;

    let gResp = await request(server)
      .get(`/api/applets/${appletId}`)
      .set("Accept", "application/json")
      .set("Authorization", dummy_user_key);
    assert.deepStrictEqual(gResp.status, 200);
    assert.deepStrictEqual(gResp.body.personalUseFlg, undefined);
    const originalBody = gResp.body;

    try {
      // Check if appletSuspend is added to the created applet
      const putResp = await request(server)
        .put("/api/admin/appletPersonalUseFlg")
        .set("Accept", "application/json")
        .set("Authorization", root_key)
        .send({
          appletId,
          personalUseFlg
        });
      assert.deepStrictEqual(putResp.status, 201);
      assert.deepStrictEqual(putResp.body, {});

      gResp = await request(server)
        .get(`/api/applets/${appletId}`)
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key);
      assert.deepStrictEqual(gResp.status, 200);
      assert.notDeepStrictEqual(gResp.body, originalBody);
      originalBody.personalUseFlg = personalUseFlg;
      assert.deepStrictEqual(gResp.body, originalBody);
    } finally {
      await TestUtil.deleteApplet(appletId);
    }
  });

  it("acsmine204984. not invalid appletId", async () => {
    const deviceId = "getAppletTestPersonalUseBody201912";

    // Create an applet with special device Id
    const appletPostBody = TestUtil.getSamplePostApplet();
    appletPostBody.deviceId = deviceId;
    const resp = await request(server)
      .post("/api/applets")
      .set("Accept", "application/json")
      .set("Authorization", dummy_user_key)
      .send(appletPostBody);
    assert.deepStrictEqual(resp.status, 201);
    const appletId = resp.body.id;

    await gDefaultApi.deleteApplet(appletId)

    const personalUseFlg = true;

    const putResp = await request(server)
      .put("/api/admin/appletPersonalUseFlg")
      .set("Accept", "application/json")
      .set("Authorization", root_key)
      .send({
        appletId,
        personalUseFlg
      });
    assert.deepStrictEqual(putResp.status, 404);
  });

  it("acsmine207082. search applet by owner", async () => {
    // Create an applet with special device Id
    let appletId1 = "";
    let appletId2 = "";
    try {
      const appletPostBody = TestUtil.getSamplePostApplet();
      let resp = await request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key)
        .send(appletPostBody);
      appletId1 = resp.body.id;
      const userId1 = await getUserId(dummy_user_key);

      resp = await request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", gAnotherUserKey)
        .send(appletPostBody);
      appletId2 = resp.body.id;
      const userId2 = await getUserId(gAnotherUserKey);

      let result = await request(server)
        .get("/api/admin/applets")
        .query({ version: appletPostBody.version, ownerId: userId2 })
        .set("Accept", "application/json")
        .set("Authorization", root_key);
      const applets = result.body.applets;
      let exist = applets.some((applet: any) => {
        return applet.id === appletId2;
      });
      assert.deepStrictEqual(exist, true);
      let notExist = applets.every((applet: any) => {
        return applet.id !== appletId1;
      });
      assert.deepStrictEqual(notExist, true);

      result = await request(server)
        .get("/api/applets")
        .query({ version: appletPostBody.version, ownerId: userId2 })
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key);

      exist = applets.some((applet: any) => {
        return applet.id === appletId2;
      });
      assert.deepStrictEqual(exist, true);
      notExist = applets.every((applet: any) => {
        return applet.id !== appletId1;
      });
      assert.deepStrictEqual(notExist, true);
    } finally {
      await gDefaultApi.deleteApplet(appletId1);
      await gAnotherApi.deleteApplet(appletId2);
    }
  });
});
