// @flow
"use strict";

// tslint:disable:no-shadowed-variable
const { get, post, put, delete_ } = require("ER_Proto_Block_Server/lib/dodai");
const { group_id } = require("config").dodai;
const logger = require("../service/logUtil").logger;
const { errorHandle } = require("../service/errorUtil");
import { DodaiEntityType } from "../type/type";

const DATASTORE = "applettemplate";

export const listTemplates = (req: any, res: any) => {
  try {
    const templateId = req.swagger.params.templateId.value;
    const templateType = req.swagger.params.templateType.value;
    const query = buildListQuery(templateId, templateType);
    logger.system.debug(`query=${JSON.stringify(query)}`);
    get(
      `/${group_id}/data/${DATASTORE}`,
      query,
      req.res.locals.security.key
    ).then(({ status, body }: DodaiResponseType) => {
      if (status === 200) {
        res
          .status(200)
          .json({ appletTemplate: body.map(buildTemplateResponse) });
      } else {
        logger.system.error(`listTemplate: ${JSON.stringify(body)}`);
        res.status(status).json(body);
      }
    });
  } catch (e) {
    return res.status(400).json({ message: errorHandle(e) });
  }
};

const buildTemplateResponse = ({ _id, data }: DodaiEntityType) => {
  return Object.assign({}, data, { id: _id });
};

const buildListQuery = (templateId: string, templateType: string) => {
  const reqQuery: any = {};
  if (templateId) {
    reqQuery._id = { $in: templateId };
  }
  if (templateType) {
    reqQuery["data.templateType"] = { $in: templateType };
  }
  if (Object.keys(reqQuery).length === 0) {
    return {};
  } else {
    return { query: JSON.stringify(reqQuery) };
  }
};

export const registTemplate = (req: any, res: any) => {
  try {
    const body = req.swagger.params.body.value;
    const postBody = { data: body };
    post(
      `/${group_id}/data/${DATASTORE}`,
      postBody,
      req.res.locals.security.key
    ).then(({ status, body }: DodaiResponseType) => {
      if (status === 201) {
        res.status(200).json(buildTemplateResponse(body));
      } else {
        logger.system.error(`registTemplate: ${JSON.stringify(body)}`);
        res.status(status).json({ message: body });
      }
    });
  } catch (e) {
    return res.status(400).json({ message: errorHandle(e) });
  }
};

export const putTemplate = (req: any, res: any) => {
  try {
    const template = req.swagger.params.template.value;
    const templateId = template.id;
    delete template.id;
    const putBody = { data: template };
    put(
      `/${group_id}/data/${DATASTORE}/${templateId}`,
      putBody,
      req.res.locals.security.key
    ).then(({ status, body }: DodaiResponseType) => {
      if (status === 200) {
        res.status(200).json(buildTemplateResponse(body));
      } else {
        logger.system.error(`putTemplate: ${JSON.stringify(body)}`);
        res.status(status).json({ message: body });
      }
    });
  } catch (e) {
    return res.status(400).json({ message: errorHandle(e) });
  }
};

export const getTemplate = (req: any, res: any) => {
  try {
    const id = req.swagger.params.id.value;
    get(
      `/${group_id}/data/${DATASTORE}/${id}`,
      {},
      req.res.locals.security.key
    ).then(({ status, body }: DodaiResponseType) => {
      if (status === 200) {
        res.status(200).json(buildTemplateResponse(body));
      } else {
        logger.system.error(`putTemplate: ${JSON.stringify(body)}`);
        res.status(status).json({ message: body });
      }
    });
  } catch (e) {
    return res.status(400).json({ message: errorHandle(e) });
  }
};

export const deleteTemplate = (req: any, res: any) => {
  try {
    const id = req.swagger.params.id.value;
    delete_(
      `/${group_id}/data/${DATASTORE}/${id}`,
      {},
      req.res.locals.security.key
    ).then(({ status, body }: DodaiResponseType) => {
      if (status === 204) {
        res.status(204).end();
      } else {
        logger.system.error(`deleteTemplate: ${JSON.stringify(body)}`);
        res.status(status).json({ message: body });
      }
    });
  } catch (e) {
    return res.status(400).json({ message: errorHandle(e) });
  }
};
