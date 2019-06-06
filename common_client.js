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
