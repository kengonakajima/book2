# ゲーム開発におけるRPCの濃淡

コンパイル言語(C#,C++,C,Rust,Go)におけるRPCのあり方、最小構成
C言語コードで例示。同じことは他の言語でもできる。

```
int get_u32(const char *buf); // 指定したメモリアドレスから32ビットの整数を読み込む
void set_u32(char *buf, int v); // 指定したメモリアドレスに32ビットの整数を書き込む
void send_GameObjectMoved(int id, int x, int y, int z) {
  char buf[20];
  set_int_32(buf,0x1);  
  set_int_32(buf+4,id);
  set_int_32(buf+8,x);
  set_int_32(buf+12,y);
  set_int_32(buf+16,z);  
  send(socket,buf,20);
}
```

以下が受信側

```
void on_read_data(char *input, int len) {
  int func_id = get_int_32(input);
  switch(func_id) {
  case 0x01: {
  
    }
    break;
  }  
}
```

1. 送信関数を手動で書き、受信側は単純なswitchで分岐する。
2. 1を任意の関数を何通りかの







--------以下メモ


RPCは Remote Procedure Call の略称である。 Remote(離れた) Procedure(手続き) Call(呼び出し)。

手続きとは関数のことである。

RPCはプロセス間通信のひとつの方法である。

プロセスにおける関数の呼び出しを何らかの方法でマシンに依存しないバイト列に変換(シリアライズ)して、
それをソケットを使って送信し、受信した側のプロセスでバイト列を解析して関数を呼び出す。


「何らかの方法」には、gRPCのような大規模で複雑なソースコード生成モジュールを使う方法から、
ほんの数行のコードで書け、外部のライブラリを一切必要としないような極端に簡素なものまで、さまざまな濃淡がある。

また、JSONのように人間に見やすいけれどもCPU消費量の多いエンコーディング方式から、
flatbuffersのような解析にプログラムを使う必要があるが高速なバイナリフォーマットまで、
さまざまな選択肢がある。

基本的には、実装しようとしてるゲームの通信内容が複雑で多様になるほど、複雑で多機能なRPCのしくみが必要になる。

高機能なものは、送信データ量の圧縮機能、構造体や配列、文字列など複合的な型の送信、
多種多様な言語スタブコードの自動生成、統計データの取得など多くの機能をもつ。

ざっくりいうと、スタブコードを自動生成するものとしないものに分けられる。
狭い定義では、スタブコードを自動生成するツールを含むものを、RPCシステムと呼ぶ


ゲーム
1. 送信関数を手動で書き、受信側は単純なswitchで分岐する。
2. 1を任意の関数を何通りかの



ゲームにおける通信はUDPまたはTCPをソケット経由で使う。

IPv4またはIPv6においては、データはすべて細切れのパケット単位で送信される。
UDPの層ではデータグラム単位で送信し、それをIPの層に変換するときに複数のIPのパケットに分割して送信され、
受信側で再構築され、データグラムに戻される。
TCPはストリーム指向なので1バイトから何GBという任意の単位で送信できるが、システムが適当な大きさのIPのパケット(TCPではセグメントと呼ぶ)
に分割して送信し、受信側で再構築してアプリケーションに渡される。

ゲームでは、数バイトから数KBのデータを
UDPでもTCPでも、データはバイナリデータの塊として送信される。
送り元で 150バイトの塊を送信する
gRPCなどに代表される


