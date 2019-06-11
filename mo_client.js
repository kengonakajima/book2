
var wsaddr = document.location.host.split(":")[0];
var g_ws=new WebSocket( "ws://"+wsaddr+":22222", ["game-protocol"]);
g_ws.binaryType = "arraybuffer";
g_ws.onopen = function() {
    console.log("ws opened");
};
g_ws.onclose = function() {
    console.log("ws closed");
};
g_ws.onerror = function(error) {
    console.log("ws Error",error);
};

var g_debug_latency=0;
g_ws.onmessage = function (ev) {
    if(g_debug_latency>0) {
        setTimeout( function() {
            recv_binary_message(g_ws,ev.data);        
        },g_debug_latency);
    } else {
        recv_binary_message(g_ws,ev.data);                
    }
};



///////////
var g_gridcursor;
function setupGridCursor() {
    g_gridcursor = new Prop2D();
    g_gridcursor.setDeck(g_base_deck);
    g_gridcursor.setScl(20,20);
    g_gridcursor.setIndex(193);
    g_main_layer.insertProp(g_gridcursor);
}


function gameInit() {

    g_fld.generate = function() {
        for(var i=0;i<this.width*this.height;i++){
            this.ground[i]=GROUND_GRASS;
            var y=Math.floor(i/this.width), x=i%this.width;
            if((x==15 || x==16) ) {
                this.ground[i]=GROUND_WATER;
                if(y==4||y==5||y==18||y==19) this.ground[i]=GROUND_BRIDGE;
            }
            if( (x==0||y==0||x==31||y==23) && this.ground[i]!=GROUND_WATER ) this.obj[i]=OBJ_TREE;
        }
        for(var i=0;i<18;i++) {
            var x=irange(3,13), y=irange(1,23);
            this.obj[x+y*32]=OBJ_TREE;
            this.obj[(31-x)+y*32]=OBJ_TREE;                            
        }
        this.obj[2+11*32]=OBJ_RED_HOUSE;
        this.obj[(31-2)+11*32]=OBJ_BLUE_HOUSE;        
        console.log(this.dumpField());
    }
    g_fld.generate();
    
    g_field_prop=setupFieldGrid();

    setupGridCursor();
    
    setGameState("stopped");

    
}

var g_game_state;
function setGameState(state) {
    g_game_state=state;
    var e=document.getElementById("state");
    e.innerHTML = "Game " + state;
}
var g_game_role=undefined;
// role: "host" or "guest"
function setGameRole(role) {
    var color = (role=="host" ? "red" : "blue");
    var e=document.getElementById("role");
    e.innerHTML="Role: " + role + `(<span style='color:${color};'>${color}</span>)`;
    g_game_role=role;
}
function updateGameTurn() {
    var e=document.getElementById("turn").innerHTML="Turn: "+g_turn;
}
function updateSoldierLeft() {
    document.getElementById("redleft").innerHTML=`${g_soldier_left_red} left`;
    document.getElementById("blueleft").innerHTML=`${g_soldier_left_blue} left`;    
}
var g_soldier_left_red=0;
var g_soldier_left_blue=0;    
function gameUpdate() {

    // move soldier
    if(g_game_role=="host") {
        g_turn++;
        updateGameTurn();
        if(g_turn%120==0) {
            if(g_soldier_left_blue<10) g_soldier_left_blue++;
            if(g_soldier_left_red<10) g_soldier_left_red++;
            updateSoldierLeft();
        }
        for(var i=0;i<g_soldiers.length;i++) {
            var s=g_soldiers[i];
            var speedmod = 30 + s.damage * 30;
            if(s.moved_at < g_turn - speedmod) {
                s.tryMove();
                s.moved_at=g_turn;
            }
        }
    }
}
//////////////
function checkGridPuttable(gx,gy) {
    if(g_game_state!="started") {
        return false;        
    } else {
        if(g_game_role=="host" && gx>14){
            return false;
        } else if(g_game_role=="guest" && gx<17) {
            return false;
        } else {
            var cell=g_fld.getCell(gx,gy);
            if(cell && cell.obj) return false;
        }
    }
    return true;
}

