import * as fs from "fs";
import * as api from "../../utility/api";

import http from "http";
import sizeOf from "image-size";

import assert from "power-assert";
import request from "supertest";
import url from "url";
import util from "util";

import { TestUtil } from "../../utility/util";

const exec = util.promisify(require("child_process").exec);

/* tslint:disable: no-var-requires */
const config = require("./config");
/* tslint:enable: no-var-requires */

const aws_access_key = config.aws_access_key;
const aws_secret_key = config.aws_secret_key;
const dummy_user_key = config.dummy_user_key;
const server = config.server;

describe("Image resize tool", () => {
  const gDefaultApi = new api.DefaultApi();

  before(async () => {
    gDefaultApi.setApiKey(api.DefaultApiApiKeys.JWTToken, dummy_user_key);
    gDefaultApi.basePath = TestUtil.mServerBaseUrl;
  });

  it("appletIcon must resize after run batch tool", async () => {
    let appletId = "";

    try {
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

      const file = `${__dirname}/testIconFiles/test_image.png`;

      let uploadedImage: string = "";

      await request(server)
        .post(`/api/appletIcon?appletId=${appletId}`)
        .set("Authorization", dummy_user_key)
        .attach("image", file)
        .expect(res => {
          uploadedImage = res.body;
        })
        .expect(201);

      // create large icon file from uploaded image url
      const outputPath = `${__dirname}/testJsonFiles/large-iconurls.json`;
      fs.writeFileSync(outputPath, JSON.stringify([uploadedImage]), "utf-8");

      // handle run command of resize image tool
      await exec(
        `${process.env.PWD}/assets/applet-img/bin/run filter-large-size -f ${outputPath} -b veldt-dodai-dev-files`
      );

      await exec(
        `${process.env.PWD}/assets/applet-img/bin/run upload-s3 --auto-rm -b veldt-dodai-dev-files -a ${aws_access_key} -s ${aws_secret_key}`
      );

      // check image size on s3 after the image resize tool ran
      const resizedValue: { width: number; height: number } = await new Promise(
        (resolve, _) => {
          const options = url.parse(uploadedImage.replace(/https/, "http"));

          http.get(options, (response: any) => {
            const chunks: any[] = [];
            response
              .on("data", (chunk: any) => {
                chunks.push(chunk);
              })
              .on("end", () => {
                const buffer = Buffer.concat(chunks);
                resolve(sizeOf(buffer));
              });
          });
        }
      );
      assert.deepEqual(resizedValue.width, 512);
      assert.deepEqual(resizedValue.height, 512);
    } catch (e) {
      throw e;
    } finally {
      // remove content on large-iconurls.json
      const outputPath = `${__dirname}/testJsonFiles/large-iconurls.json`;
      fs.writeFileSync(outputPath, "", "utf-8");

      if (appletId.length > 0) {
        await TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
      }
    }
  });
});
