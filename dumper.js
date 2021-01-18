/************************************
* Fast's JS Global Variable Dumper: *
*      Chrome Console Edition       *
************************************/
var dumper = { traversed: { } };

/*  HOW TO USE:
    Paste in chrome console and hit enter.  Take care if you set the max search depth really high.
*/
dumper.BANNED_KEYS      = ["dumper"]; // traversal will stop at these keys
dumper.MAX_SEARCH_DEPTH = 10;         // max recursive depth to search
dumper.IGNORE_NULL      = true;       // if true, don't print keys that are null
dumper.IGNORE_FUNC      = false;      // if true, don't print functions
dumper.SEPARATOR        = "\n";

dumper.shouldExplore = function(val) {
    try { 
        if (val === undefined || val === null) { return false }
        if (val + "" == "[object Window]") { return false; }
        return typeof val === 'object';
    }
    catch (e) {
        return false;
    }
}
dumper.lastseparated = false;
dumper.format = function(path,value){
    if( value.length > 64 || value.search("\n") != -1 ){
        path = path + " = \n" + value + "\n" + dumper.SEPARATOR
        if( !dumper.lastseparated ){
            dumper.lastseparated = true;
            path = dumper.SEPARATOR + path;
        }
        return path;
    }
    else if( path.length > 90 ){
        return path + "\t".repeat(Math.max(0,Math.ceil((96-path.length)/4))) + "= \n" + value + "\n"
    }
    dumper.lastseparated = false;
    return path + "\t".repeat(Math.max(0,Math.ceil((96-path.length)/4))) + "= " + value + "\n"
}

dumper.log = "";
dumper.seed = Math.random(Date.parse());
console.log("seed: "+dumper.seed);

dumper.recursivelyExplore = function (obj, path, depth) {    
    if( dumper.traversed[path] ){ return; }
    if( depth > dumper.MAX_SEARCH_DEPTH ) { return; }
    if( depth == 0 ){
        console.group("Global Key/Value Pairs:");
    }
    dumper.traversed[path] = dumper.seed;
    for (const key in obj) {

        if( dumper.BANNED_KEYS.includes(key) ){ continue; }
        if( !obj.hasOwnProperty(key) ) { continue; }
        var obj2 = obj[key];

        if( dumper.shouldExplore(obj2) ){
            try{ 
                dumper.recursivelyExplore(obj2, path + "." + key, depth + 1); 
            } 
            catch (e){
                dumper.log = dumper.log + dumper.format(path, "[Exploration Failed]");
            }
        }

        else if( ( !dumper.IGNORE_NULL || obj2!==null ) && ( !dumper.IGNORE_FUNC || typeof obj2 !== 'function' ) ){
            try {
                var finalPath = path + "." + key
                if ( dumper.log.length > 134217728 ) {
                    console.log(dumper.log);
                    dumper.log = "";
                }
                if( typeof obj2 === 'symbol' ){
                    dumper.log = dumper.log + dumper.format(finalPath, "[Symbol] " + obj2.valueOf());
                }
                else {
                    dumper.log = dumper.log + dumper.format(finalPath, obj2+"");
                }
            }
            catch (e) {
                dumper.log = dumper.log + dumper.format(finalPath,"[Unprintable " + (typeof obj2) + "]");
            }
        }

    }
    if( depth == 0 ){
        console.log(dumper.log);
        console.groupEnd();
        dumper.log = "";
    }
}
dumper.recursivelyExplore(window, "window", 0);