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
    out.push(` _dv.setUint16(_ofs,${def.id},true); _ofs+=2;`);
    argnames.forEach(function(argname,i) {
        var argtype=def.args[argname];
        if(argtype=="i32") {
            out.push(` _dv.setInt32(_ofs,${argname}|0,true); _ofs+=4;`);
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
jsRecvSwitch=function(defs) {
    var out=[];
    out.push("recv_single_message = function(target,arybuf) {");
    out.push(" var _dv=new DataView(arybuf);");
    out.push(" var _func_id=_dv.getUint16(0,true);");
    out.push(" var _ofs=0;");
    out.push(" switch(_func_id) {");
    Object.keys(defs).forEach(function(funcname,i) { 
        var def=defs[funcname];
        out.push(` case ${def.id}: { // ${funcname}`);
        var argnames=Object.keys(def.args);
        argnames.forEach(function(argname,j) {
            var argtype=def.args[argname];
            if(argtype=="i32") {
                out.push(`  var ${argname}=_dv.getInt32(_ofs,true);`);
            } else if(argtype=="str8") {
                out.push(`  var ${argname}_len=_dv.getInt8(_ofs);` );
                out.push(`  _ofs++;`);
                out.push(`  var ${argname}_u8a=new Uint8Array(${argname}_len);`);
                out.push(`  for(var i=0;i<${argname}_len;i++) ${argname}_u8a[i]=_dv.getUint8(_ofs+i);`);
                out.push(`  var ${argname}=uint8arraytostring(${argname}_u8a);`);
                out.push(`  _ofs+=${argname}_len;`);                
            }
        });
        out.push(`  recv_${funcname}(${argnames.join(',')});`);
        out.push(" }; break;");
        console.log("nnnn:",funcname);
    });
    out.push(" default:console.log('invalid func_id:',func_id);break;");
    out.push(" };");
    out.push("}");
    /*
    MrsBuffer.prototype.parseRecord = function() {
        if( this.used < 4 ) return false;
        var record_len = this.dv.getUint32(0,true);
        if( this.used <4+record_len) return false;
        var payload_len = record_len-4-2-2;
        var seqnum = this.dv.getUint32(4,true);
        var options = this.dv.getUint16(4+4,true);
        var payload_type = this.dv.getUint16(4+4+2,true);
        var u8a=new Uint8Array(this.dv.buffer.slice(4+4+2+2,4+4+2+2+payload_len));
        this.shift(record_len+4);
        if(this.used>512*1024) {
            console.log("mrs: recv buffer too much data:", this.used, "expect_record_len:",record_len);
            this.used=0;
        }
        return {seqnum:seqnum, options:options,payload_type:payload_type,payload:u8a};
    }
    */
    console.log("recvdefs:",defs);
    return out;
}

exports.generateJS = function(dir,defs) {
    var out=[];
    var recvdefs={};
    Object.keys(defs).forEach(function(k,i) {
        var def=defs[k];
        if(def.dir==dir||def.dir==BOTH) {
            out=out.concat(jsSendFunc(k,def));
        } else {
            recvdefs[k]=def;
        }
    });    
    out=out.concat(jsRecvSwitch(recvdefs));
    return out.join("\n");
};
