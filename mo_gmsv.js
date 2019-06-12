require("./moproto_sv.js");
require("./util.js");
require("./moyai_common.js");


var WebSocket=require("ws");
var http=require("http");
var os=require("os");


/////

var g_web_port=3000;
var g_ws_port=22222;

console.log("MO gmsv started");

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
        console.log("close:");
        var conn_ind=g_conns.indexOf(conn);
        if(conn_ind>=0) g_conns.splice(conn_ind,1);
    });
    send_ping(conn,256);
});

// web server

express=require("express");

var app = express();
app.use("/",express.static("./"));
app.get("/", function(req, res, next){
    res.sendFile( process.env.PWD + "/mo_index.html" );
});

var web_server = app.listen(g_web_port, "0.0.0.0", function() {
    console.log("web server is listening on port:",web_server.address().port);
});

//////////
var g_rooms={};
var g_room_id_gen=1;
recv_createRoom = function(conn) {
    conn.room={ id: g_room_id_gen, conn0:conn, conn1:null };
    g_rooms[conn.room.id]=conn.room;
    g_room_id_gen++;
    console.log("recv_createRoom. conn.room.id:",conn.room.id);
    send_createRoomResult(conn,conn.room.id);
}
recv_joinRoom = function(conn,roomid) {
    console.log("recv_joinRoom. roomid:",roomid);
    var room=g_rooms[roomid];
    if(!room) {
        console.log("roomid",roomid,"not found?");
        send_joinRoomResult(conn,-1,roomid);
        return;
    }
    if(room.conn1) {
        console.log("already joined");
        send_joinRoomResult(conn,-2,roomid);
        return;
    }
    room.conn1=conn;
    conn.room=room;
    console.log("joined room:",roomid);
    send_joinRoomResult(conn,0,roomid);
    send_joinNotify(room.conn0);    
}    
recv_command = function(conn,cmd,arg0,arg1,arg2,arg3) {
    console.log("recv_command",cmd,arg0,arg1,arg2,arg3);
    if(!conn.room) {
        console.log("no room yet");
        return;
    }
    if(conn == conn.room.conn0) {
        send_command(conn.room.conn1,cmd,arg0,arg1,arg2,arg3);        
    } else if(conn==conn.room.conn1) {
        send_command(conn.room.conn0,cmd,arg0,arg1,arg2,arg3);        
    } else {
        console.log("cant find destination");
    }
}
recv_leaveRoom = function(conn) {
    console.log("recv_leaveRoom");
    if(!conn.room) {
        console.log("no room");
        return;
    }
    if(conn==conn.room.conn0) {
        send_leaveRoomNotify(conn.room.conn1);
        for(var i=0;i<g_rooms.length;i++) {
            if(g_rooms[i].id==conn.room.id) {
                console.log("room found:",conn.room.id);
                g_rooms.splice(i,1);
                break;
            }
        }
    } else {
        send_leaveRoomNotify(conn.room.conn0);        
    }
}