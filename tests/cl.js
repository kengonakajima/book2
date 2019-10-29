var host = process.argv[2];
if(!host) host="127.0.0.1";

var net = require("net");

var cl = new net.Socket();
cl.connect( 22222, host, function() {
    console.log("connected:",cl.remoteAddress, cl.remotePort );
    var n=100;
    var count=0;
    var long_delay_count=0;
    var total_delay_sec=0;
    var total_recv_count=0;
    var min_delay=999, max_delay=0;
    setInterval( function() {
        count++;
        if(count==n) {
            console.log("sent",n,"times, long delay:",long_delay_count, "avg delay:",total_delay_sec/total_recv_count, "min delay:",min_delay, "max delay:",max_delay);
            process.exit();
        }
        var s=JSON.stringify(process.hrtime()) + "\n";
        cl.write(s);
    }, 50 );

    cl.on("data", function(data) {
        var lines=data.toString().split("\n");  // 2行以上つながっていることがある
        if(lines.length>=1) {
            var hrt=JSON.parse(lines[0]);
            var now=process.hrtime();
            var dt=(now[0]-hrt[0]) + (now[1]-hrt[1])/1000000000.0;
            var delayed = ( dt > 0.1 ) ? "slow" : "";
            console.log("dt:",dt,delayed);
            if(delayed) long_delay_count++;
            total_delay_sec += dt;
            total_recv_count++;
            if(dt<min_delay)min_delay=dt;
            if(dt>max_delay)max_delay=dt;
        }
    });
    cl.on("close", function() {
        console.log("closed");
    });
});










