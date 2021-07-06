/*jshint esversion: 6 */
/*jshint asi: true */

require('should')
const request        = require('supertest')
const toolID         = '5c99895b24000025007e9a10'
const categoryID     = 'cat_0015'
const deviceID       = 'none'
const deviceID2      = 'ios'
const fakeDeviceID   = 'FakeDeviceID4Test'
const vendorID       = 'CITIZEN'
const version        = '1.0.0'
const ownerID        = '5c9b25c02600002700102391'
const ownerID2       = '5c985dd124000024007e80eb'
const fakeAppletID   = '500000000000000000000000'
const fakeAppletID2  = '500001450000022000000001'
const dummy_user_key = require('fs').readFileSync('./auth.txt').toString()
const root_key       = require('config').dodai.root_key
const aws_access_key = require('config').cognito_jp.AWSAccessKey
const aws_secret_key = require('config').cognito_jp.AWSSecretKey
const test_mode      = process.env.MODE

let server = 'http://127.0.0.1:10010'
if (test_mode === 'prod') {
  server = 'https://builder.developer.riiiver.com'
}
/*****************************************************************************
 * Store Server
 *****************************************************************************/
const mCookiePath    = './auth.txt'
let mRiverURL        = 'https://dv-str.riiiver.com/bb/login'
let mRiverLoginedURL = 'https://dv-str.riiiver.com/bb/account'
let mEmailAddr       = 'river-dev_o-gr@access-company.com'
let mPassword        = 'Acs-R1ver-dev'
const mEmailAddr2 = "Jun.Kobayashi@access-company.com"
const mPassword2 = "testtest"
const mEmailAddr3 = "Jun.Kobayashi+9@access-company.com"
const mPassword3 = "testtest"

const mTestDeviceToken = "0dddd93bb77577c3299cea4c83e54cc83a312da91e465e86faa146f3c6ce9969";

/* Change it if in prod mode */
if (test_mode === 'prod') {
  mRiverURL        = 'https://str.riiiver.com/bb/login'
  mRiverLoginedURL = 'https://str.riiiver.com/bb/account'
  mEmailAddr       = 'Jun.Kobayashi+8@access-company.com'
  mPassword        = 'testtest'
}

/*****************************************************************************
 * Export to test js files
 *****************************************************************************/
module.exports.request        = request
module.exports.server         = server
module.exports.toolID         = toolID
module.exports.categoryID     = categoryID
module.exports.deviceID       = deviceID
module.exports.deviceID2      = deviceID2
module.exports.fakeDeviceID   = fakeDeviceID
module.exports.vendorID       = vendorID
module.exports.version        = version
module.exports.ownerID        = ownerID
module.exports.ownerID2       = ownerID2
module.exports.fakeAppletID   = fakeAppletID
module.exports.fakeAppletID2  = fakeAppletID2
module.exports.dummy_user_key = dummy_user_key
module.exports.root_key       = root_key
module.exports.aws_access_key = aws_access_key
module.exports.aws_secret_key = aws_secret_key
module.exports.test_mode      = test_mode

module.exports.mRiverURL        = mRiverURL
module.exports.mRiverLoginedURL = mRiverLoginedURL
module.exports.mEmailAddr       = mEmailAddr
module.exports.mPassword        = mPassword
module.exports.mEmailAddr2      = mEmailAddr2
module.exports.mPassword2       = mPassword2
module.exports.mEmailAddr3      = mEmailAddr3
module.exports.mPassword3       = mPassword3
module.exports.mCookiePath      = mCookiePath

module.exports.mTestDeviceToken = mTestDeviceToken