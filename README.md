# river_applet_Server

Applet APIサーバ。Dodaiをバックエンドとする。

こちらの体系にはエンドユーザという概念が存在することに注意。

[Block server](https://github.com/access-company/river_block_server)と同様の開発環境・開発フローを採用。

実装の共通部分はBlock serverをnpm dependencyとして取り込んで利用する。

# セットアップ手順
npm install 時にBlock_Serverをチェックアウトする際、package.json,package-lock.jsonに修正が必要。
以下はURLのみ対応でのチェックアウト手順

### package.json
    "ER_Proto_Block_Server": "https://{ACSアカウント}:{パスワード}@github.com/access-company/river_block_server",

### package-lcok.json
    "version": "git+https://{ACSアカウント}:{パスワード}@github.com/access-company/river_block_server.git#{リビジョン番号}",

### 開発環境構築

1. このレポジトリをローカルに`git clone`する
2. `cd river_applet_server`
3. 開発用Node.jsのバージョン管理は[asdf]で行う。
    - リンク先のとおりにasdfをインストール
    - `asdf plugin-add nodejs`を実行
        - [asdf-nodejs]の説明のとおりにgpg公開鍵を導入
    - `asdf install`を実行
4. `npm install`を実行
5. あとは実行したい内容により、
    - swaggerのAPI仕様を編集したいなら、`npm run swagger:edit`を実行
        - ローカルにWebエディタが立ち上がるので、ブラウザで編集する。
          このエディタはswagger公式のOSSで、swaggerファイルを検証してくれる。
        - 自分のエディタで`api/swagger/swagger.yaml`を編集してから、ブラウザ上で検証にかけても良い
    - サーバをローカルに起動したいなら、`npm start`を実行
    - その他の用途やデプロイについては追って調査・策定
6. `eslint`を使っているので、以下のいずれかの方法で適用し、修正済みのコードをcommitする
    - エディタの拡張機能等を利用して、編集時や保存時に逐一適用していく（推奨）
    - ローカルインストールされる`eslint`を`npx eslint --fix .`で実行する
    - 手元環境に`eslint`をグローバルインストールしているならば`eslint --fix .`でも良い

[asdf]: https://github.com/asdf-vm/asdf
[asdf-nodejs]: https://github.com/asdf-vm/asdf-nodejs

### File modified after setup and installation

Please contact developers to get the correct settings

* config/test.yaml
    * Change settings to communicate with related servers
* test/api/controllers/applets.js
    * Change `dummy_user_key`
* node_modules/ER_Proto_Block_Server/test/api/controllers/security.js
    * Change `some_encrypted_value`
* node_modules/ER_Proto_Block_Server/lib/dodai.js
    * Modify
```js
const baseUrl = isTest ? 'http://localhost:9000' : `${usersessionConfig.schema}://${usersessionConfig.host}`
```
to
```js
const baseUrl = `${usersessionConfig.schema}://${usersessionConfig.host}`
```

## API概要
 river_applet_serverは以下の機能をAPIとして扱う。

|API名|概要|使用DataStore|使用FileStore|
|---|---|---|---|
|`applets`|Appletの取得、登録、更新|applet, block, appletgoodnum, appletstorestatus, appletpublicstatus| |
|`applets/{id}`| ID指定でのAppletの取得、削除|applet| |
|`createownapplets`| ユーザーの作成したAppletの取得|applet, appletgoodnum, appletstorestatus, appletpublicstatus| |
|`appletIcon`|Appletアイコンの登録、更新、削除|applet|appletIcon|
|`appletGoodNum`| Appletのイイネ！の数の取得、登録、更新|applet, appletgoodnum| |
|`appletPublicStatus`| Appletの公開ステータスの取得、登録、更新|applet, appletpublicstatus| |
|`appletStoreStatus`| Applet審査ステータスの取得、登録、更新|applet, appletstorestatus| |

## フォルダ構造

- `/api/controllers` swagger.yamlの定義に沿ったcontrollter
- `/api/swagger/swagger.yaml` API定義ファイル
- `/config` 設定ファイル
- `/lib` 認証およびDodaiへの処理をまとめたライブラリ
- `/test` Test用フォルダ。`npm test`で実行

## Dodai Appの準備
 Collectionの作成はBlock Serverのnpm-scriptを参考に用意する。
