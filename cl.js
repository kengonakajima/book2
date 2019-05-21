
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
    console.log("ev.data:",ev.data,ev);
    recv_binary_message(g_ws,ev.data);
};

recv_ping = function(conn,val) {
    console.log("recv_ping:",val);
    send_login(conn,"testuser");
}
recv_loginResult = function(conn,name,result) {
    console.log("recv_loginResult:",name,result);
}
recv_field = function(conn,width,height,ground,obj) {
    console.log("recv_field:",width,height,ground,obj);
    g_fld=new Field(width,height);
    g_fld.obj=obj;
    g_fld.ground=ground;
    setupFieldGrid();
    g_pc=createPC(0,100);
    
}




////////////////////////////

var SCRW=640, SCRH=480;
Moyai.init(SCRW,SCRH);
var screen = document.getElementById("screen");
var canvas=Moyai.getDomElement();
screen.appendChild(canvas);


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

function createPC(x,y) {
    var pc = new Prop2D();
    pc.setDeck(g_base_deck);
    pc.setIndex(0);
    pc.setScl(20,20);
    pc.setLoc(x,y);
    g_main_layer.insertProp(pc);
    return pc;
}
