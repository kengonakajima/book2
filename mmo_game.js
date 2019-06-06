OBJ_NONE=0;
OBJ_TREE=1;

GROUND_GRASS=1;
GROUND_WATER=2;
GROUND_BRIDGE=3;

ENTITY_PC=100;
ENTITY_SKELETON=110;

ENTITY_STATE_STANDING=1;
ENTITY_STATE_DIED=2;

//////////////

class Field {
    constructor(width,height){
        /*
          index:
          ... 
          32,...       .......,2w-1
          0,1,2,3,4,5,.....,w-1
         */
        this.width=width;
        this.height=height;
        this.ground=new Array(this.width*this.height);
        this.obj=new Array(this.width*this.height);
    }
    generate() {
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
    getCell(x,y) {
        if(x<0||y<0||x>=this.width||y>=this.height) return null;
        var ind=x+y*this.width;        
        return { ground: this.ground[ind], obj: this.obj[ind] };
    }
    dumpField() {
        var ind=0;
        var out=[];
        for(var y=0;y<this.height;y++) {
            var s="";            
            for(var x=0;x<this.width;x++) {
                var ch;
                switch(this.ground[ind]) {
                case GROUND_WATER: ch="~"; break;
                case GROUND_GRASS: ch="."; break;
                case GROUND_BRIDGE: ch="="; break;                    
                default: ch="?"; break;
                }
                switch(this.obj[ind]) {
                case OBJ_TREE: ch="T"; break;
                default: break;
                }
                s+=ch;
                ind++;
            }
            out.push(s);
        }
        return out.reverse().join("\n");
    }
}

g_id_gen=1;

class Entity {
    constructor(t,loc) {
        this.type=t; // ENTITY_*
        this.loc=loc;
        this.id=g_id_gen++;
        this.created_at=now();
        this.accum_time=0;
        this.poll_cnt=0;
        this.state=ENTITY_STATE_STANDING;        
    }
    tryMove(dx,dy) {
        if((dx==0&&dy==1) ||(dx==0&&dy==-1) || (dx==1&&dy==0) || (dx==-1&&dy==0) ) {
            var nx=this.loc[0]+dx, ny=this.loc[1]+dy;
            var ne=findEntityByLoc(nx,ny);
            if( ne ) {
                console.log("checkentity hit at",nx,ny, "state:", ne.state);
                if(this.onHitEntity) {
                    this.onHitEntity(ne);
                }
                return false;
            }
            var nc=g_fld.getCell(nx,ny);
            if(!nc) {
                console.log("cant get out of the field");
                return false;
            }
            if( (nc.ground==GROUND_GRASS||nc.ground==GROUND_BRIDGE) && nc.obj==OBJ_NONE) {
                this.loc[0]=nx;
                this.loc[1]=ny;
                if(this.onMoved) this.onMoved();
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }    
};


class Skeleton extends Entity {
    constructor(lc) {
        super(ENTITY_SKELETON,lc);
        this.move_mod=50;//irange(50,150);
    }
    poll(dt) {
        this.poll_cnt++;
        this.accum_time+=dt;
        if(this.accum_time>10) {
            this.to_clean=true;
            return;
        }
        if(this.poll_cnt%this.move_mod==0) {
            var dx=irange(-1,2), dy=irange(-1,2);
            if(this.state==ENTITY_STATE_STANDING) {
                this.tryMove(dx,dy);
                broadcastEntity(this);
            }
        }
    }
};
class PC extends Entity {
    constructor(lc,name) {
        super(ENTITY_PC,lc);
        this.name=name;
        this.kill_count=0;
        this.walk_count=0;
    }
    poll(dt) {
        this.poll_cnt++;
    }
    onMoved() {
        this.walk_count++;
    }
    onHitEntity(e) {
        if(e.type==ENTITY_SKELETON && e.state == ENTITY_STATE_STANDING) {
            this.kill_count++;
            broadcastLog(`${this.name} killed a skeleton! kill:${this.kill_count} walk:${this.walk_count}`);
            e.state= ENTITY_STATE_DIED;
            broadcastEntity(e);
        }
    }

};
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




if(typeof global!="undefined") {
    global.Field=Field;
    global.Skeleton=Skeleton;
    global.PC=PC;    
}
