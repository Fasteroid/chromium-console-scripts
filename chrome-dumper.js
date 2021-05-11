/************************************
* Fast's JS Global Variable Dumper  *
*      Chrome Console Edition       *
************************************/
// version 2
var dumper = { 
    isCursedKey: (key) => key.match(/[^(a-z|$|_|A-Z)]/), 
    justify: (string,value) => (string + "\t".repeat(Math.max(0,Math.ceil((value-string.length)/4)))),
    isBanned: (key) => key == "window.dumper" || dumper.includesPartial(dumper.BANNED_KEYS,key), // pls don't remove hardcoded values from here
};

/*  HOW TO USE:
    Paste in chrome console and hit enter.  Take care if you set the max search depth really high.
*/
dumper.BANNED_KEYS         = ["document"]; // traversal will stop at these keys
dumper.MAX_SEARCH_DEPTH    = 10;           // max recursive depth to search
dumper.MAX_SEARCH_WIDTH    = 100;          // any object besides window with more objects stored under it than this will be ignored.
dumper.IGNORE_NATIVE_FUNCS = true;         // don't dump native JS

dumper.LIST_GROUPING_MODE = console.groupCollapsed  // can be changed to console.group, but not reccommended

dumper.COLORS = {  // inspired by Wiremod's Expression 2 Language in Garry's Mod
    string:    "color: #999999;",
    number:    "color: #ff6666;",
    bigint:    "color: #a45b5b;",
    boolean:   "color: #668cff;",
    symbol:    "color: #fbfb51;",
    object:    "color: #80ff80;",
    array:     "color: #80ff80;",
    undefined: "color: #ffb56b;",
    function:  "color: #fc83fc;",
};

dumper.getPath = function(path,key){
    if( dumper.isCursedKey(key) ){
        if( parseInt(key) != NaN ){ // int
            return `${path}[${key}]`
        }
        else{ // something nasty
            return `${path}[\`${key}\`]`
        }
    }
    else{
        return `${path}.${key}`;
    }
}

dumper.includesPartial = function(strings,string){
    for (const key in strings) {
        if(string.includes(strings[key])){ return true; }
    }
    return false;
};

// call this on any value and leave location blank to print advanced data about it
dumper.advLog = function(thing,path,mode){
    let type = typeof(thing);
    let value = "failed..."
    try{
        switch(type){
            case 'symbol': value = thing.valueOf(); break; // ugh
            case 'string': value = `"${thing}"`; break;
            case 'function': 
                value = (thing + "").match(/(function\s*)([^\)]*\(.+)/); 
                if(value){ value = value[2] }
                break;
            case 'object':
                value = thing + ""
                if(!value.startsWith("[")){
                    value = `[...]`
                    type = "array";
                }
            break;
            default: value = thing + "";
        }
    }
    finally{}
    if(path){
        dumper.advLog[mode]( `${path} = %c${type} %c${value}`, "color: #ff944d;", dumper.COLORS[type] )
    }
    else{
        dumper.advLog[mode]( `%c${type} %c${value}`, "color: #ff944d;", dumper.COLORS[type] )
    }
}
dumper.advLog.undefined = console.log
dumper.advLog.true      = dumper.LIST_GROUPING_MODE

dumper.recurse = function(obj, path, depth=0, refs=new WeakSet()) {    

    if( depth > dumper.MAX_SEARCH_DEPTH ){ return; }

    // Avoid infinite recursion
    if(refs.has(obj)){ return; }
    else if( obj!=null ){ refs.add(obj); }

    dumper.advLog(obj, path, true); 

    bruh: for (const key in obj) {
        try{

            let value = obj[key]; // if we hit a css sheet this will throw an exception
            if( value === null ){ continue; } // skip null
            if( value.window ){ continue; } // no.
            let type = typeof(value);
            let newpath = dumper.getPath(path,key);

            switch(type){
                case 'function':
                    if( dumper.IGNORE_NATIVE_FUNCS && (value+"").includes("[native code]") ){
                        continue bruh;
                    }
                case 'object':
                    if( dumper.isBanned(newpath) ){ 
                        continue bruh; 
                    }
                    dumper.recurse(value, newpath, depth+1, refs);          
                break;
                default:
                    dumper.advLog(value, newpath)
                break;
            }

        }
        catch(e){
            console.error(e);
        }
    }

    console.groupEnd(); 

};
dumper.recurse(window,"window")