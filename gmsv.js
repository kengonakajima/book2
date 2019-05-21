require("./sample_sv.js");
require("./agent.js");
require("./util.js");
require("./game.js");
require("./moyai_common.js");
gl=require("./gl-matrix.js");

var WebSocket=require("ws");
var http=require("http");

var g_web_port=3000;
var g_ws_port=22222;

console.log("gmsv started");

var ws_server = new WebSocket.Server({
    port: g_ws_port
});

var g_agents=[];

ws_server.on('connection', function(conn) {
    console.log((new Date()) + ' websocket connection accepted');
    
    var cl = new Agent(conn);
    g_agents.push(cl);
    conn.cl=cl;
    conn.on("message", function(message) {
        console.log("message:",message);
        var ab=nodeBufferToArrayBuffer(message);
        console.log("binary message:",ab );
        recv_binary_message(conn,ab);
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

recv_login = function(conn,name) {
    console.log("recv_login:",name);
    send_loginResult(conn,name,1);
    send_field(conn,g_fld.width,g_fld.height,g_fld.ground,g_fld.obj);
}


g_fld=new Field(32,24);
g_fld.generate();

g_entities=[];

setInterval(function() {
    var max_entities=30;
    if(g_entities.length<max_entities) {
        var lc=gl.vec2.fromValues(irange(0,g_fld.width), irange(0,g_fld.height));
        var skel=new Skeleton(lc);
        console.log("newskeleton!",skel);
        g_entities.push(skel);
    }
}, 1000 );
setInterval(function() {
    var nt=now();
    for(var i=0;i<g_entities.length;i++) {
        var e=g_entities[i];
        if(!e) {
            console.log("entity",i,"is null, clean");
            g_entities.splice(i,1);
            continue;
        }
        if(e.created_at < nt-10) {
            e.to_clean=true;
            console.log("entity",i,"timed out");
        }        
        if(e.to_clean) {
            console.log("entity",i,"is to clean");
            g_entities.splice(i,1);
            continue;
        }

    }
    
},20);