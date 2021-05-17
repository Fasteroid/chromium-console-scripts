/************************************
*     Fast's JS Global Searcher     *
*      Chrome Console Edition       *
************************************/
// version 2
var searcher = { 
    isCursedKey: (key) => key.match(/[^(a-z|$|_|A-Z)]/), 
    justify: (string,value) => (string + "\t".repeat(Math.max(0,Math.ceil((value-string.length)/4)))),
    isBanned: (key) => key == "window.searcher" || searcher.includesPartial(searcher.BANNED_KEYS,key), // pls don't remove hardcoded values from here
};

/*  HOW TO USE:
    Paste in chrome console and hit enter.  Take care if you set the max search depth really high.
*/
searcher.BANNED_KEYS         = ["document"]; // traversal will stop at these keys
searcher.SEARCH_KEYS         = ["invite"];   // keys or values containing these strings will be displayed
searcher.MAX_SEARCH_DEPTH    = 10;           // max recursive depth to search

searcher.LIST_GROUPING_MODE = console.groupCollapsed  // can be changed to console.group, but not reccommended

searcher.COLORS = {  // inspired by Wiremod's Expression 2 Language in Garry's Mod
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

searcher.getPath = function(path,key){
    if( searcher.isCursedKey(key) ){
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

/**
 * @param {String} string 
 * @returns 
 */
searcher.includesPartial = function(strings,string){
    for (const key in strings) {
        if(string.toLowerCase().includes(strings[key])){ return true; }
    }
    return false;
};

searcher.advToString = function(thing){
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
    return value;
}

// call this on any value and leave location blank to print advanced data about it
searcher.advLog = function(thing,path){
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
        console.log( `${path} = %c${type} %c${value}`, "color: #ff944d;", searcher.COLORS[type] )
    }
    else{
        console.log( `%c${type} %c${value}`, "color: #ff944d;", searcher.COLORS[type] )
    }
}

searcher.recurse = function(obj, path, depth=0, refs=new WeakSet(), funcs=[]) {    

    if( depth > searcher.MAX_SEARCH_DEPTH ){ return; }

    // Avoid infinite recursion
    if(refs.has(obj)){ return; }
    else if( obj!=null ){ refs.add(obj); }

    bruh: for (const key in obj) {
        try{

            let value = obj[key]; // if we hit a css sheet this will throw an exception
            if( value === null ){ continue; } // skip null
            if( value.window ){ continue; } // no.
            let type = typeof(value);
            let newpath = searcher.getPath(path,key);
            if( searcher.isBanned(newpath) ){ 
                continue bruh; 
            }

            switch(type){
                case 'function':
                    let code = (value+"")
                    if( code.includes("[native code]") ){
                        continue bruh;
                    }
                    if( searcher.includesPartial(searcher.SEARCH_KEYS,code) ){
                        funcs.push(value);
                        searcher.advLog(value, newpath)
                        continue bruh;
                    }
                case 'object':
                    if( searcher.includesPartial(searcher.SEARCH_KEYS,key) ){
                        searcher.advLog(value, newpath)
                        if(code){
                            funcs.push(value);
                        }
                        continue bruh;
                    }
                    searcher.recurse(value, newpath, depth+1, refs, funcs);          
                break;
                default:
                    if( searcher.includesPartial(searcher.SEARCH_KEYS,key) ){
                        searcher.advLog(value, newpath)
                        continue bruh;
                    }
                    let text = searcher.advToString(value)
                    if( searcher.includesPartial(searcher.SEARCH_KEYS,text) ){
                        searcher.advLog(value, newpath)
                        continue bruh;
                    }
                break;
            }

        }
        catch(e){
            console.error(e);
        }
    }

    return funcs

};
searcher.recurse(window,"window")