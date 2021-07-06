import * as fs from "fs";
import request from "supertest";
import { DefaultApi, DefaultApiApiKeys } from "./api";
import * as riiiverdb from "user-session/riiiverdb";

const config = require("../api/controllers/config");
const dummy_user_key = config.dummy_user_key;

export class TestUtil {
  public static readonly mServerBaseUrl = config.server + "/api";

  public static async initialize() {
    if (this.mAuthKey.length > 0) {
      return Promise.resolve();
    }
    this.mAuthKey = dummy_user_key;
    this.mDefaultApi.setApiKey(DefaultApiApiKeys.JWTToken, this.mAuthKey);
    this.mDefaultApi.basePath = this.mServerBaseUrl;
  }

  public static async getDefaultApi(): Promise<DefaultApi> {
    await this.initialize();
    return Promise.resolve(this.mDefaultApi);
  }

  public static log(str: string) {
    const funcName = this.getCallerFunName();
    /* tslint:disable  */

    console.log(`[${funcName}] ${str}`);
    /* tslint:enable */
  }

  public static async postSampleApplet(server: any) {
    await this.initialize();
    const resp = await request(server)
      .post("/api/applets")
      .set("Accept", "application/json")
      .set("Authorization", this.mAuthKey)
      .send(this.mAppletPostBody);

    return Promise.resolve(resp.body.id);
  }

  public static async postApplet(server: any, body: any) {
    await this.initialize();
    const resp = await request(server)
      .post("/api/applets")
      .set("Accept", "application/json")
      .set("Authorization", this.mAuthKey)
      .send(body);

    return Promise.resolve(resp.body.id);
  }

  public static async postBlock(server: any, body: any) {
    await this.initialize();
    const resp = await request(server)
      .post("/api/blocks")
      .set("Accept", "application/json")
      .set("Authorization", this.mAuthKey)
      .send(body);

    return Promise.resolve(resp);
  }

  public static async deleteBlock(server: any, blockId: string) {
    await this.initialize();
    const resp = await request(server)
      .del(`/api/blocks/${blockId}`)
      .set("Accept", "application/json")
      .set("Authorization", this.mAuthKey);

    return Promise.resolve(resp);
  }

  public static async postAppletCopy(server: any, body: any) {
    await this.initialize();
    const resp = await request(server)
      .post("/api/appletCopy")
      .set("Accept", "application/json")
      .send(body);

    return Promise.resolve(resp.body.applet_copy_id);
  }

  public static async deleteAppletCopy(server: any, appletCopyId: string) {
    await this.initialize();
    const resp = await request(server)
      .delete("/api/appletCopy/${appletCopyId}")
      .set("Accept", "application/json");

    return Promise.resolve(resp);
  }

  public static async putSuspendBlock(
    server: any,
    putSuspendBody: any,
    key: string
  ) {
    await this.initialize();
    const resp = await request(server)
      .put("/api/admin/blockSuspend")
      .set("Accept", "application/json")
      .set("Authorization", key)
      .send(putSuspendBody);
    return Promise.resolve(resp);
  }

  public static async postSampleAppletWithKey(
    server: any,
    key: string
  ): Promise<string> {
    const resp = await request(server)
      .post("/api/applets")
      .set("Accept", "application/json")
      .set("Authorization", key)
      .send(this.mAppletPostBody);

    return Promise.resolve(resp.body.id);
  }

  public static async deleteApplet(appletId: string) {
    const defaultApi = await this.getDefaultApi();
    return await defaultApi.deleteApplet(appletId);
  }

  public static async deleteAppletWithKey(appletId: string, key: string) {
    const defaultApi = new DefaultApi();
    defaultApi.setApiKey(DefaultApiApiKeys.JWTToken, key);
    defaultApi.basePath = this.mServerBaseUrl;
    return await defaultApi.deleteApplet(appletId);
  }

  public static getSamplePostApplet() {
    const applet = Object.assign({}, this.mAppletPostBody);
    return applet;
  }

  public static getSamplePostBlock() {
    const block = Object.assign({}, this.mBlockPostBody);
    return block;
  }

