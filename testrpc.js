require("./util.js");
require("./mmoproto_cl.js");

var conn={send:function(ab) { console.log("sending:",ab); } };

send_move(conn,123,234);
send_login(conn,"ringo");