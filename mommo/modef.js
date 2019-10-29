rpcgen=require("./rpcgen.js");
Object.assign(global,rpcgen);

var defs={
    ping: { id:1, dir:BOTH, args:{val:i32} },
    createRoom: {id:2, dir:C2S, args:{} },
    createRoomResult: {id:3, dir:S2C, args:{room_id:i32}},
    joinRoom: {id:4, dir:C2S, args:{room_id:i32}}, 
    joinRoomResult: { id:5, dir:S2C, args:{result:i32,room_id:i32}}, // result<0 when error, 0=ok
    joinNotify: {id:6, dir:S2C, args:{}}, // other player joined
    leaveRoom: {id:7, dir:C2S, args:{}},
    leaveRoomNotify: {id:8, dir:S2C, args:{}},
    command: {id:9, dir:BOTH, args:{cmd:i32,arg0:i32,arg1:i32,arg2:i32,arg3:i32}}, 
};

fs=require("fs");
var js_cl=rpcgen.generateJS(C2S,defs);
fs.writeFileSync("moproto_cl.js",js_cl);
var js_sv=rpcgen.generateJS(S2C,defs);
fs.writeFileSync("moproto_sv.js",js_sv);