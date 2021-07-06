"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
//import { delete_, get, post, put } from "ER_Proto_Block_Server/lib/dodai";
const { group_id, app_id, root_key } = require("config").dodai;
const dodaiConfig = require("config").dodai;
const BaseUrl = `${dodaiConfig.schema}://${dodaiConfig.host}`;
const rp = require("request-promise");
const api_1 = require("ER_Proto_Block_Server/test_api/client/api");
const escapeStringRegexp = require("escape-string-regexp");
const sizeOf = require("image-size");
const moment_1 = __importDefault(require("moment"));
const DateUtil_1 = require("../service/DateUtil");
const riiiverdb = __importStar(require("user-session/riiiverdb"));
const logger = require("../service/logUtil").logger;
const url = require("url");
const getAppletDatastoreList = [
    "appletstorestatus",
    "appletpublicstatus",
    "appletgoodnum",
    "appletmisc"
];
const getRegion = (req) => {
    return require('config').get('riiiverdb').REGION;
};
const getUser = (req) => {
    return req.res.locals.security.user;
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
const query = (ds, collection, query, key, opts) => {
    return wrap(async () => {
        let result = await ds.query(collection, query, Object.assign({}, opts || {}, { credential: key }));
        return { status: 200, body: result };
    });
};
const get = (ds, collection, id, key) => {
    return wrap(async () => {
        let result = await ds.get(collection, id, {
            credential: key
        });
        if (result) {
            return { status: 200, body: result };
        }
        else {
            return { status: 404, body: {} };
        }
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
const put = (ds, collection, body, key, opts) => {
    return wrap(async () => {
        opts = Object.assign({ credential: key }, opts || {});
        let [result, status] = await ds.put(collection, body, opts);
        return { status: status, body: result };
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
const fileUpload = (ds, collection, id, data, opts) => {
    return wrap(async () => {
        let result = await ds.fileUpload(collection, id, data, opts);
        return { status: result[1], body: result[0] };
    });
};
const writeResult = (res, val) => {
    if (val.body) {
        res.status(val.status).json(val.body);
    }
    else {
        res.status(val.status).end();
    }
};
/* tslint:disable:variable-name no-shadowed-variable */
const postAppletIcon = (req, res) => {
    return riiiverdb.forWrite(getUser(req), null, null, async (ds) => {
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
        return get(ds, riiiverdb.APPLET, _id, req.res.locals.security.key).then(({ status, body }) => {
            if (status !== 200) {
                return { status: status, body: body };
            }
            return post(ds, riiiverdb.APPLET_ICON, {
                _id: _id,
                data: {}
            }, req.res.locals.security.key).then((post_responce) => {
                if (post_responce.status !== 201) {
                    return { status: post_responce.status, body: post_responce.body };
                }
                return fileUpload(ds, riiiverdb.APPLET_ICON, _id, new Buffer(file.buffer, 'binary'), {
                    credential: req.res.locals.security.key,
                    contentType: `image/${imgMine}`,
                    fileSize: file.buffer.byteLength,
                    fileName: `${_id}.${imgType}`,
                    cacheControl: 'public, max-age=3600',
                    public: true,
                }).then((put_responce) => {
                    if (put_responce.status !== 200) {
                        return { status: status, body: put_responce.body };
                    }
                    const putApplet = { _id: _id, data: body.data };
                    const iconUrl = put_responce.body.publicUrl;
                    putApplet.data.iconUrl = iconUrl;
                    return put(ds, riiiverdb.APPLET, putApplet, req.res.locals.security.key).then(({ status, body }) => {
                        if (status !== 200) {
                            return { status: status, body: body };
                        }
                        else {
                            return { status: 201, body: iconUrl };
                        }
                    });
                });
            });
        });
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
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
        res.status(code).json(e);
    });
};
const increaseVerAppletIcon = (version) => {
    // Get the applet used the orignal block => incrase version
    const lastVerIndex = version.lastIndexOf(".");
    const lastVer = Number(version.slice(lastVerIndex + 1, version.length));
    const newVer = `${version.slice(0, lastVerIndex)}.${lastVer + 1}`;
    return newVer;
};
const isValidAppletIconFile = (file) => {
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
    };
};
const errorStatusCode = (e) => {
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
    return code;
};
const putAppletIcon = (req, res) => {
    return riiiverdb.forWrite(getRegion(req), null, null, async (ds) => {
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
                }, req.headers.authorization);
            }
            let rs_push_icon = await fileUpload(ds, riiiverdb.APPLET_ICON, _id, Buffer.from(file.buffer, 'binary'), {
                credential: req.headers.authorization,
                contentType: `image/${imgMine}`,
                fileSize: file.buffer.byteLength,
                fileName: `${_id}.${imgType}`,
                cacheControl: 'public, max-age=3600',
                public: true,
            });
            if (rs_push_icon.status !== 200) {
                return { status: status, body: rs_push_icon.body };
            }
            rs_applet.body.data.version = increaseVerAppletIcon(rs_applet.body.data.version);
            const putApplet = { _id: _id, data: rs_applet.body.data };
            const iconUrl = rs_push_icon.body.publicUrl;
            putApplet.data.iconUrl = iconUrl;
            let rs_put_applet = await put(ds, riiiverdb.APPLET, putApplet, req.headers.authorization);
            if (rs_put_applet.status !== 200) {
                return { status: status, body: rs_put_applet.body };
            }
            else {
                return { status: 200, body: iconUrl };
            }
        }
        catch (e) {
            throw e;
        }
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        let code = errorStatusCode(e);
        res.status(code).json(e);
    });
};
const postApplet = (req, res) => {
    return riiiverdb.forWrite(getUser(req), null, null, (ds) => {
        const reqBody = req.body;
        const publicStatus = reqBody.public;
        delete reqBody.public;
        if (typeof reqBody.templateType === "undefined") {
            return getBlocks(ds, reqBody.trigger, reqBody.service, reqBody.action)
                .then(validateWirings(reqBody.wirings))
                .then(() => post(ds, riiiverdb.APPLET, { data: reqBody }, res.locals.security.key))
                .then(({ status, body }) => {
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
                        post(ds, riiiverdb.APPLET_STORE_STATUS, storeStatusBody, root_key),
                        post(ds, riiiverdb.APPLET_PUBLIC_STATUS, publicStatusBody, root_key),
                        post(ds, riiiverdb.APPLET_MISC, downloadNumBody, root_key)
                    ]).then(resultArray => {
                        const failedStatus = resultArray.find(result => {
                            return result.status !== 201;
                        });
                        if (failedStatus === undefined) {
                            return { status: 201, body: fromDataEntity(body) };
                        }
                        else {
                            return { status: failedStatus.status, body: failedStatus.body };
                        }
                    });
                }
                else {
                    return Promise.reject({ status, body });
                }
            })
                .catch(({ status, body }) => {
                console.log('POST ERROR: ', status, body);
                return { status: status, body: body };
            });
        }
        else {
            return getTemplateBlocks(ds, reqBody.triggers, reqBody.services, reqBody.actions)
                .then(() => post(ds, riiiverdb.APPLET, { data: reqBody }, res.locals.security.key))
                .then(({ status, body }) => {
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
                        post(ds, riiiverdb.APPLET_STORE_STATUS, storeStatusBody, root_key),
                        post(ds, riiiverdb.APPLET_PUBLIC_STATUS, publicStatusBody, root_key)
                    ]).then(resultArray => {
                        const failedStatus = resultArray.find(result => {
                            return result.status !== 201;
                        });
                        if (failedStatus === undefined) {
                            return { status: 201, body: fromDataEntity(body) };
                        }
                        else {
                            return { status: failedStatus.status, body: failedStatus.body };
                        }
                    });
                }
                else {
                    return Promise.reject({ status, body });
                }
            })
                .catch(({ status, body }) => {
                return { status: status, body: body };
            });
        }
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        console.log('POST ERROR CATCH: ', e);
        res.status(400).json(e);
    });
};
const putApplet = (req, res) => {
    return riiiverdb.forWrite(getUser(req), null, null, (ds) => {
        const reqBody = req.body;
        const appletId = reqBody.appletId;
        const publicStatus = reqBody.public;
        delete reqBody.public;
        return getBlocks(ds, reqBody.trigger, reqBody.service, reqBody.action)
            .then(validateWirings(reqBody.wirings))
            .then(() => put(ds, riiiverdb.APPLET, { _id: appletId, data: reqBody }, res.locals.security.key, {
            updateOwner: true
        }))
            .then(({ status, body }) => {
            if (status === 200 || status === 201) {
                const publicStatusBody = { _id: appletId, data: { status: publicStatus } };
                return put(ds, riiiverdb.APPLET_PUBLIC_STATUS, publicStatusBody, root_key).then((result) => {
                    if (result.status === 200) {
                        return { status: 201, body: fromDataEntity(body) };
                    }
                    else {
                        return { status: result.status, body: result.body };
                    }
                });
            }
            else {
                return Promise.reject({ status, body });
            }
        })
            .catch(({ status, body }) => {
            return { status: status, body: body };
        });
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const getBlocks = async (ds, triggerBlockId, serviceBlockId, actionBlockId) => {
    const blockIds = [triggerBlockId, serviceBlockId, actionBlockId];
    const reqQuery = { query: { _id: { $in: blockIds } } };
    const { status, body } = await query(ds, riiiverdb.BLOCK, reqQuery, root_key);
    if (status === 200) {
        if (body.length === 3) {
            return tripletToObject(body, triggerBlockId, serviceBlockId, actionBlockId);
        }
        else {
            const missingIds = missingBlockIds(body, blockIds);
            return Promise.reject(errors.BlocksNotFound(missingIds.join(", ")));
        }
    }
    else {
        return Promise.reject({ status, body });
    }
};
const getTemplateBlocks = async (ds, triggerBlockIds, serviceBlockIds, actionBlockIds) => {
    const temp = [];
    const blockIds = temp.concat(...[triggerBlockIds, serviceBlockIds, actionBlockIds]);
    const reqQuery = { query: JSON.stringify({ _id: { $in: blockIds } }) };
    const { status, body } = await query(ds, riiiverdb.BLOCK, reqQuery, root_key);
    if (status === 200) {
        if (body.length === blockIds.length) {
            return tripletToArrayObject(body, triggerBlockIds, serviceBlockIds, actionBlockIds);
        }
        else {
            const missingIds = missingBlockIds(body, blockIds);
            return Promise.reject(errors.BlocksNotFound(missingIds.join(", ")));
        }
    }
    else {
        return Promise.reject({ status, body });
    }
};
// Build dictionary of found blocks in the form of { trigger: [Block], service: [Block], action: [Block] }
const tripletToObject = (blockTriplet, // block's json array whose legth is 3
triggerBlockId, serviceBlockId, actionBlockId) => {
    return new Promise((resolve, reject) => {
        const blocks = {
            action: undefined,
            trigger: undefined,
            service: undefined
        };
        blockTriplet.forEach(block => {
            switch (block._id) {
                case triggerBlockId:
                    console.log('id: ', block._id, block.data.blockType, 'trigger');
                    if (block.data.blockType !== "trigger") {
                        reject(errors.InvalidBlockType(triggerBlockId, "trigger"));
                    }
                    blocks.trigger = block;
                    break;
                case serviceBlockId:
                    console.log('id: ', block._id, block.data.blockType, 'service');
                    if (block.data.blockType !== "service") {
                        reject(errors.InvalidBlockType(serviceBlockId, "service"));
                    }
                    blocks.service = block;
                    break;
                case actionBlockId:
                    console.log('id: ', block._id, block.data.blockType, 'action');
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
const tripletToArrayObject = (blockTriplet, // block's json array whose legth is 3
triggerBlockIds, serviceBlockIds, actionBlockIds) => {
    return new Promise((resolve, reject) => {
        const blocks = {
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
            }
            else if ((hitId = serviceBlockIds.find(_id => _id === block._id))) {
                if (block.data.blockType !== "service") {
                    reject(errors.InvalidBlockType(hitId, "service"));
                }
                blocks.service = block;
            }
            else if ((hitId = actionBlockIds.find(_id => _id === block._id))) {
                if (block.data.blockType !== "action") {
                    reject(errors.InvalidBlockType(hitId, "action"));
                }
                blocks.action = block;
            }
            else {
                reject(errors.BlocksNotFound(block._id));
            }
            /* tslint:enable: no-conditional-assignment */
        });
        resolve(blocks);
    });
};
const missingBlockIds = (blocks, requestBlockIds) => {
    const foundIds = blocks.map(({ _id }) => _id);
    const findMissingReducer = (missingIds, id) => foundIds.includes(id) ? missingIds : [...missingIds, id];
    return requestBlockIds.reduce(findMissingReducer, []);
};
const validateWirings = (wirings) => ({ trigger, service, action }) => {
    return Promise.all(Object.entries(wirings).map(kv => validateWiring(trigger, service, action)(...kv)));
};
const validateWiring = (trigger, service, action) => (destBlockId, wiring) => {
    switch (destBlockId) {
        case service._id:
            return validateWiringImpl(wiring, trigger, service);
        case action._id:
            return validateWiringImpl(wiring, service, action);
        default:
            return Promise.reject(errors.InvalidAppletWiringTarget);
    }
};
const validateWiringImpl = (wiring, srcBlock, destBlock) => {
    const required = (destBlock.data.input && destBlock.data.input.required) || [];
    return Promise.all(required.map(rejectIfRequiredPropertyMissing(wiring))).then(validateWiringSources(wiring, srcBlock, destBlock));
};
const rejectIfRequiredPropertyMissing = (wiring) => (requiredProperty) => {
    return wiring.hasOwnProperty(requiredProperty)
        ? Promise.resolve()
        : Promise.reject(errors.MissingRequiredProperty(requiredProperty));
};
const validateWiringSources = (wiring, srcBlock, destBlock) => () => {
    const srcProperties = srcBlock.data.output && srcBlock.data.output.properties;
    const destProperties = destBlock.data.input && destBlock.data.input.properties;
    return Promise.all(
    // Object.entries(wiring).map(([destProperty, { id, property }]) => {
    Object.entries(wiring).map((eleArr) => {
        const [destProperty, { id, property }] = eleArr;
        return new Promise((resolve, reject) => {
            if (id !== srcBlock._id) {
                return reject(errors.SourceIsNotPreviousBlock(id, destBlock._id));
            }
            else if (!(srcProperties && srcProperties[property])) {
                return reject(errors.WiringSourceNotFound(property, id));
            }
            else if (!(destProperties && destProperties[destProperty])) {
                return reject(errors.WiringDestinationNotFound(destProperty, destBlock._id));
            }
            else {
                const srcPropertySchema = srcProperties[property];
                const destPropertySchema = destProperties[destProperty];
                // Currently, only checks `type` and `format`, not `enum` and other options
                if (srcPropertySchema.type === destPropertySchema.type) {
                    return resolve();
                }
                else {
                    return reject(errors.WiringTypeMismatch(property, destProperty));
                }
            }
        });
    }));
};
const getMyAppletsBody = (ds, res, key, promiseArray, callback, onlyAppletSuspend) => {
    const reqQuery = {};
    if (onlyAppletSuspend) {
        reqQuery["data.AppletSuspend"] = { $exists: true };
    }
    promiseArray.unshift(query(ds, riiiverdb.APPLET, { query: reqQuery }, key));
    return Promise.all(promiseArray).then(async (resultArray) => {
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
        }
        else {
            return { status: failedStatus.status, body: failedStatus.body };
        }
    });
};
const getMyAppletsBody2 = (ds, res, key, q, callback, onlyAppletSuspend) => {
    if (onlyAppletSuspend) {
        q.applet = { "data.AppletSuspend": { $exists: true } };
    }
    let promiseArray = [
        query(ds, riiiverdb.APPLET, { query: q }, key, { multiple: true, fetch: ['appletgoodnum', 'appletmisc', 'appletpublicstatus', 'appletstorestatus'] })
    ];
    return Promise.all(promiseArray).then(async (resultArray) => {
        const failedStatus = resultArray.find(result => {
            return result.status !== 200;
        });
        if (failedStatus === undefined) {
            // Exclude isDeleted applets
            let r = [];
            let { status, body } = resultArray[0];
            r.push({ status: status, body: body.map((x) => x.applet || {}).filter((x) => x.data) });
            r.push({ status: status, body: body.map((x) => x.appletstorestatus || {}).filter((x) => x.data) });
            r.push({ status: status, body: body.map((x) => x.appletpublicstatus || {}).filter((x) => x.data) });
            r.push({ status: status, body: body.map((x) => x.appletgoodnum || {}).filter((x) => x.data) });
            r.push({ status: status, body: body.map((x) => x.appletmisc || {}).filter((x) => x.data) });
            let applets = getAppletWholeInfoList(r);
            applets = applets.filter(applet => {
                return applet.appletInfo.storeStatus !== StoreStatus.deleted;
            });
            // callback
            return await callback(res, applets);
        }
        else {
            return { status: failedStatus.status, body: failedStatus.body };
        }
    });
};
const retApplets = async (res, applets) => {
    // Send response
    return Promise.resolve({ status: 200, body: { applets: applets } });
};
const getMyApplets = (req, res) => {
    return riiiverdb.forRead(getUser(req), null, null, (ds) => {
        const q = {
            appletstorestatus: {},
            appletpublicstatus: {},
            appletgoodnum: {},
            appletmisc: {}
        };
        if (req.query.storeStatus) {
            q.appletstorestatus["data.status"] = req.query.storeStatus;
        }
        if (req.query.publicStatus !== undefined) {
            let publicStatus = true;
            if (req.query.publicStatus === "false") {
                publicStatus = false;
            }
            q.appletpublicstatus["data.status"] = publicStatus;
        }
        return getMyAppletsBody2(ds, res, req.res.locals.security.key, q, retApplets, false /* onlyAppletSuspend */);
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const listApplets = (req, res) => {
    return riiiverdb.forRead(getUser(req), null, null, (ds) => {
        return genericListApplets(ds, req, res, root_key);
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const listAdminApplets = (req, res) => {
    return riiiverdb.forRead(getRegion(req), null, null, (ds) => {
        return genericListApplets(ds, req, res, req.headers.authorization);
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const sortByReleaseDate = (applets) => {
    const sortedApplets = applets.sort((current, next) => {
        const gt = 1; // Great than
        const le = -1; // Less than
        let curt_utc_time = 0;
        let next_utc_time = 0;
        if (current.appletInfo.release) {
            curt_utc_time = moment_1.default.utc(current.appletInfo.release).unix();
        }
        if (next.appletInfo.release) {
            next_utc_time = moment_1.default.utc(next.appletInfo.release).unix();
        }
        if (Number(curt_utc_time) < Number(next_utc_time)) {
            return gt;
        }
        return le;
    });
    return sortedApplets;
};
const sortByLikeNum = (applets) => {
    const sortedApplets = applets.sort((current, next) => {
        const gt = 1; // Great than
        const le = -1; // Less than
        if (Number(current.appletInfo.likeNum) < Number(next.appletInfo.likeNum)) {
            return gt;
        }
        return le;
    });
    return sortedApplets;
};
const doSort = (sortBy, applets) => {
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
const genericListApplets = (ds, req, res, key) => {
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
            req.query.maxSdkVersion = sdkVersion;
        }
    }
    //const promiseArray = buildPromiseArray(ds, req.query);
    const reqQuery = buildReqQuery(req.query);
    const q = {
        applet: JSON.parse(reqQuery.query),
        appletstorestatus: {},
        appletpublicstatus: {},
        appletgoodnum: {},
        appletmisc: {}
    };
    if (req.query.storeStatus) {
        q.appletstorestatus["data.status"] = req.query.storeStatus;
    }
    if (req.query.publicStatus !== undefined) {
        let publicStatus = true;
        if (req.query.publicStatus === "false") {
            publicStatus = false;
        }
        q.appletpublicstatus["data.status"] = publicStatus;
    }
    let promiseArray = [];
    promiseArray.unshift(query(ds, riiiverdb.APPLET, { query: q }, key, { multiple: true, fetch: ['appletgoodnum', 'appletmisc', 'appletpublicstatus', 'appletstorestatus'] }));
    return Promise.all(promiseArray)
        .then(async (resultArray) => {
        const failedStatus = resultArray.find(result => {
            return result.status !== 200;
        });
        if (failedStatus === undefined) {
            let r = [];
            let { status, body } = resultArray[0];
            if ((req.query.maxSdkVersion || req.query.minSdkVersion) && body.length > 0) {
                let newBody = body.filter((e) => {
                    if (e.applet.data.sdkVersion && ((!req.query.minSdkVersion || e.applet.data.sdkVersion.localeCompare(req.query.minSdkVersion, {}, { numeric: true }) === 1) &&
                        (!req.query.maxSdkVersion || e.applet.data.sdkVersion.localeCompare(req.query.maxSdkVersion, {}, { numeric: true }) === -1))) {
                        return e;
                    }
                });
                body = newBody;
            }
            r.push({ status: status, body: body.map((x) => x.applet).filter((x) => x.data) });
            r.push({ status: status, body: body.map((x) => x.appletstorestatus).filter((x) => x.data) });
            r.push({ status: status, body: body.map((x) => x.appletpublicstatus).filter((x) => x.data) });
            r.push({ status: status, body: body.map((x) => x.appletgoodnum).filter((x) => x.data) });
            r.push({ status: status, body: body.map((x) => x.appletmisc).filter((x) => x.data) });
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
                }
                else if (limitContentNum <= 0) {
                    retApplets = [];
                }
            }
            // for backword compability, convert RFC-1123 to ISO-8601
            retApplets = retApplets.map(applet => {
                const release = applet.appletInfo.release;
                applet.appletInfo.release = DateUtil_1.DateUtil.convertIso8601(release);
                return applet;
            });
            return {
                status: 200, body: {
                    applets: retApplets
                }
            };
        }
        else {
            return { status: failedStatus.status, body: failedStatus.body };
        }
    })
        .catch(error => {
        // For invalid sortBy value
        return { status: 400, body: JSON.stringify(error.message) };
    });
};
const getAppletWholeInfoList = (resultArray) => {
    const appletWholeInfoList = [];
    if (resultArray.find(list => {
        return list.body.length === 0;
    }) !== undefined) {
        return appletWholeInfoList;
    }
    let arrayIndex = 0;
    const appletList = resultArray[arrayIndex++].body;
    let storeStatusList = [];
    let publicStatusList = [];
    let likeNumList = [];
    let downloadNumList = [];
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
            appletWholeInfoList.push(buildAppletWholeInfo(applet, buildAppletInfo(applet, storeStatus, publicStatus, likeNum, downloadNum)));
        }
    });
    return appletWholeInfoList;
};
const buildAppletInfo = (applet, storeStatus, publicStatus, likeNum, downloadNum) => {
    const storeStatusString = storeStatus.data.status;
    const isRelease = storeStatus.data.release;
    const publicStatusFlg = publicStatus.data.status;
    const dlcnt = typeof downloadNum !== "undefined" ? downloadNum.data.dlcnt : 0;
    const lkcnt = typeof likeNum !== "undefined" ? likeNum.data.num : 0;
    const info = {
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
const buildAppletWholeInfo = (applet, appletInfo) => {
    return {
        id: applet._id,
        applet: fromDataEntity(applet),
        appletInfo: appletInfo
    };
};
const buildPromiseArray = (ds, query_) => {
    const promiseArray = [];
    const storeStatusQuery = {};
    if (query_.storeStatus) {
        storeStatusQuery.query = JSON.stringify({
            "data.status": query_.storeStatus
        });
    }
    promiseArray.push(query(ds, riiiverdb.APPLET_STORE_STATUS, storeStatusQuery, root_key));
    let publicStatusQuery = {};
    if (query_.publicStatus !== undefined) {
        let publicStatus = true;
        if (query_.publicStatus === "false") {
            publicStatus = false;
        }
        publicStatusQuery = {
            query: JSON.stringify({ "data.status": publicStatus })
        };
    }
    promiseArray.push(query(ds, riiiverdb.APPLET_PUBLIC_STATUS, publicStatusQuery, root_key));
    promiseArray.push(query(ds, riiiverdb.APPLET_GOODNUM, {}, root_key));
    promiseArray.push(query(ds, riiiverdb.APPLET_MISC, {}, root_key));
    return promiseArray;
};
const createStringArray = (query) => {
    let res = [];
    if (!Array.isArray(query)) {
        res = [query];
    }
    else {
        res = query;
    }
    return res;
};
const getSdkVersionFromHeader = (req) => {
    let user_agent = req.headers["user-agent"];
    let regex = /RiiiverSDK\/(\d+.\d+.\d+)/g;
    let rs = regex.exec(user_agent);
    if (!rs) {
        return undefined;
    }
    else {
        return rs[1];
    }
};
/* tslint:disable: no-string-literal */
const buildReqQuery = (query) => {
    const reqQuery = {};
    if (typeof query.personalUseFlg !== "undefined") {
        if (query.personalUseFlg === "true") {
            reqQuery["data.personalUseFlg"] = { $eq: true };
        }
        else {
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
    if (query.osType && query.osType !== api_1.OSType.OSTypeEnum.none) {
        reqQuery["data.osType"] = { $in: [query.osType, api_1.OSType.OSTypeEnum.none] };
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
    reqQuery["data.sdkVersion"] = {};
    if (query.sdkVersion) {
        reqQuery["data.sdkVersion"]['$eq'] = query.sdkVersion;
    }
    if (Object.keys(reqQuery).length === 0) {
        return {};
    }
    else {
        return { query: JSON.stringify(reqQuery) };
    }
};
/* tslint:enable: no-string-literal */
const fromDataEntity = ({ _id, data }) => Object.assign({}, data, { id: _id });
const getApplet = (req, res) => {
    return riiiverdb.forRead(getUser(req), null, null, (ds) => {
        let id = req.swagger.params.id.value;
        const osType = req.query.osType;
        const deviceId = req.swagger.params.deviceId.value;
        return get(ds, riiiverdb.APPLET_COPY, id, root_key).then(({ status, body }) => {
            if (status == 200) {
                id = body.appletId;
            }
            return get(ds, riiiverdb.APPLET, id, root_key);
        }).then(({ status, body }) => {
            if (status === 200) {
                // Is device Id match?
                if (deviceId !== undefined) {
                    const retVal = deviceId.some((elm) => {
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
                if (osType !== undefined && osType !== api_1.OSType.OSTypeEnum.none) {
                    if (osType !== body.data.osType &&
                        body.data.osType !== api_1.OSType.OSTypeEnum.none) {
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
            }
            else {
                return { status: status, body: body };
            }
        });
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const deleteApplet = (req, res) => {
    return riiiverdb.forWrite(getUser(req), null, null, async (ds) => {
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
            return { status: status, body: body };
        }
        else if (body.data.status === "deleted") {
            // storeStatus is deleted, do noting.
            return { status: 204, body: body.data };
        }
        else if (body.data.status === "published" ||
            body.data.status === "waiting_review" ||
            body.data.status === "testing") {
            // storeStatus is piblished, change storeStatusto deleted.
            const data = {
                status: StoreStatus.deleted
            };
            if (typeof body.data.message !== "undefined") {
                data.message = body.data.message;
            }
            const reqBody = { _id: appletId, data: data };
            ret = await put(ds, riiiverdb.APPLET_STORE_STATUS, reqBody, root_key, { upsert: true });
            status = ret.status;
            if (status === 200 || status === 201) {
                return { status: 204, body: ret.body.data };
            }
            else {
                return { status: status, body: ret.body };
            }
        }
        else if (body.data.status === "rejected") {
            // storeStatus is rejected or waiting_review, delete the data in database.
            ret = await delete_(ds, riiiverdb.APPLET, appletId, req.res.locals.security.key);
            status = ret.status;
            if (status >= 200 && status < 300) {
                return { status: 204 };
            }
            else {
                return { status: status, body: body };
            }
        }
        else {
            return { status: status, body: body };
        }
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(204).end();
    });
};
const getAppletGoodNum = (req, res) => {
    return riiiverdb.forRead(getUser(req), null, null, (ds) => {
        const appletId = req.swagger.params.appletId.value;
        return get(ds, riiiverdb.APPLET_GOODNUM, appletId, root_key).then(({ status, body }) => {
            if (status === 200) {
                return { status: 200, body: body.data };
            }
            else {
                return { status: status, body: body };
            }
        });
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const postAppletGoodNum = (req, res) => {
    return riiiverdb.forWrite(getUser(req), null, null, (ds) => {
        const appletId = req.body.appletId;
        return get(ds, riiiverdb.APPLET, appletId, root_key).then(({ status, body }) => {
            if (status === 200) {
                let num = req.body.num;
                if (typeof num === "undefined") {
                    num = 0;
                }
                const data = { num: num };
                const reqBody = { _id: appletId, data: data };
                post(ds, riiiverdb.APPLET_GOODNUM, reqBody, root_key).then(({ status, body }) => {
                    if (status === 201) {
                        res.status(201).json(body.data);
                    }
                    else {
                        res.status(status).json(body);
                    }
                });
            }
            else {
                res.status(status).json(body);
            }
        });
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const getAppletPublicStatus = (req, res) => {
    return riiiverdb.forRead(getUser(req), null, null, (ds) => {
        const appletId = req.swagger.params.appletId.value;
        return get(ds, riiiverdb.APPLET_PUBLIC_STATUS, appletId, root_key).then(({ status, body }) => {
            if (status === 200) {
                res.status(200).json(body.data);
            }
            else {
                res.status(status).json(body);
            }
        });
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const postAppletPublicStatus = (req, res) => {
    return riiiverdb.forWrite(getUser(req), null, null, (ds) => {
        const appletId = req.body.appletId;
        return get(ds, riiiverdb.APPLET, appletId, root_key).then(({ status, body }) => {
            if (status === 200) {
                let publicStatus = req.body.status;
                if (typeof publicStatus === "undefined") {
                    publicStatus = true;
                }
                const data = { status: publicStatus };
                const reqBody = { _id: appletId, data: data };
                post(ds, riiiverdb.APPLET_PUBLIC_STATUS, reqBody, root_key).then(({ status, body }) => {
                    if (status === 201) {
                        return { status: 201, body: body.data };
                    }
                    else {
                        return { status: status, body: body };
                    }
                });
            }
            else {
                return { status: status, body: body };
            }
        });
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const putAppletPublicStatus = (req, res) => {
    return riiiverdb.forWrite(getUser(req), null, null, (ds) => {
        const appletId = req.body.appletId;
        const publicStatus = req.body.status;
        const data = { status: publicStatus };
        const reqBody = { _id: appletId, data: data };
        return get(ds, riiiverdb.APPLET_PUBLIC_STATUS, appletId, root_key).then(({ status, body }) => {
            if (status === 200) {
                return put(ds, riiiverdb.APPLET_PUBLIC_STATUS, reqBody, root_key, { upsert: true }).then(({ status, body }) => {
                    if (status === 200 || status === 201) {
                        return { status: 201, body: body.data };
                    }
                    else {
                        return { status: status, body: body };
                    }
                });
            }
            else {
                return { status: status, body: body };
            }
        });
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const StoreStatus = {
    published: "published",
    waiting_review: "waiting_review",
    rejected: "rejected",
    deleted: "deleted"
};
const getAppletStoreStatus = (req, res) => {
    return riiiverdb.forRead(getRegion(req), null, null, (ds) => {
        const appletId = req.swagger.params.appletId.value;
        return get(ds, riiiverdb.APPLET_STORE_STATUS, appletId, req.headers.authorization).then(({ status, body }) => {
            if (status === 200) {
                return { status: 200, body: body.data };
            }
            else {
                return { status: status, body: body };
            }
        });
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const postAppletStoreStatus = (req, res) => {
    req.headers.authorization = root_key;
    putAppletStoreStatus(req, res);
};
// This function include post as well
const putAppletStoreStatus = (req, res) => {
    return riiiverdb.forWrite(getRegion(req), null, null, (ds) => {
        const appletId = req.body.appletId;
        const storeStatus = req.body.status;
        const message = req.body.message;
        const key = req.headers.authorization;
        if (storeStatus === StoreStatus.rejected && !message) {
            return Promise.resolve({
                status: 400, body: {
                    code: "400-06",
                    error: "BadRequest",
                    message: "message is required when status is rejected."
                }
            });
        }
        return get(ds, riiiverdb.APPLET, appletId, key).then(({ status, body }) => {
            if (status === 200) {
                const data = { status: storeStatus };
                if (typeof message !== "undefined") {
                    data.message = message;
                }
                // Add release time if status is 'published'
                if (data.status === "published") {
                    data.release = DateUtil_1.DateUtil.getCurrentIso8601Time();
                }
                // upsert means dodai can create a new item if put failed
                const reqBody = { _id: appletId, data: data };
                return put(ds, riiiverdb.APPLET_STORE_STATUS, reqBody, key, { upsert: true }).then(({ status, body }) => {
                    if (status === 200 || status === 201) {
                        return { status: 201, body: body.data };
                    }
                    else {
                        return { status: status, body: body };
                    }
                });
            }
            else {
                return { status: status, body: body };
            }
        });
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const getAppletDownloadNum = (req, res) => {
    return riiiverdb.forRead(getUser(req), null, null, async (ds) => {
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
        }
        else {
            return { status: status, body: body };
        }
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const errors = {
    BlocksNotFound: (notFoundBlocks) => {
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
    InvalidBlockType: (id, blockType) => {
        return {
            status: 400,
            body: {
                code: "400-51",
                error: "InvalidBlockType",
                message: `Block type of '${id}' is not equal to '${blockType}'`
            }
        };
    },
    MissingRequiredProperty: (requiredProperty) => {
        return {
            status: 400,
            body: {
                code: "400-52",
                error: "MissingRequiredProperty",
                message: `Required property is missing: ${requiredProperty}`
            }
        };
    },
    SourceIsNotPreviousBlock: (srcBlockId, destBlockId) => {
        return {
            status: 400,
            body: {
                code: "400-53",
                error: "SourceIsNotPreviousBlock",
                message: `'${srcBlockId}' is not a previous block of '${destBlockId}'`
            }
        };
    },
    WiringTypeMismatch: (srcPropertyName, destPropertyName) => {
        return {
            status: 400,
            body: {
                code: "400-54",
                error: "WiringTypeMismatch",
                message: `'${srcPropertyName}' does not match for the data type of '${destPropertyName}'`
            }
        };
    },
    WiringSourceNotFound: (srcPropertyName, srcBlockId) => {
        return {
            status: 400,
            body: {
                code: "400-55",
                error: "WiringSourceNotFound",
                message: `'${srcPropertyName}' does not exist in output of '${srcBlockId}'`
            }
        };
    },
    WiringDestinationNotFound: (destPropertyName, destBlockId) => {
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
const composeAppletSuspend = (req) => {
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
const applyAppletsWithCallback = async (ds, deviceId, callback, args) => {
    const updateOK = true;
    const reqQuery = {};
    reqQuery["data.deviceId"] = deviceId;
    let ret = await query(ds, riiiverdb.APPLET, { query: reqQuery }, root_key);
    let applets = ret.body;
    let i = 0;
    // Need to change version for ALL applets if they use the orginal block
    for (i = 0; i < applets.length; i++) {
        const applet = applets[i];
        let appletBody = applet.data;
        // Run callback to update applet contents
        appletBody = callback(appletBody, args);
        // Wrtite back to applet
        const { status, body } = await put(ds, riiiverdb.APPLET, { _id: applet._id, data: appletBody }, root_key);
        if (status !== 200 && status !== 201) {
            logger.system.error("Fail to apply a applet");
            logger.system.error(JSON.stringify(body));
            return !updateOK;
        }
    }
    return updateOK;
};
const appletChangeCallback = (applet, args) => {
    const appletSuspend = composeAppletSuspend(args);
    if (applet.AppletSuspend) {
        applet.AppletSuspend.device = appletSuspend;
    }
    else {
        applet.AppletSuspend = { device: appletSuspend };
    }
    return applet;
};
const putAdminAppletSuspend = (req, res) => {
    return riiiverdb.forWrite(getRegion(req), null, null, async (ds) => {
        if (req.body.deviceSuspendFlg && !req.body.deviceSuspendCode) {
            return {
                status: 400, body: {
                    code: "400-06",
                    error: "BadRequest",
                    message: "Must have deviceSuspendCode if deviceSuspendFlg is true"
                }
            };
        }
        let canProceed = await applyAppletsWithCallback(ds, req.body.deviceId, appletChangeCallback, req);
        if (canProceed) {
            return { status: 201, body: {} };
        }
        else {
            return {
                status: 400, body: {
                    code: "400-06",
                    error: "BadRequest",
                    message: "putAdminAppletSuspend fail"
                }
            };
        }
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const isAppletSuspended = (applet) => {
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
                }
                else if (applet.applet.AppletSuspend[checkItem].blockSuspendFlg) {
                    return applet.applet.AppletSuspend[checkItem].blockSuspendFlg;
                }
                else {
                    /*
                              logger.system.error(
                                `${JSON.stringify(applet.applet.AppletSuspend[checkItem])} is false`
                              );
                    */
                    continue;
                }
            }
        }
        catch (e) {
            logger.system.error(JSON.stringify(e));
            return false;
        }
    }
    return false;
};
const getSuspendApplets = (res, applets) => {
    const suspendAppletsInfo = applets.filter(applet => {
        return isAppletSuspended(applet);
    });
    const suspendApplets = [];
    suspendAppletsInfo.forEach(appletInfo => {
        const applet = appletInfo.applet;
        const suspendApplet = Object.assign({ id: applet.id }, applet.AppletSuspend);
        suspendApplets.push(suspendApplet);
    });
    // Send response
    if (suspendApplets.length) {
        return Promise.resolve({
            status: 200,
            body: { AppletSuspend: suspendApplets }
        });
    }
    else {
        return Promise.resolve({
            status: 200,
            body: { AppletSuspend: [] }
        });
    }
};
const getSuspendedApplets = (req, res) => {
    return riiiverdb.forRead(getUser(req), null, null, (ds) => {
        //const promiseArray = buildPromiseArray(ds, {});
        const q = {
            appletstorestatus: {},
            appletpublicstatus: {},
            appletgoodnum: {},
            appletmisc: {}
        };
        return getMyAppletsBody2(ds, res, req.res.locals.security.key, q, getSuspendApplets, true /* onlyAppletSuspend */);
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const putAdminPersonalUseFlg = (req, res) => {
    putAdminPersonalUseFlgImpl(req, res);
};
const putAdminPersonalUseFlgImpl = (req, res) => {
    return riiiverdb.forWrite(getRegion(req), null, null, async (ds) => {
        const reqKey = req.headers.authorization;
        const appletId = req.body.appletId;
        const personalUseFlg = req.body.personalUseFlg;
        const reqBody = {
            _id: appletId,
            $set: { '$.personalUseFlg': personalUseFlg }
        };
        try {
            const getApplet = await get(ds, riiiverdb.APPLET_STORE_STATUS, appletId, reqKey);
            if (getApplet.body.data.status == 'deleted') {
                return { status: 404, body: {} };
            }
            const { status, body } = await put(ds, riiiverdb.APPLET, reqBody, reqKey);
            if (status >= 200 && status < 300) {
                return { status: 201, body: {} };
            }
            return { status: status, body: body };
        }
        catch (e) {
            return { status: 500, body: e };
        }
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const getAppletCopy = (req, res) => {
    return riiiverdb.forRead(getUser(req), null, null, async (ds) => {
        const preferenceId = req.swagger.params.userPreferenceId.value;
        const { status, body } = await query(ds, riiiverdb.APPLET_COPY, {
            query: {
                userPreferenceId: preferenceId
            }
        }, req.res.locals.security.key);
        if (status === 200) {
            return {
                status: 200,
                body: { applet_copy_id: body._id }
            };
        }
        else {
            return { status: status, body: body };
        }
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const postAppletCopy = (req, res) => {
    return riiiverdb.forWrite(getRegion(req), null, null, async (ds) => {
        const reqBody = req.swagger.params.body.value;
        const checkResults = await Promise.all([
            get(ds, riiiverdb.APPLET, reqBody.appletId, root_key),
            get(ds, riiiverdb.USER_PREFERENCE, reqBody.userPreferenceId, root_key)
        ]);
        if (checkResults[0].status !== 200) {
            return { status: 404, body: { code: '404-01', message: 'invalid parameters: appletId' } };
        }
        if (checkResults[1].status !== 200) {
            return { status: 404, body: { code: '404-01', message: 'invalid parameters: userPreferenceId' } };
        }
        const { status, body } = await post(ds, riiiverdb.APPLET_COPY, {
            owner: reqBody.userId,
            appletId: reqBody.appletId,
            userPreferenceId: reqBody.userPreferenceId,
            data: {}
        }, root_key);
        if (status === 200 || status == 201) {
            return { status: 201, body: { applet_copy_id: body._id } };
        }
        else {
            return { status: status, body: body };
        }
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
        res.status(400).json(e);
    });
};
const deleteAppletCopy = (req, res) => {
    return riiiverdb.forWrite(getRegion(req), null, null, async (ds) => {
        const appletCopyId = req.swagger.params.applet_copy_id.value;
        const { status, body } = await delete_(ds, riiiverdb.APPLET_COPY, appletCopyId, root_key);
        if (status == 204) {
            return { status: 204, body: { applet_copy_id: appletCopyId } };
        }
        else {
            return { status: status, body: body };
        }
    }).then((ret) => {
        writeResult(res, ret);
    }).catch((e) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcGxldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7QUFFYiw0RUFBNEU7QUFDNUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUMvRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzVDLE1BQU0sT0FBTyxHQUFHLEdBQUcsV0FBVyxDQUFDLE1BQU0sTUFBTSxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDOUQsTUFBTSxFQUFFLEdBQXNCLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3pELG1FQUFtRTtBQUNuRSwyREFBNEQ7QUFDNUQscUNBQXNDO0FBQ3RDLG9EQUE0QjtBQUU1QixrREFBK0M7QUFnQi9DLGtFQUFvRDtBQUlwRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDcEQsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRTNCLE1BQU0sc0JBQXNCLEdBQUc7SUFDN0IsbUJBQW1CO0lBQ25CLG9CQUFvQjtJQUNwQixlQUFlO0lBQ2YsWUFBWTtDQUNiLENBQUM7QUFFRixNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQVEsRUFBRSxFQUFFO0lBQzdCLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDbkQsQ0FBQyxDQUFBO0FBRUQsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFRLEVBQUUsRUFBRTtJQUMzQixPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUE7QUFDckMsQ0FBQyxD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