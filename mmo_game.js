///////////////


gameInit = function() {
    g_fld=new Field(32,24);
    g_fld.generate();

    g_entities=[];
}

deleteEntity = function(e) {
    var ind=g_entities.indexOf(e) ;
    if(ind>=0) {
        console.log("deleteEntity:",ind,e);
        g_entities.splice(ind,1);
        return true;
    }
    return false;
}
findEntityByLoc = function(x,y) {
    for(var i=0;i<g_entities.length;i++) {
        var e=g_entities[i];
        if(e.loc[0]==x && e.loc[1]==y){
            return e;
        }
    }
    return null;
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