  public static getSuspendBlock() {
    const suspend = Object.assign({}, this.mPutBlockSuspendBody);
    return suspend;
  }

  public static isISO8601String(dateStr: string) {
    const regexp = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
    return regexp.test(dateStr);
  }

  private static mAuthKey = "";
  private static readonly mDefaultApi = new DefaultApi();
  private static readonly mAppletPostBody = JSON.parse(
    fs
      .readFileSync(
        `${__dirname}/../api/controllers/testJsonFiles/appletsPostReqBody.json`
      )
      .toString()
  );

  private static readonly mPutBlockSuspendBody = JSON.parse(`{
    "blockId": "",
    "blockSuspendFlg": true,
    "blockSuspendCode": "950",
    "blockSuspendMessage":"Test message"
  }`);

  private static readonly mBlockPostBody = JSON.parse(`{
    "toolId": "string",
    "categoryIds": [
      "schedule"
    ],
    "vendorId": "yahoo",
    "deviceId": "iOS",
    "title": {
      "ja": "ブロックA",
      "en": "Block A"
    },
    "serviceProxy": {
      "service": "unit_test_service",
      "parameters": [
        "location"
      ],
      "authType": [
        "apiKey"
      ]
    },
    "permissionList": {
      "ios": [
        "location"
      ],
      "android": [
        "location"
      ]
    },
    "description": {
      "ja": "ブロックA",
      "en": "Block A"
    },
    "iconUrl": "string",
    "illustUrl": "string",
    "version": "1.0.0",
    "sdkVersion": "1.0.0",
    "executor": "string",
    "blockType": "trigger",
    "preferences": {
      "type": "object",
      "description": "（注: このdescriptionフィールドはexample用であり、実際には不要）現在時刻の天気を取得するBlockの例",
      "required": [
        "weather",
        "rainfall",
        "time"
      ],
      "x-field-order": [
        "time",
        "weather",
        "rainfall"
      ],
      "properties": {
        "weather": {
          "type": "string",
          "enum": [
            "fine",
            "cloudy",
            "rain"
          ],
          "x-title": {
            "ja": "天気",
            "en": "Weather"
          },
          "x-enum-titles": {
            "fine": {
              "ja": "晴れ",
              "en": "Fine"
            },
            "cloudy": {
              "ja": "曇り",
              "en": "Cloudy"
            },
            "rain": {
              "ja": "雨",
              "en": "Rain"
            }
          }
        },
        "rainfall": {
          "type": "number",
          "x-title": {
            "ja": "降水量",
            "en": "Rainfall"
          },
          "x-unit": "mm/h"
        },
        "time": {
          "type": "string",
          "format": "date-time",
          "x-title": {
            "ja": "時刻",
            "en": "Time"
          }
        }
      }
    },
    "migration": {},
    "input": {
      "type": "object",
      "description": "（注: このdescriptionフィールドはexample用であり、実際には不要）現在時刻の天気を取得するBlockの例",
      "required": [
        "weather",
        "rainfall",
        "time"
      ],
      "x-field-order": [
        "time",
        "weather",
        "rainfall"
      ],
      "properties": {
        "weather": {
          "type": "string",
          "enum": [
            "fine",
            "cloudy",
            "rain"
          ],
          "x-title": {
            "ja": "天気",
            "en": "Weather"
          },
          "x-enum-titles": {
            "fine": {
              "ja": "晴れ",
              "en": "Fine"
            },
            "cloudy": {
              "ja": "曇り",
              "en": "Cloudy"
            },
            "rain": {
              "ja": "雨",
              "en": "Rain"
            }
          }
        },
        "rainfall": {
          "type": "number",
          "x-title": {
            "ja": "降水量",
            "en": "Rainfall"
          },
          "x-unit": "mm/h"
        },
        "time": {
          "type": "string",
          "format": "date-time",
          "x-title": {
            "ja": "時刻",
            "en": "Time"
          }
        }
      }
    },
    "output": {
      "type": "object",
      "description": "（注: このdescriptionフィールドはexample用であり、実際には不要）現在時刻の天気を取得するBlockの例",
      "required": [
        "weather",
        "rainfall",
        "time"
      ],
      "x-field-order": [
        "time",
        "weather",
        "rainfall"
      ],
      "properties": {
        "weather": {
          "type": "string",
          "enum": [
            "fine",
            "cloudy",
            "rain"
          ],
          "x-title": {
            "ja": "天気",
            "en": "Weather"
          },
          "x-enum-titles": {
            "fine": {
              "ja": "晴れ",
              "en": "Fine"
            },
            "cloudy": {
              "ja": "曇り",
              "en": "Cloudy"
            },
            "rain": {
              "ja": "雨",
              "en": "Rain"
            }
          }
        },
        "rainfall": {
          "type": "number",
          "x-title": {
            "ja": "降水量",
            "en": "Rainfall"
          },
          "x-unit": "mm/h"
        },
        "time": {
          "type": "string",
          "format": "date-time",
          "x-title": {
            "ja": "時刻",
            "en": "Time"
          }
        }
      }
    },
    "relatedApps": {
      "iOS": "string",
      "android": "string",
      "description": {
        "ja": "ブロックA",
        "en": "Block A"
      }
    },
    "osType": "none",
    "personalInfoList": [
      {
        "serviceCompanyName": "Google Inc.",
        "privacyPolicy": {
          "label": {
            "en": "Link to the privacy policy",
            "ja": "プライバシーポリシーはこちら" 
          },
          "url": {
            "en": "https://example.com/privacy",
            "ja": "https://example.com/ja/privacy" 
          }
        },
        "description": {
          "en": "The purpose and purpose provided to this service provider. Disclaimer if there is no privacy policy URL here..",
          "ja": "このサービスプロバイダに提供している目的・趣旨。プライバシーポリシーのURLがない場合の免責事項などをここに" 
        },
        "typeList": [
          {
            "type": "demographic",
            "description": {
              "en": "The description why this piece uses demographic information here...",
              "ja": "demographicをこのPieceで利用している目的、概要など" 
            }
          },
          {
            "type": "id",
            "description": {
              "en": "The description why this piece uses id information here...",
              "ja": "idをこのPieceで利用している目的・趣旨など" 
            }
          }
        ]
      }
    ]
  }`);

