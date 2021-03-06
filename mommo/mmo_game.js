///////////////




gameInit = function() {
    g_fld=new Field(32,24);
    g_fld.generate = function() {
        for(var i=0;i<this.width*this.height;i++){
            this.ground[i]=GROUND_GRASS;
            var y=Math.floor(i/this.width), x=i%this.width;
            if((x+y==28 || x+y==27) ) {
                if(this.ground[i]!=GROUND_WATER) this.ground[i]=GROUND_WATER;
                if(y==10) this.ground[i]=GROUND_BRIDGE;
            }
            if(Math.random()<0.02 && this.ground[i]!=GROUND_WATER) this.obj[i]=OBJ_TREE; else this.obj[i]=OBJ_NONE;
        }
        console.log(this.dumpField());
    }
    g_fld.generate();

    g_entities=[];
}


function tryPopEnemy() {
    var cnt=0;
    for(var i=0;i<g_entities.length;i++) {
        var e=g_entities[i];
        if( e.type==ENTITY_SKELETON) cnt++;
    }
    if(cnt<10) {
        var lc=gl.vec2.fromValues(irange(0,g_fld.width), irange(0,g_fld.height));
        for(var i=0;i<g_entities.length;i++) {
            var e=g_entities[i];
            var dl=gl.vec2.fromValues(lc[0]-e.loc[0],lc[1]-e.loc[1]);
            if( e.type==ENTITY_PC && gl.vec2.length(dl) < 7 ) {
                console.log("too near");
                return false;
            }
        }
        var skel=new Skeleton(lc);
        g_entities.push(skel);
        broadcastEntity(skel);
    }
}

g_last_nt=0;
g_update_cnt=0;
gameUpdate = function() {
    g_update_cnt++;
    if((g_update_cnt%50)==0) {
        tryPopEnemy();
    }
    var nt=now();
    var dt=nt-g_last_nt;
    for(var i=0;i<g_entities.length;i++) {
        var e=g_entities[i];
        if(!e) {
            console.log("entity",i,"is null, clean");
            g_entities.splice(i,1);
            continue;
        }
        if(e.to_clean) {
            console.log("entity",i,"is to clean");
            broadcastEntityDelete(e);
            g_entities.splice(i,1);
            continue;
        }
        e.poll(dt);
    }
    g_last_nt=nt;
}




