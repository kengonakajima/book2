exports.C2S="C2S";
exports.S2C="S2C";
exports.BOTH="BOTH";
exports.str8="str8";
exports.i32="i32";

jsSendFunc = function(funcname,def) {
    var out=[];
    var argnames=Object.keys(def.args);
    var arglist=argnames.join(",");
    out.push(`send_${funcname}=function(target,${arglist})`);
    out.push("{");
    out.push(" var _totlen=0;");
    // prepare
    argnames.forEach(function(argname,i) {
        var argtype=def.args[argname];
        if(argtype=="i32") {
            out.push(` _totlen+=4; // ${argname};`);
        } else if(argtype=="str8") {
            out.push(` var u8ary_${argname}=utf8string2uint8array(${argname});`);
            out.push(` if(u8ary_${argname}.length>255) { console.warn("string too long:",${argname}); return; }`);
            out.push(` _totlen+=1+u8ary_${argname}.length;`);
        }
    });

    // serialize
    out.push(" var _ab=new ArrayBuffer(_totlen+4);");
    out.push(" var _dv=new DataView(_ab);");        
    out.push(" var _ofs=0;");
    out.push(" _dv.setUint16(_ofs,_totlen,true); _ofs+=2;");
    out.push(` _dv.setUint16(_ofs,${def.id},true); _ofs+=2;`);
    argnames.forEach(function(argname,i) {
        var argtype=def.args[argname];
        if(argtype=="i32") {
            out.push(` _dv.setUint32(_ofs,${argname}|0,true); _ofs+=4;`);
        } else if(argtype=="str8") {
            out.push( ` _dv.setUint8(_ofs,u8ary_${argname}.length); _ofs+=1;` );
            out.push( ` for(var i=0;i<u8ary_${argname}.length;i++) _dv.setUint8(_ofs+i,u8ary_${argname}[i]);` );
            out.push( ` _ofs+=u8ary_${argname}.length;` );            
        }
    });
    out.push(" target.send(_ab)")
    out.push("}");
    return out;
}
exports.generateJS = function(dir,defs) {
    var out=[];
    Object.keys(defs).forEach(function(k,i) {
        var def=defs[k];
        if(def.dir==dir||def.dir==BOTH) {
            out=out.concat(jsSendFunc(k,def));
        }
    });

    return out.join("\n");
};
