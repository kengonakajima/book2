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
send_joinNotify=function(target,)
{
 var _totlen=0;
 var _ab=new ArrayBuffer(_totlen+2);
 var _dv=new DataView(_ab);
 var _ofs=0;
 _dv.setUint16(_ofs,6,true); _ofs+=2;
 target.send(_ab)
}
send_leaveRoomNotify=function(target,)
{
 var _totlen=0;
 var _ab=new ArrayBuffer(_totlen+2);
 var _dv=new DataView(_ab);
 var _ofs=0;
 _dv.setUint16(_ofs,8,true); _ofs+=2;
 target.send(_ab)
}
send_command=function(target,cmd,arg0,arg1,arg2,arg3)
{
 var _totlen=0;
 _totlen+=4; // cmd;
 _totlen+=4; // arg0;
 _totlen+=4; // arg1;
 _totlen+=4; // arg2;
 _totlen+=4; // arg3;
 var _ab=new ArrayBuffer(_totlen+2);
 var _dv=new DataView(_ab);
 var _ofs=0;
 _dv.setUint16(_ofs,9,true); _ofs+=2;
 _dv.setInt32(_ofs,cmd|0,true); _ofs+=4;
 _dv.setInt32(_ofs,arg0|0,true); _ofs+=4;
 _dv.setInt32(_ofs,arg1|0,true); _ofs+=4;
 _dv.setInt32(_ofs,arg2|0,true); _ofs+=4;
 _dv.setInt32(_ofs,arg3|0,true); _ofs+=4;
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
 case 7: { // leaveRoom
  recv_leaveRoom(target,);
 }; break;
 case 9: { // command
  var cmd=_dv.getInt32(_ofs,true); _ofs+=4;
  var arg0=_dv.getInt32(_ofs,true); _ofs+=4;
  var arg1=_dv.getInt32(_ofs,true); _ofs+=4;
  var arg2=_dv.getInt32(_ofs,true); _ofs+=4;
  var arg3=_dv.getInt32(_ofs,true); _ofs+=4;
  recv_command(target,cmd,arg0,arg1,arg2,arg3);
 }; break;
 default:console.log('invalid func_id:',_func_id);break;
 };
}