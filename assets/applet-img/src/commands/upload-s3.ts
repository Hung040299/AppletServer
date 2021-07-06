import { Command, flags } from "@oclif/command";
import * as fs from "fs";
import * as path from "path";
import * as AWS from "aws-sdk";

export default class UploadS3 extends Command {
  static description = "describe the command here";

  static flags = {
    help: flags.help({ char: "h" }),
    "auto-rm": flags.boolean({
      description: "Remove uploaded file.",
      default: false
    }),
    bucketName: flags.string({
      char: "b",
      description: "AWS Bucket name",
      required: true
    }),
    accessKey: flags.string({
      char: "a",
      description: "AWS access key from env 'AWSAccessKey'",
      env: "AWSAccessKey",
      required: true
    }),
    secretKey: flags.string({
      char: "s",
      description: "AWS secret key from env 'AWSSecretKey'",
      env: "AWSSecretKey",
      required: true
    })
  };

  static args = [{ name: "file" }];

  async *getFiles(dir: string): any {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = path.resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        yield* this.getFiles(res);
      } else {
        yield res;
      }
    }
  }

  async run() {
    const { args, flags } = this.parse(UploadS3);
    // this.log(`${flags.accessKey},${flags.secretKey}`);

    // const BUCKET_NAME = "<<bucket name>>";

    const s3bucket = new AWS.S3({
      accessKeyId: flags.accessKey,
      secretAccessKey: flags.secretKey
    });

    for await (const f of this.getFiles(flags.bucketName)) {
      this.log(`upload ${f}`);

      const s3KeyWithExt = f.split(`${flags.bucketName}/`)[1];
      const s3key = s3KeyWithExt.split(".")[0];
      // this.log(flags.bucketName);
      // this.log(s3key.split(".")[0]);
      const fileContent = fs.readFileSync(f);
      const uploadParams = {
        Bucket: flags.bucketName,
        Key: s3key,
        Body: fileContent,
        ContentType: "image/png"
      };

      try {
        const result = await s3bucket.upload(uploadParams).promise();
        this.log(`[OK] upload -> ${f}`);
      } catch (err) {
        this.error(`[FAIL] upload -> ${f}`);
      }

      const aclPublicParam = {
        ACL: "public-read",
        Bucket: flags.bucketName,
        Key: s3key
      };

      try {
        const result = await s3bucket.putObjectAcl(aclPublicParam).promise();
        this.log(`[OK] change acl -> ${f}`);
      } catch (err) {
        this.error(`[FAIL] change acl -> ${f}`);
      }

      if (flags["auto-rm"]) {
        fs.unlinkSync(f);
      }

      this.log(`done ${f}`);
    }
  }
}