function ind(x,y) {
    return x+y*32;
}
var g_route=new Int32Array(24*32); // 0:OK -1:obj, -2:soldier
function findRoute(fx,fy,tx,ty) {
    for(var i=0;i<24*32;i++) {
        g_route[i]=0;
        if(g_fld.ground[i]==GROUND_WATER) g_route[i]=-1;
        if(g_fld.obj[i]) g_route[i]=-1;
    }
//    for(var i=0;i<g_soldiers.length;i++) {
//        var s=g_soldiers[i];
//        g_route[ind(s.gx,s.gy)]=-2;
//    }
    g_route[ind(tx,ty)]=1; // starting point
    g_route[ind(fx,fy)]=0; // goal point
    for(var i=1;i<60;i++) {
        for(var y=1;y<23;y++) {
            for(var x=1;x<31;x++) {
                if(g_route[ind(x,y)]==0) {
                    if(g_route[ind(x+1,y)]==i) g_route[ind(x,y)]=i+1;
                    if(g_route[ind(x-1,y)]==i) g_route[ind(x,y)]=i+1;
                    if(g_route[ind(x,y+1)]==i) g_route[ind(x,y)]=i+1;
                    if(g_route[ind(x,y-1)]==i) g_route[ind(x,y)]=i+1;
                }
            }
        }
    }
    if(false) { // dump
        for(var y=0;y<24;y++) {
            var a=[];
            for(var x=0;x<32;x++) {
                a.push(g_route[ind(x,y)]);
            }
            console.log(a.join(" "));
        }
    }
    
    var from_route = g_route[ind(fx,fy)];
    var min_route=from_route;
    var u_route = g_route[ind(fx,fy+1)];
    var d_route = g_route[ind(fx,fy-1)];
    var l_route = g_route[ind(fx-1,fy)];
    var r_route = g_route[ind(fx+1,fy)];

    if(range(0,1)<0.5) {
        if(u_route>0 && u_route<min_route)min_route=u_route;
        if(d_route>0 && d_route<min_route)min_route=d_route;        
        if(l_route>0 && l_route<min_route)min_route=l_route;
        if(r_route>0 && r_route<min_route)min_route=r_route;
        if(min_route==u_route) return {x:0,y:1};
        if(min_route==d_route) return {x:0,y:-1};
        if(min_route==l_route) return {x:-1,y:0};
        if(min_route==r_route) return {x:1,y:0};        
    } else {
        if(r_route>0 && r_route<min_route)min_route=r_route;        
        if(l_route>0 && l_route<min_route)min_route=l_route;
        if(d_route>0 && d_route<min_route)min_route=d_route;        
        if(u_route>0 && u_route<min_route)min_route=u_route;
        if(min_route==r_route) return {x:1,y:0};
        if(min_route==l_route) return {x:-1,y:0};
        if(min_route==d_route) return {x:0,y:-1};
        if(min_route==u_route) return {x:0,y:1};
    }

    return {x:0,y:0};
}
var g_soldiers=[];
var g_soldier_id_gen=1;
class Soldier extends Prop2D {
    constructor(gx,gy,red,turn) {
        super();
        this.id=g_soldier_id_gen++;
        this.moved_at=turn;
        this.damage=0;
        this.red=red;
        this.setDeck(g_base_deck);
        this.setScl(20);
        this.setIndex(this.calcIndex());
        if(!red)this.setXFlip(true);
        this.gx=gx;
        this.gy=gy;
        g_soldiers.push(this);
        g_main_layer.insertProp(this);
    }
    prop2DPoll(dt) {
        this.setLoc( this.gx*20-SCRW/2+10, this.gy*20-SCRH/2+10);
        this.setIndex(this.calcIndex());
        return true;
    }
    calcIndex() {
        var base=72 + (this.red?0:1);
        return base + this.damage*2;
    }
    tryMove() {
        // first search enemy 3x3
        var cand=[];
        for(var i=0;i<g_soldiers.length;i++) {
            var s=g_soldiers[i];
            if(s.gx>=this.gx-1 && s.gx<=this.gx+1 && s.gy>=this.gy-1 && s.gy<=this.gy+1 && s.red != this.red ) {
                cand.push(s);
            }
        }
        if(cand.length>0) {
            var target = cand[irange(0,cand.length)];
            console.log("found enemy, attack!",target);
            target.damage++;
            send_command(g_ws, COMMAND_UPDATE_SOLDIER_DAMAGE, target.id, target.damage);
            if(target.damage>3) {
                send_command(g_ws, COMMAND_DELETE_SOLDIER, target.id);
                deleteSoldier(target);
            }
            return;            
        }
        
        // then move
        var goalx,goaly=11;
        if(this.red) {
            goalx=31-2;
        } else {
            goalx=2;
        }
        var to_move=findRoute(this.gx,this.gy,goalx,goaly);
        var nx=this.gx+to_move.x;
        var ny=this.gy+to_move.y;
        if(isSoldier(nx,ny))return;
        var cell=g_fld.getCell(nx,ny);
        if(!cell) console.log("NULL:",nx,ny);
        if(this.red && cell.obj==OBJ_BLUE_HOUSE) {
            g_fld.setObj(nx,ny,OBJ_BLUE_HOUSE_BROKEN);
            updateFieldGrid(g_field_prop);
            send_command(g_ws,COMMAND_SET_FIELD_OBJECT,nx,ny,OBJ_BLUE_HOUSE_BROKEN);
            return;
        } else if(!this.red && cell.obj==OBJ_RED_HOUSE) {
            g_fld.setObj(nx,ny,OBJ_RED_HOUSE_BROKEN);
            updateFieldGrid(g_field_prop);
            send_command(g_ws,COMMAND_SET_FIELD_OBJECT,nx,ny,OBJ_RED_HOUSE_BROKEN);            
            return;
        }
        this.gx=nx;
        this.gy=ny;
        send_command(g_ws,COMMAND_MOVED_SOLDIER,this.id,nx,ny)
    }
};
function getSoldierById(id) {
    for(var i=0;i<g_soldiers.length;i++) {
        if(g_soldiers[i].id==id)return g_soldiers[i];
    }
    return null;
}
function isSoldier(gx,gy) {
    for(var i=0;i<g_soldiers.length;i++) {
        if(g_soldiers[i] && g_soldiers[i].gx==gx && g_soldiers[i].gy==gy) {
            return true;
        }
    }
    return false;
}
function deleteSoldier(s) {
    for(var i=0;i<g_soldiers.length;i++) {
        if(g_soldiers[i]==s) {
            s.to_clean=true;
            g_soldiers.splice(i,1);
            return;
        }
    }
}
//////////////
function clickOnField(gx,gy) {
    if(!checkGridPuttable(gx,gy))return;
    if( isSoldier(gx,gy) )return;
    var is_red = (g_game_role=="host");
    console.log("clickOnField is_red:",is_red);
    if(is_red) {
        if(g_soldier_left_red>0) {
            g_soldier_left_red--;
            updateSoldierLeft();
            send_command(g_ws,COMMAND_UPDATE_SOLDIER_LEFT,g_soldier_left_red,g_soldier_left_blue);            
            var sl=new Soldier(gx,gy,is_red,g_turn);
            send_command(g_ws, COMMAND_CREATED_SOLDIER,sl.id,gx,gy,SOLDIER_RED);
        }
    } else {
        send_command(g_ws, COMMAND_PUT_SOLDIER, gx,gy);
    }
}
//////////////


