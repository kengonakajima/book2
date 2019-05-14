# book2

「オンラインゲームを支える技術vol.2(予定)」のためのサンプルゲーム用レポジトリ。

vol.2(予定)では、ゲームの運用についてコンテナやマネージドサービスを使った例も紹介するが、
ここではその運用の対象となる各タイプのゲームのコードそのものの更新をする。

古いほうはここ <a href="https://github.com/kengonakajima/book">https://github.com/kengonakajima/book</a>

## 2011年の原作サンプルコードの問題
- 最近のmacOSでビルドが通らない。
- Visual Studio 2012以降でテストされていない。多分動かない
- RHEL6以降でテストされてない。動かないだろう
- 通信の基本部分のために、現在はメンテされていないプロプライエタリライブラリ"VCE"を使っている。
- hashmapなどをboostに依存している。
- クライアントがC++で書かれており、SDL1を使っている。これはもうサポートされていない。
- X11のxlibに依存している。これは古すぎるので使わないようにしたい。
- TCPのサンプルしかない。 現在多用されるUDPのサンプルがない。
- NATトラバーサルのサンプルと解説が省略されている。
- IPv6のサンプルとインフラの解説がない。
- 動いているサンプルが利用可能になっていない。
- MMOサンプル: gmsv以外のバックエンドプロセスを全部C++で書いている(dbsvは自動生成だが)。今はその必要がない。

## 設計(共通)
- MMOサンプルをRPCベースで実装し、MOサンプルをオブジェクト同期ベースで実装する。
実装方法が完全に違うので、2つに分けた構成にするのはそのままとする。
- MO/MMOともに、C++である必要がない。ブラウザで動く、WebGLサンプルでよい
- モバイル端末で操作可能な操作系にする(タップだけでOKとか)
- ソースコードを見ることができない製品に依存しない。
- ひとつのサンプルが全部で1000行か2000行以内に抑えたい。見渡せるようにしたいから。
- 数年後でもそのまま動いてるやつにしたい(できれば)
- でも、Unityのサンプルは必要

## MOサンプル(J multiplayer)の設計
MOサンプルは、UDPホールパンチを用いた純粋なP2P通信と、
UDPまたはTCPを用いたリレーサーバーを経由して通信をするClient/Serverタイプの両方でサンプル実装したい。
WebGLを使ったJavaScriptクライアントを使えば、WeRTCとWebSocketの両方で共通の描画部分を使って
かなり小さなゲームクライアントを実装できるはず。

しかし、WebRTCを使うと、WebRTCがUDP通信とNATトラバーサルのすべてを隠蔽してしまっているので、
UDPを使った通信を使ってみることはできるけど、中身を見てみることはできないという問題がある。
中を見て学ぶことができないと、ブラウザ用以外のP2P通信を実装する際の参考にならない。
よって、UDPとNATトラバーサルの中身を見れる、Node.jsを用いたNATトラバーサルとUDPを用いたホールパンチを実装する。

以上をまとめると、MOサンプルについては、以下を実装する。

- relaysv: websocketを用いたリレーサーバー(node)。
- signalsv: WebRTC用のシグナリングサーバー(node)
- JavaScriptクライアント(websocket/WebRTCを切替可能)
- NATトラバーサルのコマンドライン通信サンプル
- Unityクライアント(websocket/NATトラバーサルともに)


最もシンプルなのは、リレーサーバーを用いたMO

```
relaysv(node) - Internet - JS/WebGLクライアント
```

それとWebRTC

```
signalsv(node) -----          -----+
STUN server -------- Internet -----+-- JS/WebGLクライアント
TURN server---------          -----+
```

NATトラバーサルのnodeコマンドラインサンプル

```
signalsv(node) -----          -----+
STUN server -------- Internet -----+-- Node.jsクライアント
```

NATトラバーサルのUnityサンプル

```
signalsv(node) -----          -----+
STUN server -------- Internet -----+-- Unityクライアント
```

WebScoketのUnityサンプル

```
relaysv(node) -----  Internet  ------- Unityクライアント
```

ゲーム内容は、一斉に開始して爆弾を投げてほかのプレイヤーをはじきとばして、足場から落としたら勝ち。
足場がだんだん消えていくあれ。


## MMOサンプルの設計
- RPCのバイナリプロトコル定義をJavaScriptで記述し、JavaScript,C#のスタブソースを出力する。これはMOでも使えるなら使う。
ブラウザと通信するため、WebSocketおよびWebRTCのサンプルとして実装する
- クライアントはJavaScriptでWebGL描画を直接実装するものと、Unityによるものの2種類を実装する。
- フロントエンドサーバ(gmsv)はNode.jsで実装する
- バックエンドサーバ(auth,logなど)は全部一体にしてNode.jsでbackendsvとして実装する


```
mariadb - backendsv(node) - gmsv(node) - Internet - WebGLクライアント / Unityクライアント
```

ゲーム内容はKオンラインと同様MMORPGをベースとする。MOBがポップして、爆弾を投げて倒す。
倒すとGoldがたまっていく、ところまで。
KオンラインはNPCによるアイテムショップのサンプルコードが含まれていたが、
それはWebAPIを用いた実装をするのが普通なので削除・・するかどうか、作りながらかんがえる。


## RPCスタブジェネレータ
VCEのジェネレータは強力だったがオーバースペックだった。
かといってgRPCなどを使うと巨大すぎて中身を見るのが難しすぎる。
RPCも含めて全体の中身を見れるようにしたい。
そこで、極小のRPCスタブジェネレータを実装する。

元の版では、k.xmlで以下のように定義していた。floatは使われていなかった。

```	
    <!-- キャラクターログイン -->
    <method methname="login" prflow="c2s" >
      <param prtype="string" prname="characterName" prlength="100" />	  	  
    </method>
    <!--chat チャットで発言をする -->
    <method methname="chat" prflow="c2s" >
      <param prtype="string" prname="text" prlength="2000" />
    </method>
    <!--move キャラクターを移動させることの要求 -->
    <method methname="move" prflow="c2s" >
      <param prtype="int" prname="toX" />
      <param prtype="int" prname="toY" /> 	  
    </method>
```

構造体はCharacterItemだけで使っていて、enumは何種類かあった。
構造体とenumの出力はなくてもどうにかなる。
文字列と整数があればよい。ので、stringと intだけを関数の引数として使えるようなJavaScriptによる変換ツールを実装する。

JavaScriptで、上記を以下のようにJSONで定義できるようにする。

```
var protocolDef= {
 login: {
  direction: "c2s",
  args: [ "characterName:string" ]
 },
 chat: {
  direction: "c2s",
  args: [ "text:string" ]
 },
 move: {
  direction: "c2s",
  args: [ "toX:int", "toY:int" ]
 }
}
```
このJSONオブジェクトの中身を解析して、NodeやC#用のスタブコードを生成して使う。