send_ping=function(target,val)
{
 var _totlen=0;
 _totlen+=4; // val;
 var _ab=new ArrayBuffer(_totlen+2);
 var _dv=new DataView(_ab);
 var _ofs=0;
 _dv.setUint16(_ofs,1,true); _ofs+=2;
 _dv.setInt32(_ofs,val|0,true); _ofs+=4;
 target.send(_ab)
}
send_login=function(target,name)
{
 var _totlen=0;
 var u8ary_name=utf8string2uint8array(name);
 if(u8ary_name.length>255) { console.warn("string too long:",name); return; }
 _totlen+=1+u8ary_name.length;
 var _ab=new ArrayBuffer(_totlen+2);
 var _dv=new DataView(_ab);
 var _ofs=0;
 _dv.setUint16(_ofs,2,true); _ofs+=2;
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
 var _ab=new ArrayBuffer(_totlen+2);
 var _dv=new DataView(_ab);
 var _ofs=0;
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
 var _ab=new ArrayBuffer(_totlen+2);
 var _dv=new DataView(_ab);
 var _ofs=0;
 _dv.setUint16(_ofs,6,true); _ofs+=2;
 _dv.setInt32(_ofs,to_x|0,true); _ofs+=4;
 _dv.setInt32(_ofs,to_y|0,true); _ofs+=4;
 target.send(_ab)
}
send_tryMove=function(target,dx,dy)
{
 var _totlen=0;
 _totlen+=4; // dx;
 _totlen+=4; // dy;
 var _ab=new ArrayBuffer(_totlen+2);
 var _dv=new DataView(_ab);
 var _ofs=0;
 _dv.setUint16(_ofs,9,true); _ofs+=2;
 _dv.setInt32(_ofs,dx|0,true); _ofs+=4;
 _dv.setInt32(_ofs,dy|0,true); _ofs+=4;
 target.send(_ab)
}
recv_binary_message = function(target,arybuf) {
 var _dv=new DataView(arybuf);
 var _func_id=_dv.getUint16(0,true);
 var _ofs=2;
 switch(_func_id) {
 case 1: { // ping
  var val=_dv.getInt32(_ofs,true); _ofs+=4;
  recv_ping(target,val);
 }; break;
 case 3: { // loginResult
  var name_len=_dv.getInt8(_ofs);
  _ofs++;
  var name_u8a=new Uint8Array(name_len);
  for(var i=0;i<name_len;i++) name_u8a[i]=_dv.getUint8(_ofs+i);
  var name=uint8array2utf8string(name_u8a);
  _ofs+=name_len;
  var result=_dv.getInt32(_ofs,true); _ofs+=4;
  var pc_entity_id=_dv.getInt32(_ofs,true); _ofs+=4;
  recv_loginResult(target,name,result,pc_entity_id);
 }; break;
 case 5: { // chat
  var text_len=_dv.getInt8(_ofs);
  _ofs++;
  var text_u8a=new Uint8Array(text_len);
  for(var i=0;i<text_len;i++) text_u8a[i]=_dv.getUint8(_ofs+i);
  var text=uint8array2utf8string(text_u8a);
  _ofs+=text_len;
  recv_chat(target,text);
 }; break;
 case 7: { // field
  var width=_dv.getInt32(_ofs,true); _ofs+=4;
  var height=_dv.getInt32(_ofs,true); _ofs+=4;
  var ground_len=_dv.getInt32(_ofs,true); _ofs+=4;
  var ground=new Int32Array(ground_len);
  for(var i=0;i<ground_len;i++) { ground[i]=_dv.getInt32(_ofs,true); _ofs+=4; }
  var obj_len=_dv.getInt32(_ofs,true); _ofs+=4;
  var obj=new Int32Array(obj_len);
  for(var i=0;i<obj_len;i++) { obj[i]=_dv.getInt32(_ofs,true); _ofs+=4; }
  recv_field(target,width,height,ground,obj);
 }; break;
 case 8: { // entity
  var id=_dv.getInt32(_ofs,true); _ofs+=4;
  var type=_dv.getInt32(_ofs,true); _ofs+=4;
  var x=_dv.getInt32(_ofs,true); _ofs+=4;
  var y=_dv.getInt32(_ofs,true); _ofs+=4;
  recv_entity(target,id,type,x,y);
 }; break;
 case 10: { // entityDelete
  var id=_dv.getInt32(_ofs,true); _ofs+=4;
  recv_entityDelete(target,id);
 }; break;
 default:console.log('invalid func_id:',_func_id);break;
 };
}