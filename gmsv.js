require("./mmo_sv.js");
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

//////


// grant all privileges on mmosample.* to 'mmosample'@'localhost';
// create user "mmosample"@"localhost" identified with mysql_native_password by "mmosample";
var g_mysql_pool = mysql.createPool({
    host: "localhost" ,
    socketPath: my_socketpath,
    user: "mmosample",
    database: "mmosample",
    password: "mmosample",
    connectTimeout: 5*1000
});

function queryDB() {
    var arg0=arguments[0], arg1=arguments[1],arg2=arguments[2];
    g_mysql_pool.getConnection( function(err,conn) {
        if(err) {
            console.log("mysql getConnection error:",err);
            process.exit(1);
        } else {
            console.log("executing sql:",arg0,arg1);
            conn.query(arg0,arg1,arg2);
            conn.release();
        }
    });
}

queryDB("show tables",[],function(e,r,f) {
    console.log("mysql tables:",r);
    queryDB("create table if not exists characters (name varchar(100), kill_count int, walk_count int);",[],function(e,r,f) {
        if(e) console.log("create table failed:",e);
    });
});
saveCharacter = function(name,kill,walk) {
    queryDB("update characters set kill_count=?, walk_count=? where name=?",[kill,walk,name], function(e,r,f) {
        if(e)  console.log("update characters failed:",e);
    });
}


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
            saveCharacter(conn.pc.name,conn.pc.kill_count,conn.pc.walk_count);
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


var app = express();
app.use(helmet());
app.use(body_parser.urlencoded({extended: true}));
app.use("/assets", express.static("assets"));
app.use("/moyai", express.static("moyai"));
app.use("/cl.js", express.static("cl.js"));
app.use("/mmo_cl.js", express.static("mmo_cl.js"));
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
    
    queryDB("select * from characters where name=?",[name], function(e,r,f) {
        if(e) {
            console.log("load character error:",e) ;
            send_loginResult(conn,name,0,0);
            return;
        } 
        conn.pc=new PC(gl.vec2.fromValues(5,5),name);
        g_entities.push(conn.pc);
        
        if(r.length==1) {
            console.log("character",name,"found",r) ;
            conn.pc.kill_count=r[0].kill_count;
            conn.pc.walk_count=r[0].walk_count;
        } else {
            console.log("character",name," not fond, creating");
        }

        send_loginResult(conn,name,1,conn.pc.id);
        send_field(conn,g_fld.width,g_fld.height,g_fld.ground,g_fld.obj);
        sendAllEntities(conn);
        broadcastEntity(conn.pc);
        broadcastLog(`${name} joined. walk:${conn.pc.walk_count} kill:${conn.pc.kill_count}`);
    });
}
recv_tryMove = function(conn,dx,dy) {
    if(!conn.pc)return;
    if(conn.pc.tryMove(dx,dy)) {
        broadcastEntity(conn.pc);        
    }
}


