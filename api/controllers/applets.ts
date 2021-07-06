"use strict";

//import { delete_, get, post, put } from "ER_Proto_Block_Server/lib/dodai";
const { group_id, app_id, root_key } = require("config").dodai;
const dodaiConfig = require("config").dodai;
const BaseUrl = `${dodaiConfig.schema}://${dodaiConfig.host}`;
const rp: RequestPromiseAPI = require("request-promise");
import { OSType } from "ER_Proto_Block_Server/test_api/client/api";
import escapeStringRegexp = require("escape-string-regexp");
import sizeOf = require("image-size");
import moment from "moment";
import { OptionsWithUri, RequestPromiseAPI } from "request-promise";
import { DateUtil } from "../service/DateUtil";
import {
  AppletInfoType,
  AppletPublicStatusType,
  AppletStoreStatusDataType,
  AppletStoreStatusType,
  AppletType,
  AppletWholeInfoType,
  Block,
  DodaiEntityType,
  DodaiRequestHeader,
  DodaiResponseType,
  DownalodNumType as DownloadNumType,
  LikeNumType,
  TripletBlocks
} from "../type/type";
import * as riiiverdb from "user-session/riiiverdb";
import { copyFileSync } from "fs";
import { APPLET } from "user-session/riiiverdb";

const logger = require("../service/logUtil").logger;
const url = require("url");

const getAppletDatastoreList = [
  "appletstorestatus",
  "appletpublicstatus",
  "appletgoodnum",
  "appletmisc"
];

const getRegion = (req: any) => {
  return require('config').get('riiiverdb').REGION;
}

const getUser = (req: any) => {
  return req.res.locals.security.user
};

