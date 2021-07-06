import * as fs from "fs";
import { IncomingMessage } from "http";
import Sizeof = require("image-size");
import * as assert from "power-assert";
import request from "supertest";
import * as API from "./../../utility/api";
import { TestUtil } from "./../../utility/util";
import {getAppletIcon, getApplet} from "./../../utility/api";
import * as riiiverdb from "user-session/riiiverdb";

/* tslint:disable: no-var-requires */
const server = require("./config").server;
/* tslint:enable: no-var-requires */
import { TestConfig } from "../../config/test_config";


const session = require("ER_Proto_Block_Server/lib/user-session/api");
/*************************************************************************
 * Test POST /appletIcon
 ************************************************************************/
 describe("POST /appletIcon", () => {
  let gDefaultApi = new API.DefaultApi();
  before(async () => {
    gDefaultApi = await TestUtil.getDefaultApi();
    const app = await request(server);
  });

  // TEST ID: 37A
  it("should accept request with valid applet ID (png)", async () => {
    const appletId = await TestUtil.postSampleApplet(server);
    try {
      const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
      assert.notDeepStrictEqual(buf, null);
      const img = buf as Buffer;

      const resp = await gDefaultApi.postAppletIcon(appletId, img, "icon.png");
      assert.deepStrictEqual(resp.response.statusCode, 201);
    } catch (e) {
      throw e;
    } finally {
      await TestUtil.deleteApplet(appletId);
    }
  });

  // TEST ID: 37AA
  it("should accept request with valid applet ID (jpg)", async () => {
    const appletId = await TestUtil.postSampleApplet(server);
    try {
      const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.jpg`);
      assert.notDeepStrictEqual(buf, null);
      const img = buf as Buffer;

      const resp = await gDefaultApi.postAppletIcon(appletId, img, "icon.jpg");
      assert.deepStrictEqual(resp.response.statusCode, 201);
    } catch (e) {
      throw e;
    } finally {
      await TestUtil.deleteApplet(appletId);
    }
  });

  // TEST ID: 39
  it("should reject request with invalid applet ID", async () => {
    const invalidAppletId = "5c99837c26000027000fe817";
    let resp;
    try {
      const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
      assert.notDeepStrictEqual(buf, null);
      const img = buf as Buffer;
      resp = await gDefaultApi.postAppletIcon(invalidAppletId, img, "icon.png");
    } catch (e) {
      if (!e.response) {
        return assert.fail();
      }
      const eresp = e.response as IncomingMessage;
      assert.deepStrictEqual(eresp.statusCode, 404);
      return;
    }
    assert.fail(resp.response.statusCode);
  });

  // TEST ID: 40
  it("should reject request if applet ID have been bound with other picture", async () => {
    const appletId = await TestUtil.postSampleApplet(server);
    const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
    assert.notDeepStrictEqual(buf, null);
    const img = buf as Buffer;
    let resp = await gDefaultApi.postAppletIcon(appletId, img, "icon.png");
    assert.deepStrictEqual(resp.response.statusCode, 201);
    try {
      resp = await gDefaultApi.postAppletIcon(appletId, img, "icon.png");
    } catch (e) {
      if (!e.response) {
        return assert.fail();
      }
      const eresp = e.response as IncomingMessage;
      assert.deepStrictEqual(eresp.statusCode, 409);
      return;
    }
    assert.fail(resp.response.statusCode);
  });

  it("test image icon", () => {
    const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
    try {
      const dimention = Sizeof(buf);
      console.log(
        `type: ${dimention.type}, width: ${dimention.width}, height ${dimention.height}`
      );
      assert.deepStrictEqual(dimention.type, "png");
      assert.deepStrictEqual(dimention.width, dimention.height);
    } catch (e) {
      // when Buffer is not image, exception occurs.
      assert.fail(e);
    }
  });
}); 
 
describe("PUT /appletIcon", () => {

  let gDefaultApi = new API.DefaultApi();
  let appletID = "";

  before(async () => {
    gDefaultApi = await TestUtil.getDefaultApi();
    appletID = await TestUtil.postSampleApplet(server);
  });

  after(async () => {
    try{
      let testKey = TestConfig.getTestApiKey();
      await gDefaultApi.setApiKey(API.DefaultApiApiKeys.JWTToken, testKey)
      await TestUtil.deleteApplet(appletID);  
    }
    catch(e){
      console.log(e.message)
    }
  })

  const getUserInfo = async (api: API.DefaultApi) => {
    const auth = (api as any).authentications[
      API.DefaultApiApiKeys[API.DefaultApiApiKeys.JWTToken]
    ].apiKey;
    const req = {
      headers: {
        authorization: auth
      }
    };
    const result = await session.checkSession(req);
    return result;
  };

  it("should update with valid applet ID (png) and applet don't have appletIcon", async () => {
    const userInfo = await getUserInfo(gDefaultApi);
    let rootKey = TestConfig.getTestRootKey();
    let versionDB: any;
    await riiiverdb.forRead(
      userInfo, null, null,
      async (ds: riiiverdb.DatastoreForRead) => {
       let result = await getAppletIcon(
          ds,
          appletID,
          rootKey
        );
        assert.deepStrictEqual(result.status, 200);
        assert.deepStrictEqual(result.body.publicUrl, undefined);
      })
    await riiiverdb.forRead(
      userInfo, null, null,
      async (ds: riiiverdb.DatastoreForRead) => {
        let result = await getApplet(
          ds,
          appletID,
          userInfo.dodaiUserCredential
        );
        assert.deepStrictEqual(result.status, 200);
        versionDB = result.body.version;
      })
    try {
      const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
      assert.notDeepStrictEqual(buf, null);
      const img = buf as Buffer;
      await gDefaultApi.setApiKey(API.DefaultApiApiKeys.JWTToken, rootKey);
      const resp = await gDefaultApi.putAppletIcon(appletID, img, "icon.png");
      assert.deepStrictEqual(resp.response.statusCode, 200);

      await riiiverdb.forRead(
        userInfo, null, null,
        async (ds: riiiverdb.DatastoreForRead) => {
        let result = await getAppletIcon(
            ds,
            appletID,
            rootKey
          );
          assert.deepStrictEqual(result.status, 200);
          assert.notDeepStrictEqual(result.body.publicUrl, undefined);
      })
      await riiiverdb.forRead(
        userInfo, null, null,
        async (ds: riiiverdb.DatastoreForRead) => {
          let result = await getApplet(
            ds,
            appletID,
            userInfo.dodaiUserCredential
          );
          assert.deepStrictEqual(result.status, 200);
          assert.deepStrictEqual(versionDB + 1, result.body.version);
          assert.notDeepStrictEqual(result.body.data.iconUrl, undefined);
        })
    } catch (e) {
      console.error(e.message)
    }
  }) 

  it(" should update with valid applet ID (jpg)", async () => {
    let testKey = TestConfig.getTestApiKey();
    let rootKey = TestConfig.getTestRootKey();
    await gDefaultApi.setApiKey(API.DefaultApiApiKeys.JWTToken, testKey); 
    const userInfo = await getUserInfo(gDefaultApi);
    let iconUrlDB: any;
    let versionDB: any;
    await riiiverdb.forRead(
      userInfo, null, null,
      async (ds: riiiverdb.DatastoreForRead) => {
       let result = await getAppletIcon(
          ds,
          appletID,
          rootKey
        );
        assert.deepStrictEqual(result.status, 200);
        iconUrlDB = result.body.publicUrl;
      })
    await riiiverdb.forRead(
      userInfo, null, null,
      async (ds: riiiverdb.DatastoreForRead) => {
        let result = await getApplet(
          ds,
          appletID,
          userInfo.dodaiUserCredential
        );
        assert.deepStrictEqual(result.status, 200);
        versionDB = result.body.version;
      })
    try {
      const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.jpg`);
      assert.notDeepStrictEqual(buf, null);
      const img = buf as Buffer;

      await gDefaultApi.setApiKey(API.DefaultApiApiKeys.JWTToken, rootKey);
      const resp = await gDefaultApi.putAppletIcon(appletID, img, "icon.jpg");
      assert.deepStrictEqual(resp.response.statusCode, 200);
      await riiiverdb.forRead(
        userInfo, null, null,
        async (ds: riiiverdb.DatastoreForRead) => {
        let result = await getAppletIcon(
            ds,
            appletID,
            rootKey
          );
          assert.deepStrictEqual(result.status, 200);
          assert.notDeepStrictEqual(result.body.publicUrl, iconUrlDB);
      })
      await riiiverdb.forRead(
        userInfo, null, null,
        async (ds: riiiverdb.DatastoreForRead) => {
          let result = await getApplet(
            ds,
            appletID,
            userInfo.dodaiUserCredential
          );
          assert.deepStrictEqual(result.status, 200);
          assert.deepStrictEqual(versionDB + 1, result.body.version);
        })
    } catch (e) {
      console.error(e.message)
    }
  })

  it(" should reject with invalid icon type", async () => {
    try {
      const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
      assert.notDeepStrictEqual(buf, null);
      const img = buf as Buffer;

      const rootKey = TestConfig.getTestRootKey()
      await gDefaultApi.setApiKey(API.DefaultApiApiKeys.JWTToken, rootKey)
      await gDefaultApi.putAppletIcon(appletID, img, "icon.png");
     } catch (e) {
       assert.deepStrictEqual(e.response.statusCode, 400);
    } 
  })

  it(" should reject with invalid appletID", async () => {
    try {
      const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
      assert.notDeepStrictEqual(buf, null);
      const img = buf as Buffer;

      const rootKey = TestConfig.getTestRootKey()
      await gDefaultApi.setApiKey(API.DefaultApiApiKeys.JWTToken, rootKey)
      await gDefaultApi.putAppletIcon("appletID", img, "icon.png");
     } catch (e) {
       assert.deepStrictEqual(e.response.statusCode, 400);
    } 
  })

  it("test image icon", () => {
    const buf = fs.readFileSync(`${__dirname}/testIconFiles/icon.png`);
    try {
      const dimention = Sizeof(buf);
      console.log(
        `type: ${dimention.type}, width: ${dimention.width}, height ${dimention.height}`
      );
      assert.deepStrictEqual(dimention.type, "png");
      assert.deepStrictEqual(dimention.width, dimention.height);
    } catch (e) {
      // when Buffer is not image, exception occurs.
      assert.fail(e);
    }
  });    
})
