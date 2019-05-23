
var wsaddr = document.location.host.split(":")[0];
var g_ws=new WebSocket( "ws://"+wsaddr+":22222", ["game-protocol"]);
g_ws.binaryType = "arraybuffer";

g_ws.sendJSON = function(o) {
    this.send(JSON.stringify(o));
}
g_ws.onopen = function() {
    console.log("ws opened");
};
g_ws.onclose = function() {
    console.log("ws closed");
};
g_ws.onerror = function(error) {
    console.log("ws Error",error);
};
g_ws.onmessage = function (ev) {
//    console.log("ev.data:",ev.data,ev);
    recv_binary_message(g_ws,ev.data);
};

recv_ping = function(conn,val) {
    console.log("recv_ping:",val);
    appendLog("ping ok, connected to server.");
}
recv_loginResult = function(conn,name,result,pc_entity_id) {
    console.log("recv_loginResult:",name,result,pc_entity_id);
    g_pc_entity_id=pc_entity_id;
    appendLog(`login name: ${name} result: ${result}`);
    document.getElementById("inputname").innerHTML="";
}
recv_field = function(conn,width,height,ground,obj) {
    console.log("recv_field:",width,height,ground,obj);
    g_fld=new Field(width,height);
    g_fld.obj=obj;
    g_fld.ground=ground;
    setupFieldGrid();
}
recv_entity = function(conn,id,type,x,y,state) {
    console.log("recv_entity:",id,type,x,y,state);
    var e=findEntity(id);
    if(!e) {
        console.log("new entity");
        e=createEntity(id,type,x,y);
    } else {
        e.setFldLoc(x,y);
    }
    if(state==ENTITY_STATE_STANDING) {
        e.setUVRot(false);
    } else {
        e.setUVRot(true);
    }
}
recv_entityDelete = function(conn,id) {
    console.log("recv_entityDelete:",id);
    var e=findEntity(id);
    e.to_clean=true;
}
recv_log = function(conn,msg) {
    appendLog(msg);
}


////////////////////////////

var SCRW=640, SCRH=480;
Moyai.init(SCRW,SCRH);
var screen = document.getElementById("screen");
var canvas=Moyai.getDomElement();
screen.appendChild(canvas);

var g_keyboard = new Keyboard();
g_keyboard.setupBrowser(window,screen);
var g_mouse = new Mouse();
g_mouse.setupBrowser(window,screen);
var g_touch = new Touch();
g_touch.setupBrowser(window,screen);

var g_viewport = new Viewport();
g_viewport.setSize(SCRW,SCRH);
g_viewport.setScale2D(SCRW,SCRH);

var g_camera = new OrthographicCamera(-SCRW/2,SCRW/2,SCRH/2,-SCRH/2);
g_camera.setLoc(0,0);

var g_main_layer = new Layer();
Moyai.insertLayer(g_main_layer);
g_main_layer.setCamera(g_camera);
g_main_layer.setViewport(g_viewport);

var g_base_atlas = new Texture();
g_base_atlas.loadPNG( "./base.png", 256,256 );
g_base_deck = new TileDeck();
g_base_deck.setTexture(g_base_atlas);
g_base_deck.setSize(32,32,8,8 );
var g_base_deck = new TileDeck();
g_base_deck.setTexture(g_base_atlas);
g_base_deck.setSize(32,32,8,8);



////////////////////

var anim_cnt=0;
var last_anim_at = new Date().getTime();
var g_yellow_line_prim_id;

