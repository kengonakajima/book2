rpcgen=require("./rpcgen.js");
Object.assign(global,rpcgen);


var defs= {
    login: { id:1, dir:C2S, args:{name:str8} },
    loginResult: { id:2, dir:S2C, args:{name:str8,result:i32} },    
    chat: { id:5, dir:BOTH, args:{text:str8} },
    move: { id:6, dir:C2S, args:{to_x:i32, to_y:i32} },
};

fs=require("fs");
var js_cl=rpcgen.generateJS(C2S,defs);
fs.writeFileSync("sample_cl.js",js_cl);
var js_sv=rpcgen.generateJS(S2C,defs);
fs.writeFileSync("sample_sv.js",js_sv);


