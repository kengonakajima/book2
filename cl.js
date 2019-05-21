
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
}




/////////// 

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


var colp = new Prop2D();
colp.setColor(0.5,1,1,1);
colp.setDeck(g_base_deck);
colp.setIndex(1);
colp.setScl(24,24);
colp.setLoc(50,-20);
g_main_layer.insertProp(colp);

var gridp = new Prop2D();
gridp.setDeck(g_base_deck);
gridp.setScl(24,24);
gridp.setLoc(-100,-300);
var g = new Grid(8,8);
g.setDeck(g_base_deck);
var iii=1;
for(var x=0;x<8;x++){
    for(var y=0;y<8;y++){
        if(y==6||x==6) continue;
        g.set(x,y,iii % 3);
        g.setColor( x,y, Color.fromValues(range(0.5,1), range(0.5,1), range(0.5,1), range(0.2,1) ));
        if(x==0) g.setXFlip(x,y,true);
        if(x==1) g.setYFlip(x,y,true);
        if(x==2) g.setUVRot(x,y,true);
        if(x==3) {
            var ofs = vec2.fromValues(0.5,0.5);
            g.setTexOffset(x,y,ofs);
        }
        iii++;
    }
}
g.setUVRot(7,7,true);
gridp.addGrid(g);
gridp.prop2DPoll = function(dt) {
    this.grids[0].set(Math.floor(Math.random()*7),Math.floor(Math.random()*7), this.poll_count%4);
    return true;
}
g_main_layer.insertProp(gridp);

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
