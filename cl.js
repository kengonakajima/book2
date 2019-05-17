
var wsaddr = document.location.host.split(":")[0];
var g_ws=new WebSocket( "ws://"+wsaddr+":22222", ["game-protocol"]);
g_ws.binaryType = "arraybuffer";

g_ws.sendJSON = function(o) {
    this.send(JSON.stringify(o));
}
g_ws.onopen = function() {
    console.log("ws opened");
};
g_ws.onclose = function() {
    console.log("ws closed");
};
g_ws.onerror = function(error) {
    console.log("ws Error",error);
};
g_ws.onmessage = function (ev) {
    console.log("ev.data:",ev.data,ev);
    recv_binary_message(g_ws,ev.data);
};

recv_ping = function(conn,val) {
    console.log("recv_ping:",val);
    send_login(conn,"testuser");
}
recv_loginResult = function(conn,name,result) {
    console.log("recv_loginResult:",name,result);
}