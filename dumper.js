/************************************
* Fast's JS Global Variable Dumper  *
*      Chrome Console Edition       *
************************************/
// version 2
var dumper = { };

/*  HOW TO USE:
    Paste in chrome console and hit enter.  Take care if you set the max search depth really high.
*/
dumper.BANNED_KEYS      = ["dumper","document"]; // traversal will stop at these keys
dumper.MAX_SEARCH_DEPTH = 10;         // max recursive depth to search
dumper.IGNORE_NULL      = true;       // if true, don't print keys that are null

dumper.COLORS = {  // inspired by Wiremod's Expression 2 Language in Garry's Mod
    string: "#999999",
    number: "#ff6666",
    bigint: "",
    boolean: "#668cff",
    symbol: "#80ff80",
    object: "#ffff66",
    undefined: "",
    function: "#fc83fc"
}

dumper.justify = function(string,value){ return string + "\t".repeat(Math.max(0,Math.ceil((value-string.length)/4))) } // aligns text

// call this on any value and leave location blank to print advanced data about it
dumper.advLog = function(value,location){
    if( value==null || !dumper.IGNORE_NULL ){ return } // nothing to see here...
    let type = typeof(value);
    try{
        if( type == 'symbol' ){ value = value.valueOf() } // ugh
        else if( type == 'string' ){ value = `"${value}"`}
        value+"";
    }
    catch(e){ value = "" }
    if(location){
        console.log( `${location} = %c${type} %c${value}`, "color: #ff944d;", `color: ${dumper.COLORS[type]};` )
    }
    else{
        console.log( `%c${type} %c${value}`, "color: #ff944d;", `color: ${dumper.COLORS[type]};` )
    }
}

dumper.recurse = function(obj, path, depth=0, refs=new WeakSet()) {    

    if( depth > dumper.MAX_SEARCH_DEPTH ){ return; }

    // Avoid infinite recursion
    if(refs.has(obj)){ dumper.advLog(obj,dumper.justify(location,32)); return; }
    else if( obj!=null ){ refs.add(obj); }

    let group = true;
    for (const key in obj) {
        
        if( group ){ group = false; console.group(key); }
        let value = obj[key];
        let location = `${path}['${key}']`;

        if( typeof(value) === 'object' ){
            if( dumper.BANNED_KEYS.includes(key) ){ 
                dumper.advLog(value,dumper.justify(location,32))
            }
            else{
                try{
                    dumper.recurse(value, location, depth+1, refs);  
                }
                finally{ }
            }
        }
        else{
            dumper.advLog(value,dumper.justify(location,32))
        }

    }
    if( !group ){
        console.groupEnd();
    }
    else{
        dumper.advLog(obj,dumper.justify(path,32))
    }
}
dumper.recurse(window, "window", 0);