var anim_cnt=0;
var last_anim_at = new Date().getTime();
var g_turn=0;

function animate() {
    anim_cnt++;
	requestAnimationFrame( animate );

    var x=g_mouse.cursor_pos[0]-SCRW/2;
    var y=SCRH/2-g_mouse.cursor_pos[1];
    var gx=Math.floor((x+SCRW/2)/20), gy=Math.floor((y+SCRH/2)/20);    
    if(g_mouse.getToggled(0)) {
        g_mouse.clearToggled(0);
        console.log("mousebutton0:",gx,gy);
        clickOnField(gx,gy);
    }
    if(g_touch.touching) {
        var x=g_touch.last_touch_pos[0]-SCRW/2;
        var y=SCRH/2-g_touch.last_touch_pos[1];
        console.log("touchat:",x,y);
    }
    if(g_gridcursor) {
        g_gridcursor.setLoc(gx*20-SCRW/2+10,gy*20-SCRH/2+10);
        var puttable=checkGridPuttable(gx,gy);
        g_gridcursor.setIndex(puttable?193:194);
    }

    //////
    var now_time = new Date().getTime();
    var dt = now_time - last_anim_at;
    last_anim_at = now_time;
    Moyai.poll(dt/1000.0);
    Moyai.render();

    if(g_game_state=="started" ) {
        gameUpdate();
    }
}

