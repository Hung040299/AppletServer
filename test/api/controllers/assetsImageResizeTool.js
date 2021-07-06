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
const api = __importStar(require("../../utility/api"));
const http_1 = __importDefault(require("http"));
const image_size_1 = __importDefault(require("image-size"));
const power_assert_1 = __importDefault(require("power-assert"));
const supertest_1 = __importDefault(require("supertest"));
const url_1 = __importDefault(require("url"));
const util_1 = __importDefault(require("util"));
const util_2 = require("../../utility/util");
const exec = util_1.default.promisify(require("child_process").exec);
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
        gDefaultApi.basePath = util_2.TestUtil.mServerBaseUrl;
    });
    it("appletIcon must resize after run batch tool", async () => {
        let appletId = "";
        try {
            const exampleReqBody = JSON.parse(require("fs").readFileSync(`${__dirname}/testJsonFiles/appletsPostReqBody.json`));
            await supertest_1.default(server)
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
            let uploadedImage = "";
            await supertest_1.default(server)
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
            await exec(`${process.env.PWD}/assets/applet-img/bin/run filter-large-size -f ${outputPath} -b veldt-dodai-dev-files`);
            await exec(`${process.env.PWD}/assets/applet-img/bin/run upload-s3 --auto-rm -b veldt-dodai-dev-files -a ${aws_access_key} -s ${aws_secret_key}`);
            // check image size on s3 after the image resize tool ran
            const resizedValue = await new Promise((resolve, _) => {
                const options = url_1.default.parse(uploadedImage.replace(/https/, "http"));
                http_1.default.get(options, (response) => {
                    const chunks = [];
                    response
                        .on("data", (chunk) => {
                        chunks.push(chunk);
                    })
                        .on("end", () => {
                        const buffer = Buffer.concat(chunks);
                        resolve(image_size_1.default(buffer));
                    });
                });
            });
            power_assert_1.default.deepEqual(resizedValue.width, 512);
            power_assert_1.default.deepEqual(resizedValue.height, 512);
        }
        catch (e) {
            throw e;
        }
        finally {
            // remove content on large-iconurls.json
            const outputPath = `${__dirname}/testJsonFiles/large-iconurls.json`;
            fs.writeFileSync(outputPath, "", "utf-8");
            if (appletId.length > 0) {
                await util_2.TestUtil.deleteAppletWithKey(appletId, dummy_user_key);
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXRzSW1hZ2VSZXNpemVUb29sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXNzZXRzSW1hZ2VSZXNpemVUb29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6Qix1REFBeUM7QUFFekMsZ0RBQXdCO0FBQ3hCLDREQUFnQztBQUVoQyxnRUFBa0M7QUFDbEMsMERBQWdDO0FBQ2hDLDhDQUFzQjtBQUN0QixnREFBd0I7QUFFeEIsNkNBQThDO0FBRTlDLE1BQU0sSUFBSSxHQUFHLGNBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRTNELHFDQUFxQztBQUNyQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDbkMsb0NBQW9DO0FBRXBDLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUM7QUFDN0MsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQUM3QyxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDO0FBQzdDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFFN0IsUUFBUSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtJQUNqQyxNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUV6QyxNQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDaEIsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3RFLFdBQVcsQ0FBQyxRQUFRLEdBQUcsZUFBUSxDQUFDLGNBQWMsQ0FBQztJQUNqRCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyw2Q0FBNkMsRUFBRSxLQUFLLElBQUksRUFBRTtRQUMzRCxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFFbEIsSUFBSTtZQUNGLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQy9CLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQ3hCLEdBQUcsU0FBUyx3Q0FBd0MsQ0FDckQsQ0FDRixDQUFDO1lBRUYsTUFBTSxtQkFBTyxDQUFDLE1BQU0sQ0FBQztpQkFDbEIsSUFBSSxDQUFDLGNBQWMsQ0FBQztpQkFDcEIsR0FBRyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQztpQkFDakMsR0FBRyxDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUM7aUJBQ3BDLElBQUksQ0FBQyxjQUFjLENBQUM7aUJBQ3BCLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO2lCQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDO2lCQUNYLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDWixRQUFRLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7WUFFTCxNQUFNLElBQUksR0FBRyxHQUFHLFNBQVMsK0JBQStCLENBQUM7WUFFekQsSUFBSSxhQUFhLEdBQVcsRUFBRSxDQUFDO1lBRS9CLE1BQU0sbUJBQU8sQ0FBQyxNQUFNLENBQUM7aUJBQ2xCLElBQUksQ0FBQyw0QkFBNEIsUUFBUSxFQUFFLENBQUM7aUJBQzVDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDO2lCQUNwQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQztpQkFDckIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNaLGFBQWEsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQzNCLENBQUMsQ0FBQztpQkFDRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFZixpREFBaUQ7WUFDakQsTUFBTSxVQUFVLEdBQUcsR0FBRyxTQUFTLG9DQUFvQyxDQUFDO1lBQ3BFLEVBQUUsQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRXZFLDBDQUEwQztZQUMxQyxNQUFNLElBQUksQ0FDUixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxtREFBbUQsVUFBVSwyQkFBMkIsQ0FDM0csQ0FBQztZQUVGLE1BQU0sSUFBSSxDQUNSLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLDhFQUE4RSxjQUFjLE9BQU8sY0FBYyxFQUFFLENBQ3RJLENBQUM7WUFFRix5REFBeUQ7WUFDekQsTUFBTSxZQUFZLEdBQXNDLE1BQU0sSUFBSSxPQUFPLENBQ3ZFLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNiLE1BQU0sT0FBTyxHQUFHLGFBQUcsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFFbEUsY0FBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFhLEVBQUUsRUFBRTtvQkFDbEMsTUFBTSxNQUFNLEdBQVUsRUFBRSxDQUFDO29CQUN6QixRQUFRO3lCQUNMLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFVLEVBQUUsRUFBRTt3QkFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDckIsQ0FBQyxDQUFDO3lCQUNELEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFO3dCQUNkLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ3JDLE9BQU8sQ0FBQyxvQkFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQzFCLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUNGLENBQUM7WUFDRixzQkFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzFDLHNCQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDNUM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE1BQU0sQ0FBQyxDQUFDO1NBQ1Q7Z0JBQVM7WUFDUix3Q0FBd0M7WUFDeEMsTUFBTSxVQUFVLEdBQUcsR0FBRyxTQUFTLG9DQUFvQyxDQUFDO1lBQ3BFLEVBQUUsQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUUxQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN2QixNQUFNLGVBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7YUFDOUQ7U0FDRjtJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMifQ==