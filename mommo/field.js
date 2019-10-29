OBJ_NONE=0;
OBJ_TREE=1;
OBJ_RED_HOUSE=2;
OBJ_BLUE_HOUSE=3;
OBJ_RED_HOUSE_BROKEN=4;
OBJ_BLUE_HOUSE_BROKEN=5;

GROUND_GRASS=1;
GROUND_WATER=2;
GROUND_BRIDGE=3;

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
    getCell(x,y) {
        if(x<0||y<0||x>=this.width||y>=this.height) return null;
        var ind=x+y*this.width;        
        return { ground: this.ground[ind], obj: this.obj[ind] };
    }
    setObj(x,y,o) {
        if(x<0||y<0||x>=this.width||y>=this.height) return;
        var ind=x+y*this.width;
        this.obj[ind]=o;
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
                case OBJ_RED_HOUSE: ch="R"; break;
                case OBJ_BLUE_HOUSE: ch="B"; break;
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

if(typeof global!="undefined") {
    global.Field=Field;
}
