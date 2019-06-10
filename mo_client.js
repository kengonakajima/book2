
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
    
    setupFieldGrid();

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
    var col = (g_game_role=="host" ? "red":"blue");
    document.getElementById(col+"left").innerHTML=`${g_soldier_left} left`;
}
var g_soldier_left=0;
function gameUpdate() {
    g_turn++;
    updateGameTurn();
    if(g_turn%120==0) {
        g_soldier_left++;
        if(g_soldier_left>10) g_soldier_left=10;
        updateSoldierLeft();
    }
    
}
//////////////
function clickOnField(gx,gy) {
    console.log("clickOnField:",gx,gy);
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
        console.log("mousebutton0:",x,y);
        clickOnField(gx,gy);
    }
    if(g_touch.touching) {
        var x=g_touch.last_touch_pos[0]-SCRW/2;
        var y=SCRH/2-g_touch.last_touch_pos[1];
        console.log("touchat:",x,y);
    }
    if(g_gridcursor) {
        g_gridcursor.setLoc(gx*20-SCRW/2+10,gy*20-SCRH/2+10);
        var cant=false;
        if(g_game_state!="started") {
            cant=true;
        } else {
            if(g_game_role=="host" && gx>14){
                cant=true;
            } else if(g_game_role=="guest" && gx<17) {
                cant=true
            }
        }
        g_gridcursor.setIndex(cant?194:193);
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
    send_gameStart(conn);
    setGameState("started");
    g_turn=0;
}
recv_gameStart = function(conn) {
    appendLog("recv_gameStart");
    setGameState("started");
    g_turn=0;    
}