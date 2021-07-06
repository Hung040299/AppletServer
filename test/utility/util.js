"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const supertest_1 = __importDefault(require("supertest"));
const api_1 = require("./api");
const riiiverdb = __importStar(require("user-session/riiiverdb"));
const config = require("../api/controllers/config");
const dummy_user_key = config.dummy_user_key;
class TestUtil {
    static async initialize() {
        if (this.mAuthKey.length > 0) {
            return Promise.resolve();
        }
        this.mAuthKey = dummy_user_key;
        this.mDefaultApi.setApiKey(api_1.DefaultApiApiKeys.JWTToken, this.mAuthKey);
        this.mDefaultApi.basePath = this.mServerBaseUrl;
    }
    static async getDefaultApi() {
        await this.initialize();
        return Promise.resolve(this.mDefaultApi);
    }
    static log(str) {
        const funcName = this.getCallerFunName();
        /* tslint:disable  */
        console.log(`[${funcName}] ${str}`);
        /* tslint:enable */
    }
    static async postSampleApplet(server) {
        await this.initialize();
        const resp = await supertest_1.default(server)
            .post("/api/applets")
            .set("Accept", "application/json")
            .set("Authorization", this.mAuthKey)
            .send(this.mAppletPostBody);
        return Promise.resolve(resp.body.id);
    }
    static async postApplet(server, body) {
        await this.initialize();
        const resp = await supertest_1.default(server)
            .post("/api/applets")
            .set("Accept", "application/json")
            .set("Authorization", this.mAuthKey)
            .send(body);
        return Promise.resolve(resp.body.id);
    }
    static async postBlock(server, body) {
        await this.initialize();
        const resp = await supertest_1.default(server)
            .post("/api/blocks")
            .set("Accept", "application/json")
            .set("Authorization", this.mAuthKey)
            .send(body);
        return Promise.resolve(resp);
    }
    static async deleteBlock(server, blockId) {
        await this.initialize();
        const resp = await supertest_1.default(server)
            .del(`/api/blocks/${blockId}`)
            .set("Accept", "application/json")
            .set("Authorization", this.mAuthKey);
        return Promise.resolve(resp);
    }
    static async postAppletCopy(server, body) {
        await this.initialize();
        const resp = await supertest_1.default(server)
            .post("/api/appletCopy")
            .set("Accept", "application/json")
            .send(body);
        return Promise.resolve(resp.body.applet_copy_id);
    }
    static async deleteAppletCopy(server, appletCopyId) {
        await this.initialize();
        const resp = await supertest_1.default(server)
            .delete("/api/appletCopy/${appletCopyId}")
            .set("Accept", "application/json");
        return Promise.resolve(resp);
    }
    static async putSuspendBlock(server, putSuspendBody, key) {
        await this.initialize();
        const resp = await supertest_1.default(server)
            .put("/api/admin/blockSuspend")
            .set("Accept", "application/json")
            .set("Authorization", key)
            .send(putSuspendBody);
        return Promise.resolve(resp);
    }
    static async postSampleAppletWithKey(server, key) {
        const resp = await supertest_1.default(server)
            .post("/api/applets")
            .set("Accept", "application/json")
            .set("Authorization", key)
            .send(this.mAppletPostBody);
        return Promise.resolve(resp.body.id);
    }
    static async deleteApplet(appletId) {
        const defaultApi = await this.getDefaultApi();
        return await defaultApi.deleteApplet(appletId);
    }
    static async deleteAppletWithKey(appletId, key) {
        const defaultApi = new api_1.DefaultApi();
        defaultApi.setApiKey(api_1.DefaultApiApiKeys.JWTToken, key);
        defaultApi.basePath = this.mServerBaseUrl;
        return await defaultApi.deleteApplet(appletId);
    }
    static getSamplePostApplet() {
        const applet = Object.assign({}, this.mAppletPostBody);
        return applet;
    }
    static getSamplePostBlock() {
        const block = Object.assign({}, this.mBlockPostBody);
        return block;
    }
    static getSuspendBlock() {
        const suspend = Object.assign({}, this.mPutBlockSuspendBody);
        return suspend;
    }
    static isISO8601String(dateStr) {
        const regexp = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
        return regexp.test(dateStr);
    }
    static getCallerFunName() {
        const stackstr = new Error().stack;
        let funcName = "";
        if (stackstr !== null) {
            const stack = stackstr;
            const funcNames = stack.split("\n");
            if (funcNames.length >= 4) {
                funcName = funcNames[3];
                funcName = funcName.replace(/ +\(.*/g, "");
                funcName = funcName.replace(/^ +at +/g, "");
            }
        }
        return funcName;
    }
    static putUserPreference(body) {
        return riiiverdb.forWrite(config.region, null, null, async (ds) => {
            const result = await ds.post(riiiverdb.USER_PREFERENCE, {
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
            });
            return result._id;
        });
    }
    static delUserPreference(preferenceId) {
        return riiiverdb.forWrite(config.region, null, null, async (ds) => {
            await ds.delete_(riiiverdb.USER_PREFERENCE, preferenceId, {
                credential: config.root_key
            });
        });
    }
}
exports.TestUtil = TestUtil;
TestUtil.mServerBaseUrl = config.server + "/api";
TestUtil.mAuthKey = "";
TestUtil.mDefaultApi = new api_1.DefaultApi();
TestUtil.mAppletPostBody = JSON.parse(fs
    .readFileSync(`${__dirname}/../api/controllers/testJsonFiles/appletsPostReqBody.json`)
    .toString());
TestUtil.mPutBlockSuspendBody = JSON.parse(`{
    "blockId": "",
    "blockSuspendFlg": true,
    "blockSuspendCode": "950",
    "blockSuspendMessage":"Test message"
  }`);
TestUtil.mBlockPostBody = JSON.parse(`{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsdUNBQXlCO0FBQ3pCLDBEQUFnQztBQUNoQywrQkFBc0Q7QUFDdEQsa0VBQW9EO0FBRXBELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQ3BELE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUM7QUFFN0MsTUFBYSxRQUFRO0lBR1osTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVO1FBQzVCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzVCLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQzFCO1FBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxjQUFjLENBQUM7UUFDL0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsdUJBQWlCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0RSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQ2xELENBQUM7SUFFTSxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWE7UUFDL0IsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDeEIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFXO1FBQzNCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3pDLHFCQUFxQjtRQUVyQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksUUFBUSxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDcEMsbUJBQW1CO0lBQ3JCLENBQUM7SUFFTSxNQUFNLENBQUMsS0FBSyxDQUFD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QUNuQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVk7Z0JBQy9CLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztnQkFDN0IsSUFBSSxFQUFFLEVBQUU7YUFDVCxFQUFFO2dCQUNELFVBQVUsRUFBRSxNQUFNLENBQUMsUUFBUTthQUM1QixDQUFRLENBQUM7WUFDVixPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ00sTUFBTSxDQUFDLGlCQUFpQixDQUFDLFlBQW9CO1FBQ2xELE9BQU8sU0FBUyxDQUFDLFFBQVEsQ0FDdkIsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUN6QixLQUFLLEVBQUUsRUFBK0IsRUFBRSxFQUFFO1lBQ3hDLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FDZCxTQUFTLENBQUMsZUFBZSxFQUN6QixZQUFZLEVBQUU7Z0JBQ2QsVUFBVSxFQUFFLE1BQU0sQ0FBQyxRQUFRO2FBQzVCLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQzs7QUF6ZEgsNEJBMGRDO0FBemR3Qix1QkFBYyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBaUpoRCxpQkFBUSxHQUFHLEVBQUUsQ0FBQztBQUNMLG9CQUFXLEdBQUcsSUFBSSxnQkFBVSxFQUFFLENBQUM7QUFDL0Isd0JBQWUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUNsRCxFQUFFO0tBQ0MsWUFBWSxDQUNYLEdBQUcsU0FBUywyREFBMkQsQ0FDeEU7S0FDQSxRQUFRLEVBQUUsQ0FDZCxDQUFDO0FBRXNCLDZCQUFvQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Ozs7O0lBS3hELENBQUMsQ0FBQztBQUVvQix1QkFBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBaVFsRCxDQUFDLENBQUMifQ==