animate();

var g_fld=new Field(32,24);

gameInit();

////////////
function createRoomPressed() {
    send_createRoom(g_ws);
    setGameRole("host");    
}
function joinRoomPressed() {
    var roomid=parseInt(document.getElementById("roomid").value);
    send_joinRoom(g_ws,roomid);
    setGameState("waiting");
    setGameRole("guest");
}


///////////

COMMAND_GAMESTART = 1;
COMMAND_PUT_SOLDIER = 2;
COMMAND_CREATED_SOLDIER = 3;
COMMAND_MOVED_SOLDIER = 4;
COMMAND_SET_FIELD_OBJECT = 5;
COMMAND_DELETE_SOLDIER = 6;
COMMAND_UPDATE_SOLDIER_DAMAGE = 7;
COMMAND_UPDATE_SOLDIER_LEFT = 8;

SOLDIER_RED = 1;
SOLDIER_BLUE = 2;

recv_ping = function(conn,val) {
    appendLog("recv_ping:",val);
}
recv_createRoomResult = function(conn,roomid) {
    appendLog("recv_createRoomResult roomid:",roomid);
    setGameState("waiting");    
}
recv_joinRoomResult = function(conn,result,roomid) {
    appendLog("recv_joinRoomResult result:",result,"roomid:",roomid);
}
recv_joinNotify = function(conn) {
    appendLog("recv_joinNotify");
    send_command(conn, COMMAND_GAMESTART);
    setGameState("started");
    g_turn=0;
}
recv_command = function(conn,cmd,arg0,arg1,arg2,arg3) {
    appendLog("recv_command",cmd,arg0,arg1,arg2,arg3);        
    switch(cmd) {
    case COMMAND_GAMESTART:
        setGameState("started");
        g_turn=0;
        break;
    case COMMAND_PUT_SOLDIER:
        var gx=arg0, gy=arg1;
        if(g_soldier_left_blue>0) {
            g_soldier_left_blue--;
            updateSoldierLeft();
            send_command(conn,COMMAND_UPDATE_SOLDIER_LEFT,g_soldier_left_red,g_soldier_left_blue);
            var sl=new Soldier(arg0,arg1,false,g_turn);
            send_command(conn,COMMAND_CREATED_SOLDIER,sl.id,gx,gy,SOLDIER_BLUE);
        }
        break;
    case COMMAND_CREATED_SOLDIER:
        var id=arg0, gx=arg1, gy=arg2, color=arg3;
        var sl=new Soldier(gx,gy,color==SOLDIER_RED,g_turn);
        sl.id=id;
        break;
    case COMMAND_MOVED_SOLDIER:
        var id=arg0, gx=arg1, gy=arg2;
        var sl=getSoldierById(id);
        if(sl) {
            sl.gx=gx;
            sl.gy=gy;
        }
        break;
    case COMMAND_SET_FIELD_OBJECT:
        var gx=arg0, gy=arg1, index=arg2;
        g_fld.setObj(gx,gy,arg2);
        updateFieldGrid(g_field_prop);
        break;
    case COMMAND_DELETE_SOLDIER:
        var id=arg0;
        console.log("deletesol:",id);
        var s=getSoldierById(id);
        deleteSoldier(s);
        break;
    case COMMAND_UPDATE_SOLDIER_DAMAGE:
        var id=arg0, damage=arg1;
        console.log("updatedamage:",id,damage);
        var s=getSoldierById(id);
        if(s) s.damage=damage;
        break;
    case COMMAND_UPDATE_SOLDIER_LEFT:
        g_soldier_left_red=arg0;
        g_soldier_left_blue=arg1;
        updateSoldierLeft();
        break;
    default:
        appendLog("invalid command");
        break;
    }



}