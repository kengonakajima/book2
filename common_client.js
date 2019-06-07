// common client

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

///////////

function appendLog(msg) {
    var log=document.getElementById("log");
    log.innerText+=msg+"\n";
}

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
            case OBJ_RED_HOUSE: obj_ind=70; break;
            case OBJ_BLUE_HOUSE: obj_ind=71; break;
                
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
