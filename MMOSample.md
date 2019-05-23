# MMOGサンプルの使い方


あとでMMOサンプルとMOサンプルに分割する予定です。
いまは、全部がbook2/に入っています。


## MMOGサンプルの動作中画面(2人でプレイ中)

<img src="./mmosample.png">

画面に10体までのスケルトンがうろついています。プレイヤーは矢印キーまたはW/A/S/Dキーで移動し、
スケルトンを1回押すと、倒すことができます。

## MMOGサンプルに必要なもの

- macOS 10.14
   - Node.js (v11.13.0で確認, npm 6.9.0)
   - MySQL (brew infoで stable 8.0.16)
   

## ゲームサーバー起動前のMySQLの準備(macOS)

1. MySQLサーバーを起動 ```mysql.server start```
2. SQLを発行し、mmosampleデータベースを作成 ```create database mmosample```
3. mmosampleユーザーを作成

```
create user "mmosample"@"localhost" identified with mysql_native_password by "mmosample";
grant all privileges on mmosample.* to 'mmosample'@'localhost';
```

ここでのパスワードはソースコードにハードコードされているので上記と一致している必要があります。

## ゲームサーバー起動

1. git clone book2    
2. cd book2/
3. npm i
4. npm install nodemon
5. nodemon start  # MySQLの接続が重要。エラーがでなかったら接続成功している。
6. ブラウザをひらいて、http://localhost:3000 にアクセス。
7. Login name: というプロンプトで任意の名前を入力。パスワード認証は実装していない
8. プレイ開始