  private static getCallerFunName(): string {
    const stackstr = new Error().stack;
    let funcName = "";
    if (stackstr !== null) {
      const stack = stackstr as string;
      const funcNames = stack.split("\n");
      if (funcNames.length >= 4) {
        funcName = funcNames[3];
        funcName = funcName.replace(/ +\(.*/g, "");
        funcName = funcName.replace(/^ +at +/g, "");
      }
    }
    return funcName;
  }

  public static putUserPreference(body: any) {
    return riiiverdb.forWrite(
      config.region, null, null,
      async (ds: riiiverdb.DatastoreForWrite) => {
        const result = await ds.post(
          riiiverdb.USER_PREFERENCE, {
          owner: config.ownerID,
          appletId: body.appletId,
          preferenceName: body.preferenceName,
          triggerBlockId: body.triggerBlockId,
          triggerDeviceId: body.triggerDeviceId,
          triggerUserId: body.triggerUserId,
          serviceBlockId: body.serviceBlockId,
          serviceDeviceId: body.serviceDeviceId,
          serviceUserId: body.serviceUserId,
          actionBlockId: body.actionBlockId,
          actionDeviceId: body.actionDeviceId,
          actionUserId: body.actionUserId,
          actionTagId: body.actionTagId,
          data: {}
        }, {
          credential: config.root_key
        }) as any;
        return result._id;
      });
  }
  public static delUserPreference(preferenceId: string) {
    return riiiverdb.forWrite(
      config.region, null, null,
      async (ds: riiiverdb.DatastoreForWrite) => {
        await ds.delete_(
          riiiverdb.USER_PREFERENCE,
          preferenceId, {
          credential: config.root_key
        });
      });
  }
}
