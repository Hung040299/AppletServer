import * as fs from "fs";
import { IncomingMessage } from "http";
import assert from "power-assert";
import request from "supertest";
import * as api from "../../utility/api";
import { getCookie } from "../../utility/cookie_getter";
import { getCookieWithEmail } from "../../utility/cookie_getter";
import { TestUtil } from "../../utility/util";

/* tslint:disable: no-var-requires */
const config = require("./config");
/* tslint:enable: no-var-requires */

const server = config.server;
const email = config.mEmailAddr;
const pass = config.mPassword;
const dummy_user_key = config.dummy_user_key;
// FIXME: Need second account
const root_key = config.root_key;
let gAnotherUserKey = "";

let anotherUserEmail = config.mEmailAddr2;
let anotherUserPass = config.mPassword2;

// Change to prod setting
if (config.test_mode === "prod") {
  anotherUserEmail = config.mEmailAddr3;
  anotherUserPass = config.mPassword3;
}

const verifySuccessStatus = (ustatus: number | undefined) => {
  assert.notDeepEqual(ustatus, undefined);
  const status = ustatus as number;
  assert.strictEqual(status >= 200, true);
  assert.strictEqual(status < 300, true);
};

const verifyFailureStatus = (ustatus: number | undefined) => {
  if (ustatus === undefined) {
    return;
  }
  const status = ustatus as number;
  assert.strictEqual(status < 200 || status >= 300, true);
};

