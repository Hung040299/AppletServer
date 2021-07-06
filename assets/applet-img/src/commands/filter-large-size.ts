import { Command, flags } from "@oclif/command";
import * as fs from "fs";
import * as path from "path";
const Jimp = require("jimp");

export default class FilterLargeSize extends Command {
  static description = "describe the command here";

  static flags = {
    help: flags.help({ char: "h" }),
    // flag with a value (-n, --name=VALUE)
    filePath: flags.string({
      char: "f",
      description: "file path of url list",
      default: path.join(__dirname, "iconurls.json")
    }),
    bucketName: flags.string({
      char: "b",
      description: "aws s3 bucket name",
      required: true
    })
  };

  // static args = [{ name: "file" }];

  loadData(path: string) {
    try {
      return fs.readFileSync(path, "utf8");
    } catch (err) {
      console.error(err);
      return "[]";
    }
  }

  async run() {
    const { flags } = this.parse(FilterLargeSize);
    const urlsRaw = this.loadData(flags.filePath);
    const urls = JSON.parse(urlsRaw);

    const urlSet = new Set();
    const outputPath = path.join(__dirname, "large-iconurls.json");

    for (const item of urls) {
      if (!item.includes("d2i17waipmeu54.cloudfront.net")) {
        continue;
      }
      console.log(item);
      // console.log(Jimp);
      const img = await Jimp.read(item);
      const w = img.bitmap.width; // the width of the img
      const h = img.bitmap.height; // the height of the img
      const fileName = item.replace(
        "https://d2i17waipmeu54.cloudfront.net/",
        `${flags.bucketName}/`
      );
      if (w > 512 || h > 512) {
        urlSet.add(item);
        console.log(item)
        console.log(`${w}x${h}`);
        img.resize(512, 512);
        img.write(`${fileName}.${img.getExtension()}`);
        await fs.writeFileSync(
          outputPath,
          JSON.stringify(Array.from(urlSet.values())),
          "utf-8"
        );
        this.log(`export large icons to ${outputPath}`);
      }
    }
  }
}
