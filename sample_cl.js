send_login=function(target,name)
{
 var _totlen=0;
 var u8ary_name=utf8string2uint8array(name);
 if(u8ary_name.length>255) { console.warn("string too long:",name); return; }
 _totlen+=1+u8ary_name.length;
 var _ab=new ArrayBuffer(_totlen+4);
 var _dv=new DataView(_ab);
 var _ofs=0;
 _dv.setUint16(_ofs,_totlen,true); _ofs+=2;
 _dv.setUint16(_ofs,1,true); _ofs+=2;
 _dv.setUint8(_ofs,u8ary_name.length); _ofs+=1;
 for(var i=0;i<u8ary_name.length;i++) _dv.setUint8(_ofs+i,u8ary_name[i]);
 _ofs+=u8ary_name.length;
 target.send(_ab)
}
send_chat=function(target,text)
{
 var _totlen=0;
 var u8ary_text=utf8string2uint8array(text);
 if(u8ary_text.length>255) { console.warn("string too long:",text); return; }
 _totlen+=1+u8ary_text.length;
 var _ab=new ArrayBuffer(_totlen+4);
 var _dv=new DataView(_ab);
 var _ofs=0;
 _dv.setUint16(_ofs,_totlen,true); _ofs+=2;
 _dv.setUint16(_ofs,5,true); _ofs+=2;
 _dv.setUint8(_ofs,u8ary_text.length); _ofs+=1;
 for(var i=0;i<u8ary_text.length;i++) _dv.setUint8(_ofs+i,u8ary_text[i]);
 _ofs+=u8ary_text.length;
 target.send(_ab)
}
send_move=function(target,to_x,to_y)
{
 var _totlen=0;
 _totlen+=4; // to_x;
 _totlen+=4; // to_y;
 var _ab=new ArrayBuffer(_totlen+4);
 var _dv=new DataView(_ab);
 var _ofs=0;
 _dv.setUint16(_ofs,_totlen,true); _ofs+=2;
 _dv.setUint16(_ofs,6,true); _ofs+=2;
 _dv.setUint32(_ofs,to_x|0,true); _ofs+=4;
 _dv.setUint32(_ofs,to_y|0,true); _ofs+=4;
 target.send(_ab)
}