describe("controllers", () => {
  /* Test entry */
  const gDefaultApi = new api.DefaultApi();
  const gAnotherApi = new api.DefaultApi();
  const gRootkeyApi = new api.DefaultApi();
  before(async () => {
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

    gRootkeyApi.setApiKey(api.DefaultApiApiKeys.JWTToken, root_key);
    gRootkeyApi.basePath = TestUtil.mServerBaseUrl;
  });

  it("Scenario1 publish applet", async () => {
    let appletId = "";
    try {
      if (!gAnotherUserKey) {
        console.log("Fail to login. Scenarios test failed");
        throw new Error("not login");
      }
      const exampleReqBody = JSON.parse(
        require("fs").readFileSync(
          `${__dirname}/testJsonFiles/appletsPostReqBody.json`
        )
      );

      await request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key)
        .send(exampleReqBody)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(res => {
          appletId = res.body.id;
        });
      console.log(`appletId = ${appletId}`);
      const body = new api.Body6();
      body.appletId = appletId;
      body.status = api.Body6.StatusEnum.Published;
      body.message = "test";
      const resp = await gRootkeyApi.putAppletStoreStatus(body);
      verifySuccessStatus(resp.response.statusCode);

      const gresp = await gDefaultApi.listApplets(
        "1.0.0",
        [appletId],
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "published",
        undefined,
        undefined
      );
      verifySuccessStatus(gresp.response.statusCode);
      assert.notStrictEqual(gresp.body.applets, undefined);
      const applets = gresp.body.applets as api.AppletWholeInfo[];
      const utargetApplet = applets.find(applet => {
        return applet.id === appletId;
      });
      assert.notDeepStrictEqual(utargetApplet, undefined);
      const targetApplet = utargetApplet as api.AppletWholeInfo;
      assert.deepStrictEqual(targetApplet.id, appletId);
      assert.deepStrictEqual(
        targetApplet.appletInfo.storeStatus,
        api.AppletStoreStatus.StatusEnum.Published
      );
    } catch (e) {
      throw e;
    } finally {
      if (appletId.length > 0) {
        await TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
      }
    }
  });

  it("Scenario2 reject applet", async () => {
    let appletId = "";
    try {
      if (!gAnotherUserKey) {
        console.log("Fail to login. Scenarios test failed");
        throw new Error("not login");
      }
      const exampleReqBody = JSON.parse(
        require("fs").readFileSync(
          `${__dirname}/testJsonFiles/appletsPostReqBody.json`
        )
      );

      await request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key)
        .send(exampleReqBody)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(res => {
          appletId = res.body.id;
        });
      const body = new api.Body6();
      body.appletId = appletId;
      body.status = api.Body6.StatusEnum.Rejected;
      body.message = "test";
      const resp = await gRootkeyApi.putAppletStoreStatus(body);
      verifySuccessStatus(resp.response.statusCode);
      const gresp = await gDefaultApi.listApplets(
        "1.0.0",
        [appletId],
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "rejected",
        undefined,
        undefined
      );
      verifySuccessStatus(gresp.response.statusCode);
      assert.notStrictEqual(gresp.body.applets, undefined);
      const applets = gresp.body.applets as api.AppletWholeInfo[];
      const utargetApplet = applets.find(applet => {
        return applet.id === appletId;
      });
      assert.notDeepStrictEqual(utargetApplet, undefined);
    } catch (e) {
      throw e;
    } finally {
      if (appletId.length > 0) {
        await TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
      }
    }
  });

  it("Scenario3 applet public", async () => {
    let appletId = "";
    try {
      if (!gAnotherUserKey) {
        console.log("Fail to login. Scenarios test failed");
        throw new Error("not login");
      }
      const exampleReqBody = JSON.parse(
        require("fs").readFileSync(
          `${__dirname}/testJsonFiles/appletsPostReqBody.json`
        )
      );

      await request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key)
        .send(exampleReqBody)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(res => {
          appletId = res.body.id;
        });
      const body = new api.Body4();
      body.appletId = appletId;
      body.status = true;
      const resp = await gDefaultApi.putAppletPublicStatus(body);
      verifySuccessStatus(resp.response.statusCode);
      const gresp = await gDefaultApi.getAppletPublicStatus(appletId);
      verifySuccessStatus(resp.response.statusCode);
      assert.deepStrictEqual(gresp.body.status, true);
    } catch (e) {
      throw e;
    } finally {
      if (appletId.length > 0) {
        await TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
      }
    }
  });

  it("Scenario4 applet not public", async () => {
    let appletId = "";
    try {
      if (!gAnotherUserKey) {
        console.log("Fail to login. Scenarios test failed");
        throw new Error("not login");
      }
      const exampleReqBody = JSON.parse(
        require("fs").readFileSync(
          `${__dirname}/testJsonFiles/appletsPostReqBody.json`
        )
      );

      await request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key)
        .send(exampleReqBody)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(res => {
          appletId = res.body.id;
        });
      const body = new api.Body4();
      body.appletId = appletId;
      body.status = false;
      const resp = await gDefaultApi.putAppletPublicStatus(body);
      verifySuccessStatus(resp.response.statusCode);
      const gresp = await gDefaultApi.getAppletPublicStatus(appletId);
      verifySuccessStatus(resp.response.statusCode);
      assert.deepStrictEqual(gresp.body.status, false);
    } catch (e) {
      throw e;
    } finally {
      if (appletId.length > 0) {
        await TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
      }
    }
  });

  it("Scenario5 applet own", async () => {
    let appletId = "";
    let appletId2 = "";
    try {
      if (!gAnotherUserKey) {
        console.log("Fail to login. Scenarios test failed");
        throw new Error("not login");
      }
      const exampleReqBody = JSON.parse(
        require("fs").readFileSync(
          `${__dirname}/testJsonFiles/appletsPostReqBody.json`
        )
      );

      await request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key)
        .send(exampleReqBody)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(res => {
          appletId = res.body.id;
        });

      await request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", gAnotherUserKey)
        .send(exampleReqBody)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(res => {
          appletId2 = res.body.id;
        });

      const mresp = await gAnotherApi.getMyApplets();
      verifySuccessStatus(mresp.response.statusCode);
      const applets = mresp.body.applets as api.AppletWholeInfo[];
      let applet = applets.find(element => {
        return element.id === appletId2;
      });
      assert.notDeepStrictEqual(applet, undefined);
      applet = applets.find(element => {
        return element.id === appletId;
      });
      assert.deepStrictEqual(applet, undefined);
    } catch (e) {
      throw e;
    } finally {
      if (appletId.length > 0) {
        await TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
      }
      if (appletId2.length > 0) {
        await TestUtil.deleteAppletWithKey(appletId2, gAnotherUserKey);
      }
    }
  });

  it("Scenario6 get applet by correct user", async () => {
    let appletId = "";
    let appletId2 = "";
    try {
      if (!gAnotherUserKey) {
        console.log("Fail to login. Scenarios test failed");
        throw new Error("not login");
      }
      const exampleReqBody = JSON.parse(
        require("fs").readFileSync(
          `${__dirname}/testJsonFiles/appletsPostReqBody.json`
        )
      );

      await request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key)
        .send(exampleReqBody)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(res => {
          appletId = res.body.id;
        });

      await request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", gAnotherUserKey)
        .send(exampleReqBody)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(res => {
          appletId2 = res.body.id;
        });

      const mresp = await gDefaultApi.getApplet(appletId);
      verifySuccessStatus(mresp.response.statusCode);
    } catch (e) {
      throw e;
    } finally {
      if (appletId.length > 0) {
        await TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
      }
      if (appletId2.length > 0) {
        await TestUtil.deleteAppletWithKey(appletId2, gAnotherUserKey);
      }
    }
  });

  it("Scenario7 get applet by correct another user", async () => {
    let appletId = "";
    let appletId2 = "";
    try {
      if (!gAnotherUserKey) {
        console.log("Fail to login. Scenarios test failed");
        throw new Error("not login");
      }
      const exampleReqBody = JSON.parse(
        require("fs").readFileSync(
          `${__dirname}/testJsonFiles/appletsPostReqBody.json`
        )
      );

      await request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key)
        .send(exampleReqBody)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(res => {
          appletId = res.body.id;
        });

      await request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", gAnotherUserKey)
        .send(exampleReqBody)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(res => {
          appletId2 = res.body.id;
        });

      const mresp = await gAnotherApi.getApplet(appletId2);
      verifySuccessStatus(mresp.response.statusCode);
    } catch (e) {
      throw e;
    } finally {
      if (appletId.length > 0) {
        await TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
      }
      if (appletId2.length > 0) {
        await TestUtil.deleteAppletWithKey(appletId2, gAnotherUserKey);
      }
    }
  });

  it("Scenario8 put another user's applet", async () => {
    let appletId = "";
    let appletId2 = "";
    try {
      if (!gAnotherUserKey) {
        console.log("Fail to login. Scenarios test failed");
        throw new Error("not login");
      }

      const exampleReqBody = JSON.parse(
        require("fs").readFileSync(
          `${__dirname}/testJsonFiles/appletsPostReqBody.json`
        )
      );

      await request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key)
        .send(exampleReqBody)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(res => {
          appletId = res.body.id;
        });

      await request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", gAnotherUserKey)
        .send(exampleReqBody)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(res => {
          appletId2 = res.body.id;
        });

      const buf = fs.readFileSync(
        `${__dirname}/testJsonFiles/appletsPutReqBody.json`
      );
      const putReqBody = JSON.parse(buf.toString());
      putReqBody.appletId = appletId;

      request(server)
        .put("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", gAnotherUserKey)
        .send(putReqBody)
        .expect(404);
    } catch (e) {
      throw e;
    } finally {
      if (appletId.length > 0) {
        await TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
      }
      if (appletId2.length > 0) {
        await TestUtil.deleteAppletWithKey(appletId2, gAnotherUserKey);
      }
    }
  });

  it("Scenario9 delete another user's applet", async () => {
    let appletId = "";
    let appletId2 = "";
    try {
      if (!gAnotherUserKey) {
        console.log("Fail to login. Scenarios test failed");
        throw new Error("not login");
      }
      const exampleReqBody = JSON.parse(
        require("fs").readFileSync(
          `${__dirname}/testJsonFiles/appletsPostReqBody.json`
        )
      );

      await request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", dummy_user_key)
        .send(exampleReqBody)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(res => {
          appletId = res.body.id;
        });

      await request(server)
        .post("/api/applets")
        .set("Accept", "application/json")
        .set("Authorization", gAnotherUserKey)
        .send(exampleReqBody)
        .expect("Content-Type", /json/)
        .expect(201)
        .expect(res => {
          appletId2 = res.body.id;
        });
      try {
        await gAnotherApi.deleteApplet(appletId);
      } catch (e) {
        const dresp = e.response as IncomingMessage;
        assert.deepStrictEqual(dresp.statusCode, 404);
        return;
      }
      assert.fail("invalid correct response");
    } catch (e) {
      throw e;
    } finally {
      if (appletId.length > 0) {
        await TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
      }
      if (appletId2.length > 0) {
        await TestUtil.deleteAppletWithKey(appletId2, gAnotherUserKey);
      }
    }
  });
}); /* controllers */
