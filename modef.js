rpcgen=require("./rpcgen.js");
Object.assign(global,rpcgen);

var defs={
    ping: { id:1, dir:BOTH, args:{val:i32} },
    createRoom: {id:2, dir:C2S, args:{} },
    createRoomResult: {id:3, dir:S2C, args:{room_id:i32}},
    joinRoom: {id:4, dir:C2S, args:{room_id:i32}},
    joinRoomResult: { id:5, dir:S2C, args:{result:i32,room_id:i32}},
    syncObj: {id:6, dir:BOTH, args:{entity_id:i32, type_id:i32, x:i32, y:i32}},
    leaveRoom: {id:7, dir:C2S, args:{}},
};

fs=require("fs");
var js_cl=rpcgen.generateJS(C2S,defs);
fs.writeFileSync("moproto_cl.js",js_cl);
var js_sv=rpcgen.generateJS(S2C,defs);
fs.writeFileSync("moproto_sv.js",js_sv);