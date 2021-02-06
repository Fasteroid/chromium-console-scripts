/************************************
* Fast's JS Global Variable Dumper: *
*      Chrome Console Edition       *
************************************/
var dumper = { log: [] };

/*  HOW TO USE:
    Paste in chrome console and hit enter.  Take care if you set the max search depth really high.
*/
dumper.BANNED_KEYS      = ["dumper"]; // traversal will stop at these keys
dumper.MAX_SEARCH_DEPTH = 10;         // max recursive depth to search
dumper.IGNORE_NULL      = true;       // if true, don't print keys that are null
dumper.IGNORE_FUNC      = false;      // if true, don't print functions
dumper.SEPARATOR        = "\n";
dumper.GROUP_SIZE       = 134217728;
dumper.EXPLORE_EVERYTHING = false;    // if true, explore inherited properties

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
dumper.justify = function(string,value){ return string + "\t".repeat(Math.max(0,Math.ceil((value-string.length)/4))) } // aligns text

dumper.seed = Math.random(Date.parse());
console.log("seed: "+dumper.seed);

dumper.recursivelyExplore = function (obj, path, depth) {    
    if( obj.traversed == dumper.seed ){ return; }
    if( depth > dumper.MAX_SEARCH_DEPTH ) { return; }
    if( depth == 0 ){
        console.group("Global Key/Value Pairs:");
    }
    obj.traversed = dumper.seed;
    for (const key in obj) {

        if( !dumper.EXPLORE_EVERYTHING && !obj.hasOwnProperty(key) ) { continue; }
        if( key=="traversed" || dumper.BANNED_KEYS.includes(key) ){ continue; }
        var obj2 = obj[key];

        if( dumper.shouldExplore(obj2) ){
            try{ 
                dumper.recursivelyExplore(obj2, path + "." + key, depth + 1); 
            } 
            catch (e){
                dumper.log[dumper.log.length] = dumper.justify(path, 64) + "~ [Exploration Failed]\n";
            }
        }
        else if( ( !dumper.IGNORE_NULL || obj2!==null ) && ( !dumper.IGNORE_FUNC || typeof obj2 !== 'function' ) ){
            try {
                var finalPath = path + "." + key
                if ( dumper.log.length > dumper.GROUP_SIZE ) {
                    console.log(dumper.log.join("\n"));
                    dumper.log = [];
                }
                if( typeof obj2 === 'symbol' ){
                    dumper.log[dumper.log.length] = dumper.justify(finalPath, 64) + "= [Symbol] " + obj2.valueOf() + "\n";
                }
                else {
                    dumper.log[dumper.log.length] = dumper.justify(finalPath, 64) + "= " + obj2 + "\n";
                }
            }
            catch (e) {
                dumper.log[dumper.log.length] = dumper.justify(finalPath, 64) + "~ [Unprintable " + (typeof obj2) + "]\n";
            }
        }

    }
    if( depth == 0 ){
        console.log(dumper.log.join("\n"));
        console.groupEnd();
        dumper.log = [];
    }
}
dumper.recursivelyExplore(window, "window", 0);