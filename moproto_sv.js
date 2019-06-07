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
send_createRoomResult=function(target,room_id)
{
 var _totlen=0;
 _totlen+=4; // room_id;
 var _ab=new ArrayBuffer(_totlen+2);
 var _dv=new DataView(_ab);
 var _ofs=0;
 _dv.setUint16(_ofs,3,true); _ofs+=2;
 _dv.setInt32(_ofs,room_id|0,true); _ofs+=4;
 target.send(_ab)
}
send_joinRoomResult=function(target,result,room_id)
{
 var _totlen=0;
 _totlen+=4; // result;
 _totlen+=4; // room_id;
 var _ab=new ArrayBuffer(_totlen+2);
 var _dv=new DataView(_ab);
 var _ofs=0;
 _dv.setUint16(_ofs,5,true); _ofs+=2;
 _dv.setInt32(_ofs,result|0,true); _ofs+=4;
 _dv.setInt32(_ofs,room_id|0,true); _ofs+=4;
 target.send(_ab)
}
send_syncObj=function(target,entity_id,type_id,x,y)
{
 var _totlen=0;
 _totlen+=4; // entity_id;
 _totlen+=4; // type_id;
 _totlen+=4; // x;
 _totlen+=4; // y;
 var _ab=new ArrayBuffer(_totlen+2);
 var _dv=new DataView(_ab);
 var _ofs=0;
 _dv.setUint16(_ofs,6,true); _ofs+=2;
 _dv.setInt32(_ofs,entity_id|0,true); _ofs+=4;
 _dv.setInt32(_ofs,type_id|0,true); _ofs+=4;
 _dv.setInt32(_ofs,x|0,true); _ofs+=4;
 _dv.setInt32(_ofs,y|0,true); _ofs+=4;
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
 case 2: { // createRoom
  recv_createRoom(target,);
 }; break;
 case 4: { // joinRoom
  var room_id=_dv.getInt32(_ofs,true); _ofs+=4;
  recv_joinRoom(target,room_id);
 }; break;
 case 6: { // syncObj
  var entity_id=_dv.getInt32(_ofs,true); _ofs+=4;
  var type_id=_dv.getInt32(_ofs,true); _ofs+=4;
  var x=_dv.getInt32(_ofs,true); _ofs+=4;
  var y=_dv.getInt32(_ofs,true); _ofs+=4;
  recv_syncObj(target,entity_id,type_id,x,y);
 }; break;
 case 7: { // leaveRoom
  recv_leaveRoom(target,);
 }; break;
 default:console.log('invalid func_id:',_func_id);break;
 };
}