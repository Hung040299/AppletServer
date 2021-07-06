"use strict";

const { root_key } = require("config").dodai;
import {
  DodaiResponseType,
} from "../../api/type/type";
import * as riiiverdb from 'user-session/riiiverdb';
import { end } from 'user-session/dbManager';
import fs from 'fs';

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
            en:
              "Integer amount of movement. 100 for a whole circle. A hand starts at 0 o'clock, move specified amount, then returns. One of `amount` or `time` is necessary.",
            ja:
              "針の動きの大きさを整数値で指定。1周を100とし、0時の位置から指定された量動いて、戻る。`amount`と`time`のどちらかは必須。"
          }
        },
        time: {
          format: "date-time",
          type: "string",
          "x-description": {
            en:
              "Time to show. Shows the specified time by 3 hands, stays for a few seconds, then returns. Ignoring `handType`. One of `amount` or `time` is necessary.",
            ja:
              "針の動きを時刻で指定。`handType`設定を無視し、指定された時刻を3本の針で表現、数秒静止したあと戻る。`amount`と`time`のどちらかは必須。"
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

const wrap = async (proc: () => Promise<DodaiResponseType>) => {
    try {
	return await proc()
    } catch( e ) {
	let code = 400;
	if ('result' in e) {
	    let result = e.result()
	    if (result.errcode == 1002) {
		let m = result.body.code.match('([0-9]*)-([0-9]*)')
		if (m) {
		    code = parseInt(m[1])
		}
	    }
	} else if ('code' in e) {
	    let m = e.code.match('([0-9]*)-([0-9]*)')
	    if (m) {
		code = parseInt(m[1])
	    }
	}
	return { status: code, body: e } as DodaiResponseType
    }
}

const put = (ds: riiiverdb.DatastoreForWrite, collection: string, body: any, key: string) : Promise<DodaiResponseType> => {
    return wrap( async () => {
	let result = await ds.put(
	    collection,
	    body, {
		credential: key,
		upsert: true
	    });
	return { status: result[1], body: result[0] } as DodaiResponseType;
    });
}

const post = (ds: riiiverdb.DatastoreForWrite, collection: string, body: any, key: string) : Promise<DodaiResponseType> => {
    return wrap( async () => {
	let result = await ds.post(
	    collection,
	    body, {
		credential: key
	    });
	return { status: 201, body: result } as DodaiResponseType;
    });
}

const delete_ = (ds: riiiverdb.DatastoreForWrite, collection: string, id: string, key: string) : Promise<DodaiResponseType> => {
    return wrap( async () => {
	let result = await ds.delete_(
	    collection,
	    id, {
		credential: key
	    });
	return { status: 204, body: result } as DodaiResponseType;
    });
};

const load = async (collection: string, filename: string) => {
    const txt = fs.readFileSync(`./assets/dodai/data/${filename}`, 'utf-8');
    const js  = JSON.parse(txt);
    js.forEach(async (item: any) => {
	riiiverdb.forWrite('JP', null, null, async (ds: riiiverdb.DatastoreForWrite) => {
	    await put(ds, collection, item, root_key);
	});
    });
};

riiiverdb.forWrite(
    'JP',
    null,
    null,
    async (ds: riiiverdb.DatastoreForWrite) => {
	const postBlock = async (reqBody: any) => {
	    const { status, body } = await put(
		ds,
		riiiverdb.BLOCK,
		reqBody,
		root_key
	    );
	    if (status === 201) {
		console.log(`Created: ${body._id}`);
	    } else if (status === 409) {
		await delete_(ds, riiiverdb.BLOCK, reqBody._id, root_key);
		console.log(`Deleted for recreation: ${reqBody._id}`);
		await postBlock(reqBody);
	    } else {
		console.error(`Unexpexted: ${status}`);
		console.error(body);
	    }
	};

	await postBlock(sampleWatchButtonTriggerBlock);
	await postBlock(sampleScheduleServiceBlock);
	await postBlock(sampleWatchHandActionBlock);

}).then( async () => {
//    await load(riiiverdb.APPLET, 'applet.json')
//    await load(riiiverdb.APPLET_GOODNUM, 'appletgoodnum.json')
//    await load(riiiverdb.APPLET_MISC, 'appletmisc.json')
//    await load(riiiverdb.APPLET_PUBLIC_STATUS, 'appletpublicstatus.json')
//    await load(riiiverdb.APPLET_STORE_STATUS, 'appletstorestatus.json')
//    await load(riiiverdb.BLOCK, 'block.json')
//    await load(riiiverdb.BLOCK_LAMBDA, 'blockLambda.json')
//    await load(riiiverdb.BLOCK_STORE_STATUS, 'blockStoreStatus.json')
});

export {};
