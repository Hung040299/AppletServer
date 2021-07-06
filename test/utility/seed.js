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
const { root_key } = require("config").dodai;
const riiiverdb = __importStar(require("user-session/riiiverdb"));
const fs_1 = __importDefault(require("fs"));
const sampleWatchButtonTriggerBlock = {
    _id: "watchButton-5a96423c1388f9fd918f5c1f",
    data: {
        blockType: "trigger",
        description: {
            en: "A trigger initiated by pushing a smartwatch button",
            ja: "スマートウォッチのボタンを押すことで開始するトリガー"
        },
        deviceId: "WATCHDEVICEID0001",
        executor: "ERWatchButtonTriggerBlockListener",
        preferences: {
            properties: {
                buttonIndex: {
                    default: 0,
                    type: "integer",
                    "x-title": { ja: "ボタン位置", en: "Button Index" }
                }
            },
            required: ["buttonIndex"],
            type: "object"
        },
        sdkVersion: "1.0.0",
        title: {
            en: "Smartwatch Button",
            ja: "スマートウォッチボタン"
        },
        vendorId: "WATCHVENDORID0001",
        version: "1.0.0"
        // Does not have any output; just triggers
    }
};
const sampleScheduleServiceBlock = {
    _id: "schedule-5a96423c1388f9fd918f5c20",
    data: {
        blockType: "service",
        description: {
            en: "Get the upcoming event from schedule function of user's smartphone",
            ja: "直近の予定をスマートホンのスケジュール機能から取得する"
        },
        deviceId: "",
        executor: "ERUpcomingEventServiceBlockExecutor",
        output: {
            properties: {
                location: { type: "string" },
                startAt: { type: "string", format: "date-time" },
                title: { type: "string" }
            },
            required: ["title", "startAt"],
            type: "object"
        },
        sdkVersion: "1.0.0",
        title: {
            en: "Upcoming Event",
            ja: "このあとの予定"
        },
        vendorId: "PROJECTERVENDORID0002",
        version: "1.0.0"
        // Does not take any input;
    }
};
const sampleWatchHandActionBlock = {
    _id: "watchHand-5a96423c1388f9fd918f5c21",
    data: {
        blockType: "action",
        description: {
            en: "Express various information by hand movements of smartwatch",
            ja: "様々な情報をスマートウォッチの針の動きで表現"
        },
        deviceId: "WATCHDEVICEID0001",
        executor: "ERWatchHandActionBlockExecutor",
        input: {
            properties: {
                amount: {
                    type: "integer",
                    "x-description": {
                        en: "Integer amount of movement. 100 for a whole circle. A hand starts at 0 o'clock, move specified amount, then returns. One of `amount` or `time` is necessary.",
                        ja: "針の動きの大きさを整数値で指定。1周を100とし、0時の位置から指定された量動いて、戻る。`amount`と`time`のどちらかは必須。"
                    }
                },
                time: {
                    format: "date-time",
                    type: "string",
                    "x-description": {
                        en: "Time to show. Shows the specified time by 3 hands, stays for a few seconds, then returns. Ignoring `handType`. One of `amount` or `time` is necessary.",
                        ja: "針の動きを時刻で指定。`handType`設定を無視し、指定された時刻を3本の針で表現、数秒静止したあと戻る。`amount`と`time`のどちらかは必須。"
                    }
                }
            },
            type: "object"
        },
        preferences: {
            properties: {
                handType: {
                    default: "minute",
                    enum: ["second", "minute", "hour"],
                    type: "string",
                    "x-enum-titles": {
                        hour: { ja: "時針", en: "Hour hand" },
                        minute: { ja: "分針", en: "Minute hand" },
                        second: { ja: "秒針", en: "Second hand" }
                    },
                    "x-title": {
                        en: "Hand Type",
                        ja: "針の種類"
                    }
                }
            },
            type: "object"
        },
        sdkVersion: "1.0.0",
        title: {
            en: "Smartwatch hand",
            ja: "スマートウォッチの針"
        },
        vendorId: "WATCHVENDORID0001",
        version: "1.0.0"
    }
};
const wrap = async (proc) => {
    try {
        return await proc();
    }
    catch (e) {
        let code = 400;
        if ('result' in e) {
            let result = e.result();
            if (result.errcode == 1002) {
                let m = result.body.code.match('([0-9]*)-([0-9]*)');
                if (m) {
                    code = parseInt(m[1]);
                }
            }
        }
        else if ('code' in e) {
            let m = e.code.match('([0-9]*)-([0-9]*)');
            if (m) {
                code = parseInt(m[1]);
            }
        }
        return { status: code, body: e };
    }
};
const put = (ds, collection, body, key) => {
    return wrap(async () => {
        let result = await ds.put(collection, body, {
            credential: key,
            upsert: true
        });
        return { status: result[1], body: result[0] };
    });
};
const post = (ds, collection, body, key) => {
    return wrap(async () => {
        let result = await ds.post(collection, body, {
            credential: key
        });
        return { status: 201, body: result };
    });
};
const delete_ = (ds, collection, id, key) => {
    return wrap(async () => {
        let result = await ds.delete_(collection, id, {
            credential: key
        });
        return { status: 204, body: result };
    });
};
const load = async (collection, filename) => {
    const txt = fs_1.default.readFileSync(`./assets/dodai/data/${filename}`, 'utf-8');
    const js = JSON.parse(txt);
    js.forEach(async (item) => {
        riiiverdb.forWrite('JP', null, null, async (ds) => {
            await put(ds, collection, item, root_key);
        });
    });
};
riiiverdb.forWrite('JP', null, null, async (ds) => {
    const postBlock = async (reqBody) => {
        const { status, body } = await put(ds, riiiverdb.BLOCK, reqBody, root_key);
        if (status === 201) {
            console.log(`Created: ${body._id}`);
        }
        else if (status === 409) {
            await delete_(ds, riiiverdb.BLOCK, reqBody._id, root_key);
            console.log(`Deleted for recreation: ${reqBody._id}`);
            await postBlock(reqBody);
        }
        else {
            console.error(`Unexpexted: ${status}`);
            console.error(body);
        }
    };
    await postBlock(sampleWatchButtonTriggerBlock);
    await postBlock(sampleScheduleServiceBlock);
    await postBlock(sampleWatchHandActionBlock);
}).then(async () => {
    //    await load(riiiverdb.APPLET, 'applet.json')
    //    await load(riiiverdb.APPLET_GOODNUM, 'appletgoodnum.json')
    //    await load(riiiverdb.APPLET_MISC, 'appletmisc.json')
    //    await load(riiiverdb.APPLET_PUBLIC_STATUS, 'appletpublicstatus.json')
    //    await load(riiiverdb.APPLET_STORE_STATUS, 'appletstorestatus.json')
    //    await load(riiiverdb.BLOCK, 'block.json')
    //    await load(riiiverdb.BLOCK_LAMBDA, 'blockLambda.json')
    //    await load(riiiverdb.BLOCK_STORE_STATUS, 'blockStoreStatus.json')
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7QUFFYixNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUk3QyxrRUFBb0Q7QUFFcEQsNENBQW9CO0FBRXBCLE1BQU0sNkJBQTZCLEdBQUc7SUFDcEMsR0FBRyxFQUFFLHNDQUFzQztJQUMzQyxJQUFJLEVBQUU7UUFDSixTQUFTLEVBQUUsU0FBUztRQUNwQixXQUFXLEVBQUU7WUFDWCxFQUFFLEVBQUUsb0RBQW9EO1lBQ3hELEVBQUUsRUFBRSw0QkFBNEI7U0FDakM7UUFDRCxRQUFRLEVBQUUsbUJBQW1CO1FBQzdCLFFBQVEsRUFBRSxtQ0FBbUM7UUFDN0MsV0FBVyxFQUFFO1lBQ1gsVUFBVSxFQUFFO2dCQUNWLFdBQVcsRUFBRTtvQkFDWCxPQUFPLEVBQUUsQ0FBQztvQkFDVixJQUFJLEVBQUUsU0FBUztvQkFDZixTQUFTLEVBQUUsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUU7aUJBQy9DO2FBQ0Y7WUFDRCxRQUFRLEVBQUUsQ0FBQyxhQUFhLENBQUM7WUFDekIsSUFBSSxFQUFFLFFBQVE7U0FDZjtRQUNELFVBQVUsRUFBRSxPQUFPO1FBQ25CLEtBQUssRUFBRTtZQUNMLEVBQUUsRUFBRSxtQkFBbUI7WUFDdkIsRUFBRSxFQUFFLGFBQWE7U0FDbEI7UUFDRCxRQUFRLEVBQUUsbUJBQW1CO1FBQzdCLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLDBDQUEwQztLQUMzQztDQUNGLENBQUM7QUFFRixNQUFNLDBCQUEwQixHQUFHO0lBQ2pDLEdBQUcsRUFBRSxtQ0FBbUM7SUFDeEMsSUFBSSxFQUFFO1FBQ0osU0FBUyxFQUFFLFNBQVM7UUFDcEIsV0FBVyxFQUFFO1lBQ1gsRUFBRSxFQUFFLG9FQUFvRTtZQUN4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