function animate() {
    anim_cnt++;
	requestAnimationFrame( animate );

    if(g_keyboard.getToggled("ArrowRight")) {
        g_keyboard.clearToggled("ArrowRight");
        send_tryMove(g_ws,1,0);
    }
    if(g_keyboard.getToggled("ArrowLeft")) {
        g_keyboard.clearToggled("ArrowLeft");
        send_tryMove(g_ws,-1,0);
    }
    if(g_keyboard.getToggled("ArrowUp")) {
        g_keyboard.clearToggled("ArrowUp");
        send_tryMove(g_ws,0,1);
    }
    if(g_keyboard.getToggled("ArrowDown")) {
        g_keyboard.clearToggled("ArrowDown");
        send_tryMove(g_ws,0,-1);
    }
    if(g_keyboard.getToggled("a")) {
        g_keyboard.clearToggled("a");
        send_tryMove(g_ws,-1,0);
    }
    if(g_keyboard.getToggled("s")) {
        g_keyboard.clearToggled("s");
        send_tryMove(g_ws,0,-1);
    }
    if(g_keyboard.getToggled("d")) {
        g_keyboard.clearToggled("d");
        send_tryMove(g_ws,1,0);
    }
    if(g_keyboard.getToggled("w")) {
        g_keyboard.clearToggled("w");
        send_tryMove(g_ws,0,1);
    }    
    if(g_mouse.getButton(0)) {
        var x=g_mouse.cursor_pos[0]-SCRW/2;
        var y=SCRH/2-g_mouse.cursor_pos[1];
        console.log("mousebutton0:",x,y);
    }
    if(g_touch.touching) {
        var x=g_touch.last_touch_pos[0]-SCRW/2;
        var y=SCRH/2-g_touch.last_touch_pos[1];
        console.log("touchat:",x,y);
    }
    var now_time = new Date().getTime();
    var dt = now_time - last_anim_at;
    last_anim_at = now_time;
    Moyai.poll(dt/1000.0);
    Moyai.render();
}

animate();

///////////

function setupFieldGrid() {
    var p = new Prop2D();
    p.setDeck(g_base_deck);
    p.setScl(20,20);
    p.setLoc(-SCRW/2,-SCRH/2);
    p.setIndex(-1);
    var groundgrid = new Grid(g_fld.width,g_fld.height);
    groundgrid.setDeck(g_base_deck);
    p.addGrid(groundgrid);
    var objgrid = new Grid(g_fld.width,g_fld.height);
    objgrid.setDeck(g_base_deck);
    p.addGrid(objgrid);
    for(var x=0;x<g_fld.width;x++){
        for(var y=0;y<g_fld.height;y++){
            var cell=g_fld.getCell(x,y);
            var gr_ind=-1, obj_ind=-1;
            switch(cell.ground) {
            case GROUND_GRASS: gr_ind=3; break;
            case GROUND_WATER: gr_ind=4; break;
            case GROUND_BRIDGE: gr_ind=5; break;
            }
            switch(cell.obj) {
            case OBJ_TREE: obj_ind=2; break;
                
            }
            groundgrid.set(x,y,gr_ind);
            objgrid.set(x,y,obj_ind);
            
//            console.log("cell:",x,y,cell);
        }
    }
    p.prop2DPoll = function(dt) {
        return true;
    }
    g_main_layer.insertProp(p);
}
//////////////
function findEntity(eid) {
    for(var i=0;i<g_main_layer.props.length;i++) {
        var p=g_main_layer.props[i];
        if(p.entity_id==eid) return p;
    }
    return null;
}
function createEntity(id,type,fld_x,fld_y) {
    var p = new Prop2D();
    p.setDeck(g_base_deck);
    var ind=96;
    if(type==ENTITY_PC) ind=0;
    else if(type==ENTITY_SKELETON) ind=64;
    p.setIndex(ind);
    p.setScl(20,20);
    p.setFldLoc = function(fx,fy) {
        p.setLoc(-SCRW/2+10+fx*20,-SCRH/2+10+fy*20);        
    };
    p.setFldLoc(fld_x,fld_y);
    p.entity_id=id;
    p.entity_type=type;
    p.fld_x=fld_x;
    p.fld_y=fld_y;
    g_main_layer.insertProp(p);
    return p;
}

//////////

function loginPressed() {
    var input=document.getElementById("loginname");
    send_login(g_ws, input.value);
}
function appendLog(msg) {
    var log=document.getElementById("log");
    log.innerText+=msg+"\n";
}