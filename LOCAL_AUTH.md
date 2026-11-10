# ローカル認証

この設定は、ローカルのHTTP開発環境専用です。
公開環境でそのまま使用するものではありません。

http://localhost:4200 を開き、Angularの `/api` プロキシ経由でBackendへアクセスしてください。

`localhost` とIPアドレスのURLを混在させないでください。
セッションCookieとCSRF Cookieはホスト単位で管理されるためです。

## 初回アカウントの作成

1. Java 17とMavenが利用できるターミナルで、`backend` ディレクトリから次を実行します。

```powershell
.\mvnw.cmd dependency:copy-dependencies '-DincludeScope=runtime' '-DoutputDirectory=target/hash-tool-lib'
java --class-path "target/hash-tool-lib/*" tools/HashPassword.java
```

Maven WrapperがMavenを見つけられない場合は、.\mvnw.cmd の代わりに mvn を使用してください。

実行すると、パスワードの入力を2回求められます。
入力内容は画面には表示されません。

強く、他サービスで使い回していないパスワードを入力してください。

このツールは、

{bcrypt}...

で始まる DelegatingPasswordEncoder 用のパスワードハッシュだけを出力します。

平文パスワードを、

* コマンドライン引数
* 環境変数
* SQL
* ファイル

に直接書かないでください。

bcryptの仕様上、パスワードはUTF-8で72バイトまでです。

2. リポジトリ直下の既存 .env に、次の2行を追加します。

.env はすでにGit管理対象外になっています。

```env
PLAYVEE_BOOTSTRAP_LOGIN_ID=owner
PLAYVEE_BOOTSTRAP_PASSWORD_HASH='{bcrypt}$2a$10$REPLACE_WITH_GENERATED_HASH'
```

PLAYVEE_BOOTSTRAP_PASSWORD_HASH には、先ほど生成した完全なハッシュ値を設定してください。

Composeでは $ が特別な意味を持つため、ハッシュ値はシングルクォートで囲みます。

.env はGitへコミットしないでください。

また、パスワードハッシュを公開したり、Composeで解決済みの環境変数をログへ出力したりしないでください。

実際の平文パスワードを、

* Git
* アプリケーションログ
* DB

に保存してはいけません。

3. リポジトリのルートで次を実行します。

```PowerShell
docker compose up -d --build
```

Hibernateによって app_users テーブルが追加されます。

このテーブルが完全に空の場合に限り、Bootstrap処理が初期アカウントを1件作成します。

既存ユーザーのパスワードを上書きしたり、論理削除済みユーザーを復元したりすることはありません。

Bootstrap用の2つの設定値は、省略することもできます。
その場合、初期アカウントは作成されません。

app_users テーブルが空の状態で、不正なBootstrap設定が渡された場合は、Backendの起動を失敗させます。

4. 次のURLからログインします。

http://localhost:4200/login

ログインできることを確認したら、.env から次の2つのBootstrap用変数を削除します。

```env
PLAYVEE_BOOTSTRAP_LOGIN_ID
PLAYVEE_BOOTSTRAP_PASSWORD_HASH
```

その後、Backendコンテナを作り直します。

```PowerShell
docker compose up -d --force-recreate backend
```

アカウント情報自体はPostgreSQLに残ります。

Backendを再起動するとセッションは失われるため、再ログインが必要です。

BackendをDocker外で起動する場合は、この2つのBootstrap用環境変数をBackendプロセスへ直接渡してください。

リポジトリ直下の .env は、Spring Bootから自動的には読み込まれません。

## 認証の動作
* セッションは、最後の操作から12時間で期限切れになります。
* セッション情報はBackendの再起動後には保持されません。
* JSESSIONID Cookieには HttpOnly と SameSite=Lax が設定されています。
* ローカル環境はHTTPのため、Secure は意図的に無効です。
* Angularは GET /api/auth/me を使ってログイン状態を復元します。
* パスワードや「ログイン済み」というフラグをlocalStorageには保存しません。
* 公園関連APIと写真画像URLはすべてログイン必須です。

CSRF対策も有効です。

GET /api/auth/csrf を呼ぶと、XSRF-TOKEN Cookieが発行されます。

Angularは、POSTやPUTなどの更新系リクエストに、

X-XSRF-TOKEN

ヘッダーを付けて送信します。

ログイン・ログアウトもCSRF保護の対象です。

ログイン後・ログアウト後はCSRFトークンが更新されるため、再取得します。

動作確認のためにCSRF保護を無効化しないでください。

認証APIは次の通りです。

## ログイン
POST /api/auth/login

application/x-www-form-urlencoded 形式で、

loginId
password

を送信します。

成功時：
HTTP 200

ログインIDまたはパスワードが正しくない場合：
HTTP 401

## ログイン状態確認

GET /api/auth/me

ログイン済みの場合、ユーザーIDとログインIDを返します。
パスワードハッシュは返しません。

## ログアウト

POST /api/auth/logout

セッションを破棄し、
HTTP 204を返します。

未ログイン状態で保護対象APIへアクセスした場合は、
HTTP 401を返します。

ログイン済みでも、CSRFトークンが不足している、または不正な状態で更新系APIを呼んだ場合は、
HTTP 403を返します。

失敗した更新リクエストを自動的に再送することはありません。

## 動作確認

1. シークレットブラウザを開き、次のような保護対象URLへ直接アクセスします。

/parks/new
/parks/1

ログイン画面へ移動することを確認します。

また、

/api/parks

や既存写真の画像URLへ直接アクセスした場合は、HTTP 401になることを確認します。

2. 間違ったパスワードでログインし、そのあと正しいパスワードでログインします。

最初はエラーが表示され、その後、公園一覧へ遷移することを確認します。

3. 公園詳細画面を再読み込みします。

セッションが維持されていることを確認します。

あわせて、次の既存機能が引き続き動くことを確認します。

* 公園登録
* 設備情報更新
* 写真アップロード
* 写真表示
* 地図表示

4. ブラウザのNetworkタブで確認します。

更新系APIリクエストに、
X-XSRF-TOKEN
ヘッダーが付いていることを確認します。

ログインリクエストのURLに、ログインIDやパスワードが含まれていないことを確認します。

/api/auth/me のレスポンスにパスワードハッシュが含まれていないことも確認します。

5. ログアウトし、保護対象URLへ再度アクセスします。

ログイン画面へ移動することを確認します。
次にBackendを再起動します。

再起動前から開いていたタブでAPI操作を行い、HTTP 401になってログイン画面へ戻ることを確認します。

失敗した更新処理が勝手に再実行されないことも確認します。

6. 論理削除済みのテストユーザーがログインできないことを確認します。

この確認は、破棄してもよいテストデータだけを使ってください。

Bootstrap処理は、論理削除済みユーザーを自動復元しません。

7. 自動テストを実行します。

Backend：
```PowerShell
mvn test
```

Frontend：
```PowerShell
npm test -- --watch=false
npm run build
```

SecurityのIntegration Testでは、開発用PostgreSQLではなく、分離されたH2データベースを使用します。

## 今後の別タスク

以下は、ローカル認証機能とは分けて対応します。

* HTTPS
* リバースプロキシ設定
* 公開ポートの制御
* ログイン試行回数制限
* 本番用Cookie設定
* 本番用DBスキーママイグレーション