rpcgen=require("./rpcgen.js");
Object.assign(global,rpcgen);


var defs= {
    ping: { id:1, dir:BOTH, args:{val:i32} },
    login: { id:2, dir:C2S, args:{name:str8} },
    loginResult: { id:3, dir:S2C, args:{name:str8,result:i32} },    
    chat: { id:5, dir:BOTH, args:{text:str8} },
    move: { id:6, dir:C2S, args:{to_x:i32, to_y:i32} },
    field: { id:7, dir:S2C, args:{width:i32, height:i32, ground:i32ary, obj:i32ary } }
};

fs=require("fs");
var js_cl=rpcgen.generateJS(C2S,defs);
fs.writeFileSync("sample_cl.js",js_cl);
var js_sv=rpcgen.generateJS(S2C,defs);
fs.writeFileSync("sample_sv.js",js_sv);


