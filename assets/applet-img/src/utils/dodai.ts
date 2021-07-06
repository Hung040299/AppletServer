"use strict";
import request = require("request");
import rp = require("request-promise");

const MAX_DATA = 1000;

type DodaiResponseType = {
  status: number;
  body: any;
};

// Convenient request senders
export const get = async (
  pathAfterAppId: string,
  queryParams: any,
  config: {
    app_id: string;
    group_id: string;
    url: string;
    key: string;
  }
) => {
  const numPathAfterAppId = pathAfterAppId + `/_count`;

  return sendRequest(
    "GET",
    `/v1/${config.app_id}${numPathAfterAppId}`,
    queryParams,
    "",
    config.key,
    config.url
  ).then(({ status, body }) => {
    if (status !== 200) {
      return sendRequest(
        "GET",
        `/v1/${config.app_id}${pathAfterAppId}`,
        queryParams,
        "",
        config.key,
        config.url
      );
    } else {
      const devideNum =
        body.matched === 0 ? 1 : Math.ceil(body.matched / MAX_DATA);
      const start = 0;
      return Promise.all(
        Array.apply(0, new Array(devideNum - start)).map((e, i) => {
          const skipNum = 1000 * (start + i);
          const newQueryParams = Object.assign(queryParams, { skip: skipNum });
          return sendRequest(
            "GET",
            `/v1/${config.app_id}${pathAfterAppId}`,
            newQueryParams,
            "",
            config.key,
            config.url
          );
        })
      ).then((array: any) => {
        for (let i = 0; i < devideNum; i++) {
          if (array[i].status === 200) {
            if (i > 0) {
              array[0].body = array[0].body.concat(array[i].body);
            }
          } else {
            array[0].status = array[i].status;
            array[0].body = array[i].body;
            return array[0];
          }
        }
        return array[0];
      });
    }
  });
};

export const sendRequest = async (
  method: string,
  path: string,
  queryParams: any,
  body: any,
  key: string,
  baseUrl: string
) => {
  const reqBody = typeof body !== "string" ? JSON.stringify(body) : body;
  const baseHeaders = {
    accept: "application/json",
    authorization: key
  };
  const reqHeaders =
    reqBody.length > 0
      ? Object.assign(baseHeaders, { "content-type": "application/json" })
      : baseHeaders;
  return rp({
    body: reqBody,
    headers: reqHeaders,
    method,
    qs: queryParams,
    simple: false, // Reject only when requests failed with connection issues
    transform: jsonReader,
    uri: `${baseUrl}${path}`
  }).catch(handleUnexpectedError);
};

const jsonReader = (body: any, { statusCode, headers }: request.Response) => {
  const isJson =
    headers["content-type"] &&
    headers["content-type"].startsWith("application/json");
  return { status: statusCode, body: isJson ? JSON.parse(body) : body };
};

const handleUnexpectedError = (error: any): DodaiResponseType => {
  return { status: 500, body: { message: error.message } };
};
