applet-img
==========



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/applet-img.svg)](https://npmjs.org/package/applet-img)
[![Downloads/week](https://img.shields.io/npm/dw/applet-img.svg)](https://npmjs.org/package/applet-img)
[![License](https://img.shields.io/npm/l/applet-img.svg)](https://github.com/aLiyuLiu/applet-img/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g applet-img
$ applet-img COMMAND
running command...
$ applet-img (-v|--version|version)
applet-img/1.0.2 darwin-x64 node-v12.13.0
$ applet-img --help [COMMAND]
USAGE
  $ applet-img COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`applet-img filter-large-size`](#applet-img-filter-large-size)
* [`applet-img gen-icon-list`](#applet-img-gen-icon-list)
* [`applet-img help [COMMAND]`](#applet-img-help-command)
* [`applet-img upload-s3 [FILE]`](#applet-img-upload-s3-file)

## `applet-img filter-large-size`

describe the command here

```
USAGE
  $ applet-img filter-large-size

OPTIONS
  -b, --bucketName=bucketName  (required) aws s3 bucket name

  -f, --filePath=filePath      [default:
                               /Users/liyu/acs/river_applet_server/assets/applet-img/src/commands/iconurls.json] file
                               path of url list

  -h, --help                   show CLI help
```

_See code: [src/commands/filter-large-size.ts](https://github.com/aLiyuLiu/applet-img/blob/v1.0.2/src/commands/filter-large-size.ts)_

## `applet-img gen-icon-list`

describe the command here

```
USAGE
  $ applet-img gen-icon-list

OPTIONS
  -e, --env=env  (required) environment [prod/stg/dev]
  -h, --help       show CLI help
```

_See code: [src/commands/gen-icon-list.ts](https://github.com/aLiyuLiu/applet-img/blob/v1.0.2/src/commands/gen-icon-list.ts)_

## `applet-img help [COMMAND]`

display help for applet-img

```
USAGE
  $ applet-img help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src/commands/help.ts)_

## `applet-img upload-s3 [FILE]`

describe the command here

```
USAGE
  $ applet-img upload-s3 [FILE]

OPTIONS
  -a, --accessKey=accessKey    (required) AWS access key from env 'AWSAccessKey'
  -b, --bucketName=bucketName  (required) AWS Bucket name
  -h, --help                   show CLI help
  -s, --secretKey=secretKey    (required) AWS secret key from env 'AWSSecretKey'
  --auto-rm                    Remove uploaded file.
```

_See code: [src/commands/upload-s3.ts](https://github.com/aLiyuLiu/applet-img/blob/v1.0.2/src/commands/upload-s3.ts)_
<!-- commandsstop -->
