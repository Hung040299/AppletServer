import { PushService } from "../service/pushService";

const sendPush = (req: any, res: any) => {
  PushService.sendPush(req, res).catch(() => {
    return res.status(500).json({});
  });
};

const registerNotificationToken = (req: any, res: any) => {
  PushService.registerNotificationToken(req, res).catch(() => {
    return res.status(500).json({});
  });
};

const postCert = (req: any, res: any) => {
  PushService.postCert(req, res).catch(() => {
    res.status(500).json({});
  });
};

const sendLinkPush = (req: any, res: any) => {
  PushService.sendLinkPush(req, res).catch(() => {
    res.status(500).json({});
  });
};

const postPrivateKey = (req: any, res: any) => {
  PushService.postPrivateKey(req, res).catch(() => {
    res.status(500).json({});
  });
};

const sendAcceptancePush = (req: any, res: any) => {
  PushService.sendAcceptancePush(req, res).catch(() => {
    res.status(500).json({});
  });
};

module.exports = {
  postCert,
  postPrivateKey,
  registerNotificationToken,
  sendAcceptancePush,
  sendLinkPush,
  sendPush
};