const wrap = async (proc: () => Promise<DodaiResponseType>) => {
  try {
    return await proc()
  } catch (e) {
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

const query = (ds: riiiverdb.DatastoreForRead, collection: string, query: any, key: string, opts?: any): Promise<DodaiResponseType> => {
  return wrap(async () => {
    let result = await ds.query(
      collection,
      query,
      Object.assign({}, opts || {}, { credential: key }));
    return { status: 200, body: result } as DodaiResponseType;
  });
};

const get = (ds: riiiverdb.DatastoreForRead, collection: string, id: string, key: string): Promise<DodaiResponseType> => {
  return wrap(async () => {
    let result = await ds.get(
      collection,
      id, {
      credential: key
    });
    if (result) {
      return { status: 200, body: result } as DodaiResponseType;
    } else {
      return { status: 404, body: {} } as DodaiResponseType;
    }
  });
};

const post = (ds: riiiverdb.DatastoreForWrite, collection: string, body: any, key: string): Promise<DodaiResponseType> => {
  return wrap(async () => {
    let result = await ds.post(
      collection,
      body, {
      credential: key
    });
    return { status: 201, body: result } as DodaiResponseType;
  });
}

const put = (ds: riiiverdb.DatastoreForWrite, collection: string, body: any, key: string, opts?: any): Promise<DodaiResponseType> => {
  return wrap(async () => {
    opts = Object.assign({ credential: key }, opts || {})
    let [result, status]: any[] = await ds.put(
      collection,
      body,
      opts);
    return { status: status, body: result } as DodaiResponseType;
  });
};

const delete_ = (ds: riiiverdb.DatastoreForWrite, collection: string, id: string, key: string): Promise<DodaiResponseType> => {
  return wrap(async () => {
    let result = await ds.delete_(
      collection,
      id, {
      credential: key
    });
    return { status: 204, body: result } as DodaiResponseType;
  });
};

const fileUpload = (ds: riiiverdb.DatastoreForWrite, collection: string, id: string, data: any, opts: any) => {
  return wrap(async () => {
    let result: any[] = await ds.fileUpload(
      collection,
      id,
      data,
      opts);
    return { status: result[1], body: result[0] } as DodaiResponseType;
  });
};

const writeResult = (res: any, val: any) => {
  if (val.body) {
    res.status(val.status).json(val.body);
  } else {
    res.status(val.status).end();
  }
};

/* tslint:disable:variable-name no-shadowed-variable */
const postAppletIcon = (req: any, res: any) => {
  return riiiverdb.forWrite(
    getUser(req),
    null,
    null,
    async (ds: riiiverdb.DatastoreForWrite) => {
      const _id = req.swagger.params.appletId.value;
      const file = req.swagger.params.image.value;

      let checkIcon = isValidAppletIconFile(file);
      if (!checkIcon.valid) {
        return {
          status: 400, body: {
            code: "400",
            error: "BadRequest",
            message: checkIcon.message
          }
        };
      }

      const dimention = sizeOf(file.buffer);
      const imgType = dimention.type;
      let imgMine = imgType;
      if (imgMine !== "png") {
        imgMine = "jpeg";
      }

      return get(ds, riiiverdb.APPLET, _id, req.res.locals.security.key).then(
        ({ status, body }: DodaiResponseType) => {
          if (status !== 200) {
            return { status: status, body: body };
          }
          return post(
            ds,
            riiiverdb.APPLET_ICON, {
            _id: _id,
            data: {}
          },
            req.res.locals.security.key
          ).then((post_responce: any) => {
            if (post_responce.status !== 201) {
              return { status: post_responce.status, body: post_responce.body }
            }
            return fileUpload(
              ds,
              riiiverdb.APPLET_ICON,
              _id,
              new Buffer(file.buffer, 'binary'),
              {
                credential: req.res.locals.security.key,
                contentType: `image/${imgMine}`,
                fileSize: file.buffer.byteLength,
                fileName: `${_id}.${imgType}`,
                cacheControl: 'public, max-age=3600',
                public: true,
              }).then((put_responce: any) => {
                if (put_responce.status !== 200) {
                  return { status: status, body: put_responce.body }
                }
                const putApplet = { _id: _id, data: body.data };
                const iconUrl = put_responce.body.publicUrl;
                putApplet.data.iconUrl = iconUrl;
                return put(
                  ds,
                  riiiverdb.APPLET,
                  putApplet,
                  req.res.locals.security.key
                ).then(({ status, body }: DodaiResponseType) => {
                  if (status !== 200) {
                    return { status: status, body: body };
                  } else {
                    return { status: 201, body: iconUrl };
                  }
                })
              });
          });
        });
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      let code = 400;
      if ('result' in e) {
        let result = e.result()
        if (result.errcode == 1002) {
          let m = result.body.code.match('([0-9]*)-([0-9]*)')
          if (m) {
            code = parseInt(m[1])
          }
        }
      }
      res.status(code).json(e);
    });
};

const increaseVerAppletIcon = (version: any) => {
  // Get the applet used the orignal block => incrase version
  const lastVerIndex = version.lastIndexOf(".");
  const lastVer = Number(
    version.slice(lastVerIndex + 1, version.length)
  );
  const newVer = `${version.slice(0, lastVerIndex)}.${lastVer + 1}`;

  return newVer;
};

const isValidAppletIconFile = (file: any) => {
  if (file.size === 0) {
    return { valid: false, message: "No image data." };
  }

  const dimention = sizeOf(file.buffer);
  if (dimention.type !== "png" && dimention.type !== "jpg") {
    return { valid: false, message: "Image is not a png or jpg." };
  }

  if (dimention.width !== dimention.height) {
    return { valid: false, message: "Image is not a square." };
  }
  return {
    valid: true
  }
}

const errorStatusCode = (e: any) => {
  let code = 400;
  if ('result' in e) {
    let result = e.result()
    if (result.errcode == 1002) {
      let m = result.body.code.match('([0-9]*)-([0-9]*)')
      if (m) {
        code = parseInt(m[1])
      }
    }
  }
  return code;
}

const putAppletIcon = (req: any, res: any) => {
  return riiiverdb.forWrite(
    getRegion(req),
    null,
    null,
    async (ds: riiiverdb.DatastoreForWrite) => {
      try {
        const _id = req.swagger.params.appletId.value;
        const file = req.swagger.params.image.value;
        let checkIcon = isValidAppletIconFile(file);
        if (!checkIcon.valid) {
          return {
            status: 400, body: {
              code: "400",
              error: "BadRequest",
              message: checkIcon.message
            }
          };
        }
        const dimention = sizeOf(file.buffer);
        const imgType = dimention.type;
        let imgMine = imgType;
        if (imgMine !== "png") {
          imgMine = "jpeg";
        }
        let rs_applet = await get(ds, riiiverdb.APPLET, _id, req.headers.authorization);
        if (rs_applet.status !== 200) {
          return { status: rs_applet.status, body: rs_applet.body };
        }

        let rs_applet_icon = await get(ds, riiiverdb.APPLET_ICON, _id, req.headers.authorization);
        if (Object.keys(rs_applet_icon.body).length === 0) {
          await post(ds, riiiverdb.APPLET_ICON, {
            _id: _id,
            data: {}
          },
            req.headers.authorization
          )
        }

        let rs_push_icon = await fileUpload(ds, riiiverdb.APPLET_ICON, _id,
          Buffer.from(file.buffer, 'binary'),
          {
            credential: req.headers.authorization,
            contentType: `image/${imgMine}`,
            fileSize: file.buffer.byteLength,
            fileName: `${_id}.${imgType}`,
            cacheControl: 'public, max-age=3600',
            public: true,
          }
        )
        if (rs_push_icon.status !== 200) {
          return { status: status, body: rs_push_icon.body }
        }

        rs_applet.body.data.version = increaseVerAppletIcon(rs_applet.body.data.version)
        const putApplet = { _id: _id, data: rs_applet.body.data };
        const iconUrl = rs_push_icon.body.publicUrl;
        putApplet.data.iconUrl = iconUrl;

        let rs_put_applet = await put(
          ds,
          riiiverdb.APPLET,
          putApplet,
          req.headers.authorization
        )

        if (rs_put_applet.status !== 200) {
          return { status: status, body: rs_put_applet.body };
        } else {
          return { status: 200, body: iconUrl };
        }
      }
      catch (e) {
        throw e;
      }
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      let code = errorStatusCode(e);
      res.status(code).json(e);
    });
}

const postApplet = (req: any, res: any) => {
  return riiiverdb.forWrite(
    getUser(req),
    null,
    null,
    (ds: riiiverdb.DatastoreForWrite) => {
      const reqBody = req.body;
      const publicStatus = reqBody.public;
      delete reqBody.public;
      if (typeof reqBody.templateType === "undefined") {
        return getBlocks(ds, reqBody.trigger, reqBody.service, reqBody.action)
          .then(validateWirings(reqBody.wirings))
          .then(() =>
            post(
              ds,
              riiiverdb.APPLET,
              { data: reqBody },
              res.locals.security.key
            )
          )
          .then(({ status, body }: DodaiResponseType) => {
            if (status === 201) {
              const storeStatusBody = {
                _id: body._id,
                data: { status: "waiting_review" }
              };
              const goodNumBody = { _id: body._id, data: { num: 0 } };
              const publicStatusBody = {
                _id: body._id,
                data: { status: publicStatus }
              };
              const downloadNumBody = {
                _id: body._id,
                data: { appletId: body._id, dlcnt: 0 }
              };
              return Promise.all([
                post(ds, riiiverdb.APPLET_GOODNUM, goodNumBody, root_key),
                post(ds,
                  riiiverdb.APPLET_STORE_STATUS,
                  storeStatusBody,
                  root_key
                ),
                post(ds,
                  riiiverdb.APPLET_PUBLIC_STATUS,
                  publicStatusBody,
                  root_key
                ),
                post(ds, riiiverdb.APPLET_MISC, downloadNumBody, root_key)
              ]).then(resultArray => {
                const failedStatus = resultArray.find(result => {
                  return result.status !== 201;
                });
                if (failedStatus === undefined) {
                  return { status: 201, body: fromDataEntity(body) };
                } else {
                  return { status: failedStatus.status, body: failedStatus.body };
                }
              });
            } else {
              return Promise.reject({ status, body });
            }
          })
          .catch(({ status, body }: DodaiResponseType) => {
            console.log('POST ERROR: ', status, body)
            return { status: status, body: body };
          });
      } else {
        return getTemplateBlocks(ds, reqBody.triggers, reqBody.services, reqBody.actions)
          .then(() =>
            post(
              ds,
              riiiverdb.APPLET,
              { data: reqBody },
              res.locals.security.key
            )
          )
          .then(({ status, body }: DodaiResponseType) => {
            if (status === 201) {
              const storeStatusBody = {
                _id: body._id,
                data: { status: "waiting_review" }
              };
              const goodNumBody = { _id: body._id, data: { num: 0 } };
              const publicStatusBody = {
                _id: body._id,
                data: { status: publicStatus }
              };
              return Promise.all([
                post(ds, riiiverdb.APPLET_GOODNUM, goodNumBody, root_key),
                post(ds, riiiverdb.APPLET_STORE_STATUS,
                  storeStatusBody,
                  root_key
                ),
                post(ds,
                  riiiverdb.APPLET_PUBLIC_STATUS,
                  publicStatusBody,
                  root_key
                )
              ]).then(resultArray => {
                const failedStatus = resultArray.find(result => {
                  return result.status !== 201;
                });
                if (failedStatus === undefined) {
                  return { status: 201, body: fromDataEntity(body) };
                } else {
                  return { status: failedStatus.status, body: failedStatus.body };
                }
              });
            } else {
              return Promise.reject({ status, body });
            }
          })
          .catch(({ status, body }) => {
            return { status: status, body: body }
          });
      }
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      console.log('POST ERROR CATCH: ', e)
      res.status(400).json(e);
    });
};

const putApplet = (req: any, res: any) => {
  return riiiverdb.forWrite(
    getUser(req),
    null,
    null,
    (ds: riiiverdb.DatastoreForWrite) => {
      const reqBody = req.body;
      const appletId = reqBody.appletId;
      const publicStatus = reqBody.public;
      delete reqBody.public;
      return getBlocks(ds, reqBody.trigger, reqBody.service, reqBody.action)
        .then(validateWirings(reqBody.wirings))
        .then(() =>
          put(
            ds,
            riiiverdb.APPLET,
            { _id: appletId, data: reqBody },
            res.locals.security.key, {
            updateOwner: true
          }
          )
        )
        .then(({ status, body }: DodaiResponseType) => {
          if (status === 200 || status === 201) {
            const publicStatusBody = { _id: appletId, data: { status: publicStatus } };
            return put(
              ds,
              riiiverdb.APPLET_PUBLIC_STATUS,
              publicStatusBody,
              root_key
            ).then((result: DodaiResponseType) => {
              if (result.status === 200) {
                return { status: 201, body: fromDataEntity(body) };
              } else {
                return { status: result.status, body: result.body };
              }
            });
          } else {
            return Promise.reject({ status, body });
          }
        })
        .catch(({ status, body }: DodaiResponseType) => {
          return { status: status, body: body }
        });
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const getBlocks = async (
  ds: riiiverdb.DatastoreForRead,
  triggerBlockId: string,
  serviceBlockId: string,
  actionBlockId: string
) => {
  const blockIds = [triggerBlockId, serviceBlockId, actionBlockId];
  const reqQuery = { query: { _id: { $in: blockIds } } };
  const { status, body }: DodaiResponseType = await query(
    ds,
    riiiverdb.BLOCK,
    reqQuery,
    root_key
  );
  if (status === 200) {
    if (body.length === 3) {
      return tripletToObject(
        body,
        triggerBlockId,
        serviceBlockId,
        actionBlockId
      );
    } else {
      const missingIds = missingBlockIds(body, blockIds);
      return Promise.reject(errors.BlocksNotFound(missingIds.join(", ")));
    }
  } else {
    return Promise.reject({ status, body });
  }
};

const getTemplateBlocks = async (
  ds: riiiverdb.DatastoreForRead,
  triggerBlockIds: string[],
  serviceBlockIds: string[],
  actionBlockIds: string[]
) => {
  const temp: string[] = [];
  const blockIds = temp.concat(
    ...[triggerBlockIds, serviceBlockIds, actionBlockIds]
  );
  const reqQuery = { query: JSON.stringify({ _id: { $in: blockIds } }) };
  const { status, body } = await query(
    ds,
    riiiverdb.BLOCK,
    reqQuery,
    root_key
  );
  if (status === 200) {
    if (body.length === blockIds.length) {
      return tripletToArrayObject(
        body,
        triggerBlockIds,
        serviceBlockIds,
        actionBlockIds
      );
    } else {
      const missingIds = missingBlockIds(body, blockIds);
      return Promise.reject(errors.BlocksNotFound(missingIds.join(", ")));
    }
  } else {
    return Promise.reject({ status, body });
  }
};

// Build dictionary of found blocks in the form of { trigger: [Block], service: [Block], action: [Block] }
const tripletToObject = (
  blockTriplet: any[], // block's json array whose legth is 3
  triggerBlockId: string,
  serviceBlockId: string,
  actionBlockId: string
): Promise<TripletBlocks> => {
  return new Promise((resolve, reject) => {
    const blocks: TripletBlocks = {
      action: undefined,
      trigger: undefined,
      service: undefined
    };
    blockTriplet.forEach(block => {
      switch (block._id) {
        case triggerBlockId:
          console.log('id: ', block._id, block.data.blockType, 'trigger')
          if (block.data.blockType !== "trigger") {
            reject(errors.InvalidBlockType(triggerBlockId, "trigger"));
          }
          blocks.trigger = block;
          break;
        case serviceBlockId:
          console.log('id: ', block._id, block.data.blockType, 'service')
          if (block.data.blockType !== "service") {
            reject(errors.InvalidBlockType(serviceBlockId, "service"));
          }
          blocks.service = block;
          break;
        case actionBlockId:
          console.log('id: ', block._id, block.data.blockType, 'action')
          if (block.data.blockType !== "action") {
            reject(errors.InvalidBlockType(actionBlockId, "action"));
          }
          blocks.action = block;
          break;
      }
    });
    resolve(blocks);
  });
};

const tripletToArrayObject = (
  blockTriplet: any[], // block's json array whose legth is 3
  triggerBlockIds: string[],
  serviceBlockIds: string[],
  actionBlockIds: string[]
) => {
  return new Promise((resolve, reject) => {
    const blocks: TripletBlocks = {
      action: undefined,
      trigger: undefined,
      service: undefined
    };
    blockTriplet.forEach(block => {
      let hitId;
      /* tslint:disable: no-conditional-assignment */
      if ((hitId = triggerBlockIds.find(_id => _id === block._id))) {
        if (block.data.blockType !== "trigger") {
          reject(errors.InvalidBlockType(hitId, "trigger"));
        }
        blocks.trigger = block;
      } else if ((hitId = serviceBlockIds.find(_id => _id === block._id))) {
        if (block.data.blockType !== "service") {
          reject(errors.InvalidBlockType(hitId, "service"));
        }
        blocks.service = block;
      } else if ((hitId = actionBlockIds.find(_id => _id === block._id))) {
        if (block.data.blockType !== "action") {
          reject(errors.InvalidBlockType(hitId, "action"));
        }
        blocks.action = block;
      } else {
        reject(errors.BlocksNotFound(block._id));
      }
      /* tslint:enable: no-conditional-assignment */
    });
    resolve(blocks);
  });
};

const missingBlockIds = (blocks: Block[], requestBlockIds: string[]) => {
  const foundIds = blocks.map(({ _id }) => _id);
  const findMissingReducer = (missingIds: string[], id: string) =>
    foundIds.includes(id) ? missingIds : [...missingIds, id];
  return requestBlockIds.reduce(findMissingReducer, []);
};

const validateWirings = (wirings: any) => ({
  trigger,
  service,
  action
}: {
  trigger: Block;
  service: Block;
  action: Block;
}) => {
  return Promise.all(
    Object.entries(wirings).map(kv =>
      validateWiring(trigger, service, action)(...kv)
    )
  );
};

const validateWiring = (trigger: Block, service: Block, action: Block) => (
  destBlockId: string,
  wiring: any
) => {
  switch (destBlockId) {
    case service._id:
      return validateWiringImpl(wiring, trigger, service);
    case action._id:
      return validateWiringImpl(wiring, service, action);
    default:
      return Promise.reject(errors.InvalidAppletWiringTarget);
  }
};

const validateWiringImpl = (wiring: any, srcBlock: Block, destBlock: Block) => {
  const required =
    (destBlock.data.input && destBlock.data.input.required) || [];
  return Promise.all(
    required.map(rejectIfRequiredPropertyMissing(wiring))
  ).then(validateWiringSources(wiring, srcBlock, destBlock));
};

const rejectIfRequiredPropertyMissing = (wiring: any) => (
  requiredProperty: string
) => {
  return wiring.hasOwnProperty(requiredProperty)
    ? Promise.resolve()
    : Promise.reject(errors.MissingRequiredProperty(requiredProperty));
};

const validateWiringSources = (
  wiring: any,
  srcBlock: Block,
  destBlock: Block
) => () => {
  const srcProperties = srcBlock.data.output && srcBlock.data.output.properties;
  const destProperties =
    destBlock.data.input && destBlock.data.input.properties;
  return Promise.all(
    // Object.entries(wiring).map(([destProperty, { id, property }]) => {
    Object.entries(wiring).map((eleArr: any[]) => {
      const [destProperty, { id, property }] = eleArr;
      return new Promise((resolve, reject) => {
        if (id !== srcBlock._id) {
          return reject(errors.SourceIsNotPreviousBlock(id, destBlock._id));
        } else if (!(srcProperties && srcProperties[property])) {
          return reject(errors.WiringSourceNotFound(property, id));
        } else if (!(destProperties && destProperties[destProperty])) {
          return reject(
            errors.WiringDestinationNotFound(destProperty, destBlock._id)
          );
        } else {
          const srcPropertySchema = srcProperties[property];
          const destPropertySchema = destProperties[destProperty];
          // Currently, only checks `type` and `format`, not `enum` and other options
          if (srcPropertySchema.type === destPropertySchema.type) {
            return resolve();
          } else {
            return reject(errors.WiringTypeMismatch(property, destProperty));
          }
        }
      });
    })
  );
};

const getMyAppletsBody = (
  ds: riiiverdb.DatastoreForRead,
  res: any,
  key: any,
  promiseArray: any[],
  callback: any,
  onlyAppletSuspend: boolean
) => {
  const reqQuery: any = {};
  if (onlyAppletSuspend) {
    reqQuery["data.AppletSuspend"] = { $exists: true };
  }

  promiseArray.unshift(
    query(ds, riiiverdb.APPLET, { query: reqQuery }, key)
  );
  return Promise.all(promiseArray).then(async resultArray => {
    const failedStatus = resultArray.find(result => {
      return result.status !== 200;
    });

    if (failedStatus === undefined) {
      // Exclude isDeleted applets
      let applets = getAppletWholeInfoList(resultArray);
      applets = applets.filter(applet => {
        return applet.appletInfo.storeStatus !== StoreStatus.deleted;
      });

      // callback
      return await callback(res, applets);
    } else {
      return { status: failedStatus.status, body: failedStatus.body };
    }
  });
};

const getMyAppletsBody2 = (
  ds: riiiverdb.DatastoreForRead,
  res: any,
  key: any,
  q: any,
  callback: any,
  onlyAppletSuspend: boolean
) => {
  if (onlyAppletSuspend) {
    q.applet = { "data.AppletSuspend": { $exists: true } };
  }

  let promiseArray = [
    query(ds, riiiverdb.APPLET, { query: q }, key, { multiple: true, fetch: ['appletgoodnum', 'appletmisc', 'appletpublicstatus', 'appletstorestatus'] })
  ];
  return Promise.all(promiseArray).then(async resultArray => {
    const failedStatus = resultArray.find(result => {
      return result.status !== 200;
    });

    if (failedStatus === undefined) {
      // Exclude isDeleted applets
      let r: any[] = [];
      let { status, body } = resultArray[0];
      r.push({ status: status, body: body.map((x: any) => x.applet || {}).filter((x: any) => x.data) });
      r.push({ status: status, body: body.map((x: any) => x.appletstorestatus || {}).filter((x: any) => x.data) });
      r.push({ status: status, body: body.map((x: any) => x.appletpublicstatus || {}).filter((x: any) => x.data) });
      r.push({ status: status, body: body.map((x: any) => x.appletgoodnum || {}).filter((x: any) => x.data) });
      r.push({ status: status, body: body.map((x: any) => x.appletmisc || {}).filter((x: any) => x.data) });
      let applets = getAppletWholeInfoList(r);
      applets = applets.filter(applet => {
        return applet.appletInfo.storeStatus !== StoreStatus.deleted;
      });

      // callback
      return await callback(res, applets);
    } else {
      return { status: failedStatus.status, body: failedStatus.body };
    }
  });
};

const retApplets = async (res: any, applets: any) => {
  // Send response
  return Promise.resolve({ status: 200, body: { applets: applets } })
};

const getMyApplets = (req: any, res: any) => {
  return riiiverdb.forRead(
    getUser(req),
    null,
    null,
    (ds: riiiverdb.DatastoreForRead) => {
      const q: any = {
        appletstorestatus: {},
        appletpublicstatus: {},
        appletgoodnum: {},
        appletmisc: {}
      };
      if (req.query.storeStatus) {
        q.appletstorestatus["data.status"] = req.query.storeStatus
      }
      if (req.query.publicStatus !== undefined) {
        let publicStatus = true;
        if (req.query.publicStatus === "false") {
          publicStatus = false;
        }
        q.appletpublicstatus["data.status"] = publicStatus
      }
      return getMyAppletsBody2(
        ds,
        res,
        req.res.locals.security.key,
        q,
        retApplets,
        false /* onlyAppletSuspend */
      );
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const listApplets = (req: any, res: any) => {
  return riiiverdb.forRead(
    getUser(req),
    null,
    null,
    (ds: riiiverdb.DatastoreForRead) => {
      return genericListApplets(ds, req, res, root_key);
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const listAdminApplets = (req: any, res: any) => {
  return riiiverdb.forRead(
    getRegion(req),
    null,
    null,
    (ds: riiiverdb.DatastoreForRead) => {
      return genericListApplets(ds, req, res, req.headers.authorization);
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const sortByReleaseDate = (applets: AppletWholeInfoType[]) => {
  const sortedApplets = applets.sort(
    (current: AppletWholeInfoType, next: AppletWholeInfoType) => {
      const gt = 1; // Great than
      const le = -1; // Less than
      let curt_utc_time = 0;
      let next_utc_time = 0;

      if (current.appletInfo.release) {
        curt_utc_time = moment.utc(current.appletInfo.release).unix();
      }

      if (next.appletInfo.release) {
        next_utc_time = moment.utc(next.appletInfo.release).unix();
      }

      if (Number(curt_utc_time) < Number(next_utc_time)) {
        return gt;
      }
      return le;
    }
  );

  return sortedApplets;
};

const sortByLikeNum = (applets: AppletWholeInfoType[]) => {
  const sortedApplets = applets.sort(
    (current: AppletWholeInfoType, next: AppletWholeInfoType) => {
      const gt = 1; // Great than
      const le = -1; // Less than
      if (
        Number(current.appletInfo.likeNum) < Number(next.appletInfo.likeNum)
      ) {
        return gt;
      }
      return le;
    }
  );

  return sortedApplets;
};

const doSort = (sortBy: string, applets: AppletWholeInfoType[]) => {
  switch (sortBy) {
    case "releaseDate":
      applets = sortByReleaseDate(applets);
      break;

    case "likeNum":
      applets = sortByLikeNum(applets);
      break;

    default:
      console.log(`sortBy ${sortBy} is not supported`);
      throw new Error(`sortBy ${sortBy} is not supported`);
  }
  return applets;
};

const genericListApplets = (ds: riiiverdb.DatastoreForRead, req: any, res: any, key: any): Promise<any> => {
  if (req.query.title && !req.query.lang) {
    return Promise.resolve({
      status: 400, body: {
        code: "400",
        error: "Bad Request",
        message: "lang query must be specified, when title query exists"
      }
    });
  }

  if (!req.query.sdkVersion && !req.query.minSdkVersion && !req.query.maxSdkVersion) {
    let sdkVersion = getSdkVersionFromHeader(req);
    if (sdkVersion) {
      req.query.maxSdkVersion = sdkVersion
    }
  }

  //const promiseArray = buildPromiseArray(ds, req.query);
  const reqQuery = buildReqQuery(req.query);
  const q: any = {
    applet: JSON.parse(reqQuery.query as string),
    appletstorestatus: {},
    appletpublicstatus: {},
    appletgoodnum: {},
    appletmisc: {}
  };
  if (req.query.storeStatus) {
    q.appletstorestatus["data.status"] = req.query.storeStatus
  }
  if (req.query.publicStatus !== undefined) {
    let publicStatus = true;
    if (req.query.publicStatus === "false") {
      publicStatus = false;
    }
    q.appletpublicstatus["data.status"] = publicStatus
  }

  let promiseArray: any[] = [];
  promiseArray.unshift(query(ds, riiiverdb.APPLET, { query: q }, key, { multiple: true, fetch: ['appletgoodnum', 'appletmisc', 'appletpublicstatus', 'appletstorestatus'] }));
  return Promise.all(promiseArray)
    .then(async resultArray => {
      const failedStatus = resultArray.find(result => {
        return result.status !== 200;
      });
      if (failedStatus === undefined) {
        let r: any[] = [];
        let { status, body } = resultArray[0];

        if ((req.query.maxSdkVersion || req.query.minSdkVersion) && body.length > 0) {
          let newBody: any[] = body.filter((e: any) => {
            if (e.applet.data.sdkVersion && ((!req.query.minSdkVersion || e.applet.data.sdkVersion.localeCompare(req.query.minSdkVersion, {}, { numeric: true }) === 1) &&
              (!req.query.maxSdkVersion || e.applet.data.sdkVersion.localeCompare(req.query.maxSdkVersion, {}, { numeric: true }) === -1))
            ) {
              return e;
            }
          })
          body = newBody;
        }

        r.push({ status: status, body: body.map((x: any) => x.applet).filter((x: any) => x.data) });
        r.push({ status: status, body: body.map((x: any) => x.appletstorestatus).filter((x: any) => x.data) });
        r.push({ status: status, body: body.map((x: any) => x.appletpublicstatus).filter((x: any) => x.data) });
        r.push({ status: status, body: body.map((x: any) => x.appletgoodnum).filter((x: any) => x.data) });
        r.push({ status: status, body: body.map((x: any) => x.appletmisc).filter((x: any) => x.data) });
        //	let r = resultArray;
        let retApplets = getAppletWholeInfoList(r);

        // Sort applets if needed
        if (req.query.sortBy) {
          retApplets = doSort(req.query.sortBy, retApplets);
        }

        // Add "limit" function if needed
        if (req.query.limit) {
          const limitContentNum = req.query.limit;
          const maxLength = retApplets.length;
          if (limitContentNum < maxLength && limitContentNum > 0) {
            retApplets = retApplets.slice(0, limitContentNum);
          } else if (limitContentNum <= 0) {
            retApplets = [];
          }
        }

        // for backword compability, convert RFC-1123 to ISO-8601
        retApplets = retApplets.map(applet => {
          const release = applet.appletInfo.release;
          applet.appletInfo.release = DateUtil.convertIso8601(release);
          return applet;
        });

        return {
          status: 200, body: {
            applets: retApplets
          }
        };
      } else {
        return { status: failedStatus.status, body: failedStatus.body };
      }
    })
    .catch(error => {
      // For invalid sortBy value
      return { status: 400, body: JSON.stringify(error.message) };
    });
};

const getAppletWholeInfoList = (
  resultArray: DodaiResponseType[]
): AppletWholeInfoType[] => {
  const appletWholeInfoList: AppletWholeInfoType[] = [];
  if (
    resultArray.find(list => {
      return list.body.length === 0;
    }) !== undefined
  ) {
    return appletWholeInfoList;
  }
  let arrayIndex = 0;
  const appletList: AppletType[] = resultArray[arrayIndex++].body;
  let storeStatusList: AppletStoreStatusType[] = [];
  let publicStatusList: AppletPublicStatusType[] = [];
  let likeNumList: LikeNumType[] = [];
  let downloadNumList: DownloadNumType[] = [];

  storeStatusList = storeStatusList.concat(resultArray[arrayIndex++].body);
  publicStatusList = publicStatusList.concat(resultArray[arrayIndex++].body);
  likeNumList = likeNumList.concat(resultArray[arrayIndex++].body);
  downloadNumList = downloadNumList.concat(resultArray[arrayIndex++].body);

  appletList.forEach(applet => {
    const storeStatus = storeStatusList.find(storeStatus => {
      return storeStatus._id === applet._id;
    });
    const publicStatus = publicStatusList.find(publicStatus => {
      return publicStatus._id === applet._id;
    });
    const likeNum = likeNumList.find(likeNum => {
      return likeNum._id === applet._id;
    });
    const downloadNum = downloadNumList.find(downloadNum => {
      return downloadNum.data.appletId === applet._id;
    });

    if (storeStatus !== undefined && publicStatus !== undefined) {
      appletWholeInfoList.push(
        buildAppletWholeInfo(
          applet,
          buildAppletInfo(
            applet,
            storeStatus,
            publicStatus,
            likeNum,
            downloadNum
          )
        )
      );
    }
  });
  return appletWholeInfoList;
};

const buildAppletInfo = (
  applet: AppletType,
  storeStatus: AppletStoreStatusType,
  publicStatus: AppletPublicStatusType,
  likeNum: LikeNumType | undefined,
  downloadNum: DownloadNumType | undefined
): AppletInfoType => {
  const storeStatusString = storeStatus.data.status;
  const isRelease = storeStatus.data.release;
  const publicStatusFlg = publicStatus.data.status;
  const dlcnt = typeof downloadNum !== "undefined" ? downloadNum.data.dlcnt : 0;
  const lkcnt = typeof likeNum !== "undefined" ? likeNum.data.num : 0;

  const info: AppletInfoType = {
    id: applet._id,
    ownerId: applet.owner,
    likeNum: lkcnt,
    downloadNum: dlcnt,
    publicStatus: publicStatusFlg,
    storeStatus: storeStatusString,
    submitDate: applet.createdAt
  };
  let releaseString = "";
  if (storeStatusString === "published" && isRelease) {
    releaseString = isRelease;
    info.release = releaseString;
  }
  return info;
};

const buildAppletWholeInfo = (
  applet: AppletType,
  appletInfo: AppletInfoType
): AppletWholeInfoType => {
  return {
    id: applet._id,
    applet: fromDataEntity(applet),
    appletInfo: appletInfo
  };
};

const buildPromiseArray = (ds: riiiverdb.DatastoreForRead, query_: any) => {
  const promiseArray = [];
  const storeStatusQuery: any = {};
  if (query_.storeStatus) {
    storeStatusQuery.query = JSON.stringify({
      "data.status": query_.storeStatus
    });
  }

  promiseArray.push(
    query(ds, riiiverdb.APPLET_STORE_STATUS, storeStatusQuery, root_key)
  );

  let publicStatusQuery: any = {};
  if (query_.publicStatus !== undefined) {
    let publicStatus = true;
    if (query_.publicStatus === "false") {
      publicStatus = false;
    }

    publicStatusQuery = {
      query: JSON.stringify({ "data.status": publicStatus })
    };
  }

  promiseArray.push(
    query(ds, riiiverdb.APPLET_PUBLIC_STATUS, publicStatusQuery, root_key)
  );

  promiseArray.push(query(ds, riiiverdb.APPLET_GOODNUM, {}, root_key));
  promiseArray.push(query(ds, riiiverdb.APPLET_MISC, {}, root_key));
  return promiseArray;
};

const createStringArray = (query: any) => {
  let res: string[] = [];
  if (!Array.isArray(query)) {
    res = [query];
  } else {
    res = query;
  }
  return res;
};

const getSdkVersionFromHeader = (req: any) => {
  let user_agent = req.headers["user-agent"];
  let regex = /RiiiverSDK\/(\d+.\d+.\d+)/g;
  let rs = regex.exec(user_agent);
  if (!rs) {
    return undefined
  } else {
    return rs[1];
  }
}

/* tslint:disable: no-string-literal */
const buildReqQuery = (query: any) => {
  const reqQuery: any = {};
  if (typeof query.personalUseFlg !== "undefined") {
    if (query.personalUseFlg === "true") {
      reqQuery["data.personalUseFlg"] = { $eq: true };
    } else {
      reqQuery["data.personalUseFlg"] = { $ne: true };
    }
  }
  if (query.appletId) {
    const appletId = createStringArray(query.appletId);
    reqQuery["_id"] = { $in: appletId };
  }
  if (query.excludeAppletId) {
    const excludeAppletId = createStringArray(query.excludeAppletId);
    reqQuery["data.excludeAppletId"] = { $nin: excludeAppletId };
  }
  if (query.toolId) {
    const toolId = createStringArray(query.toolId);
    reqQuery["data.toolIds"] = { $in: toolId };
  }
  if (query.categoryId) {
    const categoryId = createStringArray(query.categoryId);
    reqQuery["data.categoryIds"] = { $in: categoryId };
  }
  if (query.deviceId) {
    const deviceId = createStringArray(query.deviceId);
    reqQuery["data.deviceId"] = { $in: deviceId };
  }
  if (query.vendorId) {
    reqQuery["data.vendorId"] = query.vendorId;
  }
  if (query.version) {
    reqQuery["data.version"] = { $gte: query.version };
  }
  if (query.ownerId) {
    const ownerId = createStringArray(query.ownerId);
    reqQuery["owner"] = { $in: ownerId };
  }
  if (query.title && query.lang) {
    const escapedString = escapeStringRegexp(query.title);
    reqQuery[`data.title.${query.lang}`] = { $regex: `.*${escapedString}.*` };
  }
  if (query.osType && query.osType !== OSType.OSTypeEnum.none) {
    reqQuery["data.osType"] = { $in: [query.osType, OSType.OSTypeEnum.none] };
  }
  if (typeof query.suspendFlg !== "undefined") {
    // Default: false case => one of items has true then the applet is not fit
    let suspendOperator = "$nor";

    // Operator for true case
    if (query.suspendFlg === "true") {
      suspendOperator = "$or";
    }

    reqQuery[`${suspendOperator}`] = [
      { "data.AppletSuspend.device.deviceSuspendFlg": true },
      { "data.AppletSuspend.service.blockSuspendFlg": true },
      { "data.AppletSuspend.trigger.blockSuspendFlg": true },
      { "data.AppletSuspend.action.blockSuspendFlg": true }
    ];
  }

  reqQuery["data.sdkVersion"] = {}

  if (query.sdkVersion) {
    reqQuery["data.sdkVersion"]['$eq'] = query.sdkVersion;
  }

  if (Object.keys(reqQuery).length === 0) {
    return {};
  } else {
    return { query: JSON.stringify(reqQuery) };
  }
};
/* tslint:enable: no-string-literal */

const fromDataEntity = ({ _id, data }: DodaiEntityType) =>
  Object.assign({}, data, { id: _id });

const getApplet = (req: any, res: any) => {
  return riiiverdb.forRead(
    getUser(req),
    null,
    null,
    (ds: riiiverdb.DatastoreForRead) => {
      let id = req.swagger.params.id.value;
      const osType = req.query.osType;
      const deviceId = req.swagger.params.deviceId.value;
      return get(ds, riiiverdb.APPLET_COPY, id, root_key).then(
        ({ status, body }: DodaiResponseType) => {
          if (status == 200) {
            id = body.appletId;
          }
          return get(ds, riiiverdb.APPLET, id, root_key);
        }).then(
          ({ status, body }: DodaiResponseType) => {
            if (status === 200) {
              // Is device Id match?
              if (deviceId !== undefined) {
                const retVal = deviceId.some((elm: string) => {
                  return elm === body.data.deviceId;
                });
                if (!retVal) {
                  return {
                    status: 404, body: {
                      code: "404-04",
                      error: "ResourceNotFound",
                      message: "The resource does not exist in the database."
                    }
                  };
                }
              }

              // Is osType match?
              if (osType !== undefined && osType !== OSType.OSTypeEnum.none) {
                if (
                  osType !== body.data.osType &&
                  body.data.osType !== OSType.OSTypeEnum.none
                ) {
                  return {
                    status: 404, body: {
                      code: "404-04",
                      error: "ResourceNotFound",
                      message: "The resource does not exist in the database."
                    }
                  };
                }
              }

              // All set, return the result
              body._id = req.swagger.params.id.value;
              return { status: 200, body: fromDataEntity(body) };
            } else {
              return { status: status, body: body };
            }
          }
        );
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const deleteApplet = (req: any, res: any) => {
  return riiiverdb.forWrite(
    getUser(req),
    null,
    null,
    async (ds: riiiverdb.DatastoreForWrite) => {
      const appletId = req.swagger.params.id.value;
      //const isDeleted = { isDeleted: true };
      //const reqBody = { data: { $set: isDeleted } };

      // Get the AppletStoreStatus
      let ret = await get(ds, riiiverdb.APPLET_STORE_STATUS, appletId, root_key);
      let body = ret.body;
      let status = ret.status;
      if (status == 200) {
        let user = getUser(req);
        if (body.owner != user.dodaiUserId) {
          return {
            status: 404, body: {
              code: "404-04",
              error: "ResourceNotFound",
              message: "The resource does not exist in the database. "
            }
          };
        }
      }
      if (status != 200) {
        return { status: status, body: body }
      } else if (body.data.status === "deleted") {
        // storeStatus is deleted, do noting.
        return { status: 204, body: body.data };
      } else if (
        body.data.status === "published" ||
        body.data.status === "waiting_review" ||
        body.data.status === "testing"
      ) {
        // storeStatus is piblished, change storeStatusto deleted.
        const data: AppletStoreStatusDataType = {
          status: StoreStatus.deleted
        };
        if (typeof body.data.message !== "undefined") {
          data.message = body.data.message;
        }
        const reqBody = { _id: appletId, data: data };

        ret = await put(
          ds,
          riiiverdb.APPLET_STORE_STATUS,
          reqBody,
          root_key,
          { upsert: true }
        );
        status = ret.status;
        if (status === 200 || status === 201) {
          return { status: 204, body: ret.body.data };
        } else {
          return { status: status, body: ret.body };
        }
      } else if (
        body.data.status === "rejected"
      ) {
        // storeStatus is rejected or waiting_review, delete the data in database.
        ret = await delete_(
          ds,
          riiiverdb.APPLET,
          appletId,
          req.res.locals.security.key
        );
        status = ret.status;
        if (status >= 200 && status < 300) {
          return { status: 204 };
        } else {
          return { status: status, body: body };
        }
      } else {
        return { status: status, body: body };
      }
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(204).end();
    });
};

const getAppletGoodNum = (req: any, res: any) => {
  return riiiverdb.forRead(
    getUser(req),
    null,
    null,
    (ds: riiiverdb.DatastoreForRead) => {
      const appletId = req.swagger.params.appletId.value;
      return get(ds, riiiverdb.APPLET_GOODNUM, appletId, root_key).then(
        ({ status, body }: DodaiResponseType) => {
          if (status === 200) {
            return { status: 200, body: body.data };
          } else {
            return { status: status, body: body };
          }
        }
      );
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const postAppletGoodNum = (req: any, res: any) => {
  return riiiverdb.forWrite(
    getUser(req),
    null,
    null,
    (ds: riiiverdb.DatastoreForWrite) => {
      const appletId = req.body.appletId;
      return get(ds, riiiverdb.APPLET, appletId, root_key).then(
        ({ status, body }: DodaiResponseType) => {
          if (status === 200) {
            let num = req.body.num;
            if (typeof num === "undefined") {
              num = 0;
            }
            const data = { num: num };
            const reqBody = { _id: appletId, data: data };
            post(ds, riiiverdb.APPLET_GOODNUM, reqBody, root_key).then(
              ({ status, body }: DodaiResponseType) => {
                if (status === 201) {
                  res.status(201).json(body.data);
                } else {
                  res.status(status).json(body);
                }
              }
            );
          } else {
            res.status(status).json(body);
          }
        }
      );
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const getAppletPublicStatus = (req: any, res: any) => {
  return riiiverdb.forRead(
    getUser(req),
    null,
    null,
    (ds: riiiverdb.DatastoreForRead) => {
      const appletId: string = req.swagger.params.appletId.value;
      return get(ds, riiiverdb.APPLET_PUBLIC_STATUS, appletId, root_key).then(
        ({ status, body }: DodaiResponseType) => {
          if (status === 200) {
            res.status(200).json(body.data);
          } else {
            res.status(status).json(body);
          }
        }
      );
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const postAppletPublicStatus = (req: any, res: any) => {
  return riiiverdb.forWrite(
    getUser(req),
    null,
    null,
    (ds: riiiverdb.DatastoreForWrite) => {
      const appletId: string = req.body.appletId;
      return get(ds, riiiverdb.APPLET, appletId, root_key).then(
        ({ status, body }: DodaiResponseType) => {
          if (status === 200) {
            let publicStatus = req.body.status;
            if (typeof publicStatus === "undefined") {
              publicStatus = true;
            }
            const data = { status: publicStatus };
            const reqBody = { _id: appletId, data: data };
            post(ds, riiiverdb.APPLET_PUBLIC_STATUS, reqBody, root_key).then(
              ({ status, body }: DodaiResponseType) => {
                if (status === 201) {
                  return { status: 201, body: body.data };
                } else {
                  return { status: status, body: body };
                }
              }
            );
          } else {
            return { status: status, body: body };
          }
        }
      );
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const putAppletPublicStatus = (req: any, res: any) => {
  return riiiverdb.forWrite(
    getUser(req),
    null,
    null,
    (ds: riiiverdb.DatastoreForWrite) => {
      const appletId: string = req.body.appletId;
      const publicStatus: boolean = req.body.status;
      const data = { status: publicStatus };
      const reqBody = { _id: appletId, data: data };
      return get(ds, riiiverdb.APPLET_PUBLIC_STATUS, appletId, root_key).then(
        ({ status, body }: DodaiResponseType) => {
          if (status === 200) {
            return put(
              ds,
              riiiverdb.APPLET_PUBLIC_STATUS,
              reqBody,
              root_key,
              { upsert: true }
            ).then(({ status, body }: DodaiResponseType) => {
              if (status === 200 || status === 201) {
                return { status: 201, body: body.data };
              } else {
                return { status: status, body: body };
              }
            });
          } else {
            return { status: status, body: body };
          }
        }
      );
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const StoreStatus = {
  published: "published",
  waiting_review: "waiting_review",
  rejected: "rejected",
  deleted: "deleted"
};

const getAppletStoreStatus = (req: any, res: any) => {
  return riiiverdb.forRead(
    getRegion(req),
    null,
    null,
    (ds: riiiverdb.DatastoreForRead) => {
      const appletId = req.swagger.params.appletId.value;
      return get(
        ds,
        riiiverdb.APPLET_STORE_STATUS,
        appletId,
        req.headers.authorization
      ).then(({ status, body }: DodaiResponseType) => {
        if (status === 200) {
          return { status: 200, body: body.data };
        } else {
          return { status: status, body: body };
        }
      });
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const postAppletStoreStatus = (req: any, res: any) => {
  req.headers.authorization = root_key;
  putAppletStoreStatus(req, res);
};

// This function include post as well
const putAppletStoreStatus = (req: any, res: any) => {
  return riiiverdb.forWrite(
    getRegion(req),
    null,
    null,
    (ds: riiiverdb.DatastoreForWrite) => {
      const appletId: string = req.body.appletId;
      const storeStatus: string = req.body.status;
      const message: string = req.body.message;
      const key: string = req.headers.authorization;

      if (storeStatus === StoreStatus.rejected && !message) {
        return Promise.resolve({
          status: 400, body: {
            code: "400-06",
            error: "BadRequest",
            message: "message is required when status is rejected."
          }
        });
      }

      return get(ds, riiiverdb.APPLET, appletId, key).then(
        ({ status, body }: DodaiResponseType) => {
          if (status === 200) {
            const data: AppletStoreStatusDataType = { status: storeStatus };
            if (typeof message !== "undefined") {
              data.message = message;
            }

            // Add release time if status is 'published'
            if (data.status === "published") {
              data.release = DateUtil.getCurrentIso8601Time();
            }

            // upsert means dodai can create a new item if put failed
            const reqBody = { _id: appletId, data: data };
            return put(
              ds,
              riiiverdb.APPLET_STORE_STATUS,
              reqBody,
              key,
              { upsert: true }
            ).then(({ status, body }: DodaiResponseType) => {
              if (status === 200 || status === 201) {
                return { status: 201, body: body.data };
              } else {
                return { status: status, body: body };
              }
            });
          } else {
            return { status: status, body: body };
          }
        }
      );
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const getAppletDownloadNum = (req: any, res: any) => {
  return riiiverdb.forRead(
    getUser(req),
    null,
    null,
    async (ds: riiiverdb.DatastoreForRead) => {
      const appletId = req.swagger.params.appletId.value;
      let ret = await get(ds, riiiverdb.APPLET_MISC, appletId, root_key);
      let status = ret.status;
      let body = ret.body;
      if (status === 200) {
        const data = {
          appletId: body.data.appletId,
          num: body.data.dlcnt
        };
        return { status: status, body: data };
      } else {
        return { status: status, body: body };
      }
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const errors = {
  BlocksNotFound: (notFoundBlocks: string) => {
    return {
      status: 404,
      body: {
        code: "404-50",
        error: "BlocksNotFound",
        message: `Blocks not found: ${notFoundBlocks}`
      }
    };
  },
  InvalidAppletWiringTarget: {
    status: 400,
    body: {
      code: "400-50",
      error: "InvalidAppletWiringTarget",
      message: "Trigger block cannot become wiring target."
    }
  },
  InvalidBlockType: (id: string, blockType: string) => {
    return {
      status: 400,
      body: {
        code: "400-51",
        error: "InvalidBlockType",
        message: `Block type of '${id}' is not equal to '${blockType}'`
      }
    };
  },
  MissingRequiredProperty: (requiredProperty: string) => {
    return {
      status: 400,
      body: {
        code: "400-52",
        error: "MissingRequiredProperty",
        message: `Required property is missing: ${requiredProperty}`
      }
    };
  },
  SourceIsNotPreviousBlock: (srcBlockId: string, destBlockId: string) => {
    return {
      status: 400,
      body: {
        code: "400-53",
        error: "SourceIsNotPreviousBlock",
        message: `'${srcBlockId}' is not a previous block of '${destBlockId}'`
      }
    };
  },
  WiringTypeMismatch: (srcPropertyName: string, destPropertyName: string) => {
    return {
      status: 400,
      body: {
        code: "400-54",
        error: "WiringTypeMismatch",
        message: `'${srcPropertyName}' does not match for the data type of '${destPropertyName}'`
      }
    };
  },
  WiringSourceNotFound: (srcPropertyName: string, srcBlockId: string) => {
    return {
      status: 400,
      body: {
        code: "400-55",
        error: "WiringSourceNotFound",
        message: `'${srcPropertyName}' does not exist in output of '${srcBlockId}'`
      }
    };
  },
  WiringDestinationNotFound: (
    destPropertyName: string,
    destBlockId: string
  ) => {
    return {
      status: 400,
      body: {
        code: "400-56",
        error: "WiringDestinationNotFound",
        message: `'${destPropertyName}' does not exist in output of '${destBlockId}'`
      }
    };
  }
};

const composeAppletSuspend = (req: any) => {
  const reqBody = req.body;
  const retAppletSuspend = {
    deviceId: reqBody.deviceId,
    deviceSuspendFlg: reqBody.deviceSuspendFlg,
    deviceSuspendCode: undefined
  };

  if (reqBody.deviceSuspendCode) {
    retAppletSuspend.deviceSuspendCode = reqBody.deviceSuspendCode;
  }

  return retAppletSuspend;
};

const applyAppletsWithCallback = async (
  ds: riiiverdb.DatastoreForWrite,
  deviceId: string,
  callback: any,
  args: any
) => {
  const updateOK = true;
  const reqQuery: any = {};
  reqQuery["data.deviceId"] = deviceId;
  let ret = await query(
    ds,
    riiiverdb.APPLET,
    { query: reqQuery },
    root_key
  );
  let applets = ret.body;

  let i = 0;
  // Need to change version for ALL applets if they use the orginal block
  for (i = 0; i < applets.length; i++) {
    const applet = applets[i];
    let appletBody = applet.data;

    // Run callback to update applet contents
    appletBody = callback(appletBody, args);

    // Wrtite back to applet
    const { status, body } = await put(
      ds,
      riiiverdb.APPLET,
      { _id: applet._id, data: appletBody },
      root_key
    );

    if (status !== 200 && status !== 201) {
      logger.system.error("Fail to apply a applet");
      logger.system.error(JSON.stringify(body));
      return !updateOK;
    }
  }
  return updateOK;
};

const appletChangeCallback = (applet: any, args: any) => {
  const appletSuspend = composeAppletSuspend(args);
  if (applet.AppletSuspend) {
    applet.AppletSuspend.device = appletSuspend;
  } else {
    applet.AppletSuspend = { device: appletSuspend };
  }
  return applet;
};

const putAdminAppletSuspend = (req: any, res: any) => {
  return riiiverdb.forWrite(
    getRegion(req),
    null,
    null,
    async (ds: riiiverdb.DatastoreForWrite) => {
      if (req.body.deviceSuspendFlg && !req.body.deviceSuspendCode) {
        return {
          status: 400, body: {
            code: "400-06",
            error: "BadRequest",
            message: "Must have deviceSuspendCode if deviceSuspendFlg is true"
          }
        };
      }
      let canProceed = await applyAppletsWithCallback(
        ds,
        req.body.deviceId,
        appletChangeCallback,
        req
      );
      if (canProceed) {
        return { status: 201, body: {} };
      } else {
        return {
          status: 400, body: {
            code: "400-06",
            error: "BadRequest",
            message: "putAdminAppletSuspend fail"
          }
        };
      }
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const isAppletSuspended = (applet: any) => {
  const checkItems = ["action", "device", "service", "trigger"];
  let i = 0;
  let checkItem = "";

  if (!applet.applet.AppletSuspend) {
    return false;
  }

  for (i = 0; i < checkItems.length; i++) {
    checkItem = checkItems[i];

    try {
      if (applet.applet.AppletSuspend[checkItem]) {
        if (applet.applet.AppletSuspend[checkItem].deviceSuspendFlg) {
          return applet.applet.AppletSuspend[checkItem].deviceSuspendFlg;
        } else if (applet.applet.AppletSuspend[checkItem].blockSuspendFlg) {
          return applet.applet.AppletSuspend[checkItem].blockSuspendFlg;
        } else {
          /*
                    logger.system.error(
                      `${JSON.stringify(applet.applet.AppletSuspend[checkItem])} is false`
                    );
          */
          continue;
        }
      }
    } catch (e) {
      logger.system.error(JSON.stringify(e));
      return false;
    }
  }
  return false;
};

const getSuspendApplets = (res: any, applets: any[]) => {
  const suspendAppletsInfo = applets.filter(applet => {
    return isAppletSuspended(applet);
  });
  const suspendApplets: any[] = [];
  suspendAppletsInfo.forEach(appletInfo => {
    const applet = appletInfo.applet;
    const suspendApplet = { id: applet.id, ...applet.AppletSuspend };
    suspendApplets.push(suspendApplet);
  });

  // Send response
  if (suspendApplets.length) {
    return Promise.resolve({
      status: 200,
      body: { AppletSuspend: suspendApplets }
    })
  } else {
    return Promise.resolve({
      status: 200,
      body: { AppletSuspend: [] }
    })
  }
};

const getSuspendedApplets = (req: any, res: any) => {
  return riiiverdb.forRead(
    getUser(req),
    null,
    null,
    (ds: riiiverdb.DatastoreForRead) => {
      //const promiseArray = buildPromiseArray(ds, {});
      const q: any = {
        appletstorestatus: {},
        appletpublicstatus: {},
        appletgoodnum: {},
        appletmisc: {}
      };
      return getMyAppletsBody2(
        ds,
        res,
        req.res.locals.security.key,
        q,
        getSuspendApplets,
        true /* onlyAppletSuspend */
      );
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const putAdminPersonalUseFlg = (req: any, res: any) => {
  putAdminPersonalUseFlgImpl(req, res);
};

const putAdminPersonalUseFlgImpl = (req: any, res: any) => {
  return riiiverdb.forWrite(
    getRegion(req),
    null,
    null,
    async (ds: riiiverdb.DatastoreForWrite) => {
      const reqKey = req.headers.authorization;
      const appletId: string = req.body.appletId;
      const personalUseFlg: boolean = req.body.personalUseFlg;

      const reqBody = {
        _id: appletId,
        $set: { '$.personalUseFlg': personalUseFlg }
      };
      try {
        const getApplet = await get(ds,riiiverdb.APPLET_STORE_STATUS,appletId,reqKey)
        if(getApplet.body.data.status =='deleted'){
          return { status: 404, body: {} };
        }
        const { status, body }: DodaiResponseType = await put(
          ds,
          riiiverdb.APPLET,
          reqBody,
          reqKey
        );
        if (status >= 200 && status < 300) {
          return { status: 201, body: {} };
        }
        return { status: status, body: body };
      } catch (e) {
        return { status: 500, body: e }
      }
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const getAppletCopy = (req: any, res: any) => {
  return riiiverdb.forRead(
    getUser(req),
    null,
    null,
    async (ds: riiiverdb.DatastoreForRead) => {
      const preferenceId = req.swagger.params.userPreferenceId.value;
      const { status, body }: DodaiResponseType = await query(
        ds, riiiverdb.APPLET_COPY, {
        query: {
          userPreferenceId: preferenceId
        }
      },
        req.res.locals.security.key);
      if (status === 200) {
        return {
          status: 200,
          body: { applet_copy_id: body._id }
        };
      } else {
        return { status: status, body: body };
      }
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const postAppletCopy = (req: any, res: any) => {
  return riiiverdb.forWrite(
    getRegion(req),
    null,
    null,
    async (ds: riiiverdb.DatastoreForWrite) => {
      const reqBody = req.swagger.params.body.value;
      const checkResults: DodaiResponseType[] = await Promise.all([
        get(ds, riiiverdb.APPLET, reqBody.appletId, root_key),
        get(ds, riiiverdb.USER_PREFERENCE, reqBody.userPreferenceId, root_key)
      ]);
      if (checkResults[0].status !== 200) {
        return { status: 404, body: { code: '404-01', message: 'invalid parameters: appletId' } }
      }
      if (checkResults[1].status !== 200) {
        return { status: 404, body: { code: '404-01', message: 'invalid parameters: userPreferenceId' } }
      }
      const { status, body }: DodaiResponseType = await post(
        ds, riiiverdb.APPLET_COPY, {
        owner: reqBody.userId,
        appletId: reqBody.appletId,
        userPreferenceId: reqBody.userPreferenceId,
        data: {}
      },
        root_key);
      if (status === 200 || status == 201) {
        return { status: 201, body: { applet_copy_id: body._id } };
      } else {
        return { status: status, body: body };
      }
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

const deleteAppletCopy = (req: any, res: any) => {
  return riiiverdb.forWrite(
    getRegion(req),
    null,
    null,
    async (ds: riiiverdb.DatastoreForWrite) => {
      const appletCopyId = req.swagger.params.applet_copy_id.value;
      const { status, body }: DodaiResponseType = await delete_(
        ds, riiiverdb.APPLET_COPY,
        appletCopyId,
        root_key);
      if (status == 204) {
        return { status: 204, body: { applet_copy_id: appletCopyId } };
      } else {
        return { status: status, body: body };
      }
    }).then((ret: any) => {
      writeResult(res, ret);
    }).catch((e: any) => {
      res.status(400).json(e);
    });
};

module.exports = {
  postApplet,
  putApplet,
  listApplets,
  listAdminApplets,
  getMyApplets,
  getApplet,
  deleteApplet,
  postAppletIcon,
  putAppletIcon,
  getAppletGoodNum,
  getAppletDownloadNum,
  getSuspendedApplets,
  postAppletGoodNum,
  getAppletPublicStatus,
  postAppletPublicStatus,
  putAppletPublicStatus,
  getAppletStoreStatus,
  postAppletStoreStatus,
  putAppletStoreStatus,
  putAdminAppletSuspend,
  putAdminPersonalUseFlg,
  getAppletCopy,
  postAppletCopy,
  deleteAppletCopy
};
