var host = process.argv[2];
if(!host) host="127.0.0.1";

var net = require("net");

var cl = new net.Socket();
cl.connect( 22222, host, function() {
    console.log("connected:",cl.remoteAddress, cl.remotePort );
    setInterval( function() {
        var s=JSON.stringify(process.hrtime());
        cl.write(s);
    }, 50 );
    
    cl.on("data", function(data) {
        var hrt=JSON.parse(data.toString());
        var now=process.hrtime();
        var dt=(now[0]-hrt[0]) + (now[1]-hrt[1])/1000000000.0;
        console.log("dt:",dt);
    });
    cl.on("close", function() {
        console.log("closed");
    });
});










