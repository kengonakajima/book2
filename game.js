
// oryx lofi のmap1.pngをいめーじ

OBJ_NONE=0;
OBJ_TREE=1;

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




if(typeof global!="undefined") {
    global.Field=Field;    
}
