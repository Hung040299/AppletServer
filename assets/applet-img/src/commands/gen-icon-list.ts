import { Command, flags } from "@oclif/command";
import * as fs from "fs";
import * as path from "path";

import { get } from "../utils/dodai";

export default class GenIconList extends Command {
  static description = "describe the command here";

  static flags = {
    help: flags.help({ char: "h" }),
    // flag with a value (-n, --name=VALUE)
    env: flags.string({
      char: "e",
      description: "specify environment",
      options: ["prod", "stg", "dev"],
      required: true
    })
  };

  async query(url: string, groupId: string, appId: string, key: string) {
    try {
      const res = await get(
        `/${groupId}/data/applet`,
        {},
        {
          app_id: appId,
          group_id: groupId,
          url,
          key
        }
      );
      return Promise.resolve(res.body);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async run() {
    const {
      flags: { env }
    } = this.parse(GenIconList);

    const dodaiInfo: any = {
      prod: {
        dodaiURL: "https://localhost:8888",
        appId: "a_88Rqf1hf",
        groupId: "g_6fWqhPHK",
        rootKey: "rkey_PcVilQMvsh2sJXQpg"
      },
      dev: {
        dodaiURL: "https://st-dod.riiiver.com",
        appId: "a_QknrkGVJ",
        groupId: "g_h6hfcK3x",
        rootKey: "rkey_6KnRBSVK4xFz9pVpER"
      },
      stg: {
        dodaiURL: "https://st-dod.riiiver.com",
        appId: "a_jf02fuwj",
        groupId: "g_HfrQEfKt",
        rootKey: "rkey_wQ33ngqWBD5LiDU5Xm"
      }
    };

    let response = {};

    try {
      const { dodaiURL, appId, groupId, rootKey } = dodaiInfo[env];
      response = await this.query(dodaiURL, groupId, appId, rootKey);
    } catch (error) {
      console.error(error.response);
      return;
    }

    const urlSet = new Set();
    for (const item of response as any) {
      const iconUrl = item.data?.iconUrl;
      if ([""].includes(iconUrl)) {
        continue;
      }

      urlSet.add(iconUrl);
    }
    this.log(`there are ${urlSet.size} icon urls.`);
    const outputPath = path.join(__dirname, "iconurls.json");
    fs.writeFileSync(
      outputPath,
      JSON.stringify(Array.from(urlSet.values())),
      "utf-8"
    );
    this.log(`export data to ${outputPath}`);
  }
}
