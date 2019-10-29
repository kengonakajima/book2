
ENTITY_PC=100;
ENTITY_SKELETON=110;

ENTITY_STATE_STANDING=1;
ENTITY_STATE_DIED=2;

//////////////

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

/////////

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

if(typeof global!="undefined") {
    global.Field=Field;
    global.Skeleton=Skeleton;
    global.PC=PC;
}
