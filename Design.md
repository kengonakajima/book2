# Vol.2の内容どうするか

誰でも簡単にマルチプレイゲームを作れるようになるための本ではなく、
マルチプレイゲームをなんとなく作れる人が、
それを支えている技術を正確に理解できるようにするための本。


冒頭で、ゲームのタイプごとの典型的パターンを列挙する。
そのリストの中で出てくる概念を、vol1とvol2をあわせて説明できていればOK。


1. Pattern.md で一覧を示す。



2. ネットワークプログラミング再訪 (旧案2そのまま)


Vol.1では、ソケットAPIをざっと。TCPだけを取り出して、socket,connect,bind,listen,accept,read,write,select
など基本的なのだけ解説していた。また、プログラミング言語について簡単に紹介しただけだった。
IPv6とUDPの例がないのと、TCPとUDPの使い分けについて詳しい説明がなかった。

2.0. モバイル時代におけるトランスポート層の課題

TCPの限界が来ている問題と、それをUDPで解決する方法について、
実際にツールを使って測定しながら、詳しく述べる。

2.1. TCPプログラミング

   UDPへの移行期とはいえ、TCPは使いやすいし、まだまだ活用できる。OSの機能をフル活用しよう。

2.2. UDPプログラミング(RUDP)
RUDPの基礎, 独自のRUDPを実装してみる。QUICの詳しい説明.

2.2 IPv6プログラミング
ゲームではIPv6の高度な機能はほぼ使う必要がない。意外とやることがないIPv6対応。
- IPv6
- NAT64,DNS64

2.3. P2Pプログラミング, NATトラバーサル
libiceを用いてやってもいいが、何も依存しなくても短いコードでNATトラバーサルはできるので、
そのサンプルを例示するかな？

2.4. ネットワークプログラムのデバッグと調査のツール
linuxのtcを徹底活用する。Clumsy, Windowsでの調査
iOSやAndroidにおける実機を用いたテスト


2.5. ネットワーク負荷テストの実際
2.6. ネットワークプログラミングの言語比較
C, Node.js, C#, Go, Ruby

2.7. Linux システムプログラミング
kernel 3.0 以降の新しいシステムコール

3. ブラウザネットワークプログラミング
WebSocket, HTTP3, WebRTC, UDP Socket 比較, サンプル
サーバサイドの実装方法の選択肢を整理。
逆プロクシや変換器を用いる、用いない、etc
TLS 

4. 各アーキテクチャのサンプルコード
4.1 クラウドロジック、クラウド描画 (クラウドゲーミング・オンラインマルチプレイ)
中嶋が自作したoneframe.io でのサンプル、ネイティブからブラウザへのストリーミング。
クラウドゲームを支える技術では、映像を送る方式についてほとんど扱わなかった。
5Gでは映像を送信する方法が大幅に増えそうなので、本書でそれを扱う。
ゲーム画面とオーディオをキャプチャし、映像と音を同期して正確に遅れを減らして伝えて再生する方法について、
詳しく解説する。libffmpegを用いたサンプル。Parsecと似たことをするためのしくみ。
映像をブラウザに向けて大量配信する場合の基本的な設計。

4.2 クラウドロジック、ローカル描画(MMO/CS)
- ブラウザ
- ネイティブ
4.3 リモートロジック、ローカル描画
- CSリレーMO(ブラウザ)
- P2PリレーMO(ブラウザWebRTC)
- P2PリレーMO(ネイティブ)

4.4 ローカルロジック、ローカル病が(オフラインマルチプレイ)　これは本書では扱う必要がない。省略


5. クラウドインフラの活用

5.1 クラウドインフラの現状の総括 (全部入りサービス vs シンプル系サービス)
AWS,Azure,GCP,Linode,DigitalOcean,さくらやニフクラなどのインフラ業者について、
何ができるかできないか、大手系とシンプル系と日本系、中国系などの試し方や基本情報をおさらいする。

5.2. ベースとなる仮想マシン、ネットワークの物理性能を正確に測定する方法。

5.3 コンテナ (オーケストレーション)
クラウドインフラを使う場合のオンラインゲームにおける典型的な構成方法を紹介する。
Webサービスにおけるコンテナの利用は別の本でやっているので、
Webサービスにおける典型的な手法にリアルタイムサーバをどう追加するか、という方法で説明。
ステートフルなリアルタイムサーバとステートレスバックエンドサービスのつなぎこみ方.


6. ゲームエンジンの活用
ゲームエンジンに組み込みのネットワーク機能がどうなってるかの解説と比較
- Unity
- UE4

7. ゲームプレイ空間の同期方法の整理

同期方法のサンプルで同期方法を切り替えれるようにして示したい (Sync.md)

8. 開発効率と自動化
CIのうまいやり方、さじ加減の評価




オンラインゲームシステムの時間的発達に合わせた設計 : プロジェクトがゼロの状態から完成品まで、どのようにプロダクトを発達させていくかの体系化


多くの言語を使う場合のinterop
言語ごとのI/O性能の特性　評価


ヘッドレスモードのサーバーを大量にスケールさせる方法の整理