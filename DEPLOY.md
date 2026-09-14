# Playvee デプロイ手順

## 本番環境

- URL: https://playvee.saya-dev.net
- VPS: さくらVPS
- ソース: `~/playvee`
- Angular配置先: `/var/www/playvee`
- Spring Boot: Docker `playvee-backend`
- PostgreSQL: Docker `playvee-postgres`
- Playvee backend: `127.0.0.1:8081`
- nginx: VPSホスト上で稼働
- HTTPS: Certbot

## 基本の流れ

### 1. ローカルで変更をGitHubへpush

```bash
git add ...
git commit -m "..."
git push
```

### 2. VPSでソース更新

```bash
cd ~/playvee
git pull
```

---

## Backendを変更した場合

VPSで実行する。

```bash
cd ~/playvee

docker compose \
  --env-file .env.prod \
  -f docker-compose.vps.yml \
  build backend

docker compose \
  --env-file .env.prod \
  -f docker-compose.vps.yml \
  up -d backend
```

起動確認：

```bash
docker compose \
  --env-file .env.prod \
  -f docker-compose.vps.yml \
  ps
```

必要ならログ確認：

```bash
docker logs --tail 100 playvee-backend
```

---

## Frontendを変更した場合

### 1. ローカルPCでAngularをビルド

```cmd
cd C:\private-apps\playvee\frontend
npm run build
```

生成物：

```text
C:\private-apps\playvee\frontend\dist\frontend\browser
```

### 2. VPSに一時転送

VPS側：

```bash
rm -rf /tmp/playvee-frontend
mkdir -p /tmp/playvee-frontend
```

ローカルPC：

```cmd
scp -r C:\private-apps\playvee\frontend\dist\frontend\browser\* debian@153.126.195.236:/tmp/playvee-frontend/
```

### 3. nginx配信ディレクトリへ反映

VPS：

```bash
sudo rm -rf /var/www/playvee/*
sudo cp -a /tmp/playvee-frontend/. /var/www/playvee/
```

ブラウザで確認：

```text
https://playvee.saya-dev.net
```

---

## Backend + Frontend両方を変更した場合

1. ローカルで `git push`
2. VPSで `git pull`
3. Backendをbuild → 起動
4. ローカルでAngularをbuild
5. Angular生成物をVPSへ転送
6. `/var/www/playvee` へ配置
7. ブラウザで動作確認

---

## 注意

### DB・写真データを消さない

本番環境では、理由なく以下を実行しない。

```bash
docker compose down -v
```

`-v` を付けると、PostgreSQLや写真のDocker Volumeを削除する可能性がある。

### .env.prod

VPSの

```text
~/playvee/.env.prod
```

に本番用DB情報を保存している。

Gitにはコミットしない。

権限：

```text
-rw-------
```

### 初期ユーザー

初期ユーザーはすでにDBへ作成済み。

`PLAYVEE_BOOTSTRAP_LOGIN_ID`
`PLAYVEE_BOOTSTRAP_PASSWORD_HASH`

は本番 `.env.prod` から削除済み。

### 既存のおてペイを壊さない

同じVPS上でおてペイも稼働している。

- おてペイ backend: port 8080
- Playvee backend: `127.0.0.1:8081`
- nginxの80/443はホスト側で共用

Playveeの作業時に、おてペイのコンテナ・nginx設定・DBを変更しない。