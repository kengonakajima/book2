require("./sample_sv.js");
require("./util.js");
require("./game.js");
require("./moyai_common.js");
gl=require("./gl-matrix.js");

var WebSocket=require("ws");
var http=require("http");
var mysql=require("mysql");
var os=require("os");

var my_socketpath=null;
if(os.platform()=="linux") my_socketpath="/var/lib/mysql/mysql.sock";



/////

var g_web_port=3000;
var g_ws_port=22222;

console.log("gmsv started");

var ws_server = new WebSocket.Server({
    port: g_ws_port
});

var g_conns=[];

ws_server.on('connection', function(conn) {
    g_conns.push(conn);
    console.log((new Date()) + ' websocket connection accepted');
    
    conn.on("message", function(message) {
        var ab=nodeBufferToArrayBuffer(message);
        recv_binary_message(conn,ab);
    });
    conn.on("close", function(e) {
        console.log("close:",conn.pc);
        if(conn.pc) {
            console.log("KKKK",            g_entities.indexOf(conn.pc) );
            deleteEntity(conn.pc);
            conn.pc=null;
        }
        var conn_ind=g_conns.indexOf(conn);
        if(conn_ind>=0) g_conns.splice(conn_ind,1);
    });
    send_ping(conn,256);
});

// web server

express=require("express");
body_parser=require("body-parser");
helmet=require("helmet");
url=require("url");
//os=require("os");

var app = express();
app.use(helmet());
app.use(body_parser.urlencoded({extended: true}));
app.use("/assets", express.static("assets"));
app.use("/moyai", express.static("moyai"));
app.use("/cl.js", express.static("cl.js"));
app.use("/sample_cl.js", express.static("sample_cl.js"));
app.use("/util.js", express.static("util.js"));
app.use("/moyai.js", express.static("moyai.js"));
app.use("/moyai_common.js", express.static("moyai_common.js"));
app.use("/gl-matrix.js", express.static("gl-matrix.js"));
app.use("/base.png", express.static("base.png"));
app.use("/game.js", express.static("game.js"));


app.get("/", function(req, res, next){
    console.log("get /");
    res.sendFile( process.env.PWD + "/index.html" );
});


var web_server = app.listen(g_web_port, "0.0.0.0", function() {
    console.log("web server is listening on port:",web_server.address().port);
});

//////////



setInterval( gameUpdate,20 );
gameInit();


//////////////
sendEntity = function(conn,e) {
    send_entity(conn,e.id,e.type,e.loc[0],e.loc[1],e.state);
}
broadcastEntity = function(e) {
    for(var i=0;i<g_conns.length;i++) {
        if(g_conns[i].pc) sendEntity( g_conns[i],e);
    }
}
broadcastEntityDelete = function(e) {
    for(var i=0;i<g_conns.length;i++) {
        if(g_conns[i].pc) send_entityDelete( g_conns[i], e.id);
    }
}
broadcastLog= function(msg) {
    for(var i=0;i<g_conns.length;i++) {
        if(g_conns[i].pc) send_log( g_conns[i],msg);
    }
}
sendAllEntities = function(conn) {
    for(var i=0;i<g_entities.length;i++) sendEntity(conn,g_entities[i]);
}

recv_login = function(conn,name) {
    console.log("recv_login:",name);

    conn.pc=new PC(gl.vec2.fromValues(5,5),name);
    g_entities.push(conn.pc);

    
    send_loginResult(conn,name,1,conn.pc.id);
    send_field(conn,g_fld.width,g_fld.height,g_fld.ground,g_fld.obj);

    sendAllEntities(conn);
    broadcastEntity(conn.pc);    
}
recv_tryMove = function(conn,dx,dy) {
    console.log("trymove:",dx,dy);
    if(!conn.pc)return;
    if(conn.pc.tryMove(dx,dy)) {
        broadcastEntity(conn.pc);        
    }
}


