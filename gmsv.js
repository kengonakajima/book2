require("./sample_sv.js");
require("./agent.js");
require("./util.js");
require("./game.js");

var WebSocket=require("ws");
var http=require("http");

var g_web_port=3000;
var g_ws_port=22222;

console.log("gmsv started");

//var http_server = http.createServer(function(request,response) {
//    console.log((new Date()) + ' Received HTTP request for ' + request.url);
//    response.writeHead(404);
//    response.end();    
//});
var ws_server = new WebSocket.Server({
    port: g_ws_port
//    httpServer: http_server,
//    autoAcceptConnections: false
});

//http_server.listen( g_ws_port, function() {
//    console.log((new Date()) + ' HTTP server is listening on port ' + g_ws_port );    
//});

var g_agents=[];

ws_server.on('connection', function(conn) {
//    if (request.requestedProtocols.indexOf('game-protocol') === -1) {
//        request.reject();
//        return;
//    }
    //    var connection = request.accept("game-protocol", request.origin );
    
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
}


g_fld=new Field();

