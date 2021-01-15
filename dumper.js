/**********************************
*  Fast's Funny JS Global Dumper: *
*     Chrome Console Edition      *
**********************************/
var HAX = [];

/*  HOW 2 USE:
 *  hit f12 and paste it in chrome consloe then hit enter 2 hack XDDDDDDD
 *  advenced settings 4 pro haxxorz are below dont touch them unless ur a pro haxxor
*/
HAX.EXPLORATION_BLACKLIST = ["HAX","traversalMarker","$","jQuery","Ajax","jQuery2240242725290525418251","tourController"]; 
HAX.MAX_SEARCH_DEPTH      = 10;
HAX.IGNORE_NULL           = true;
HAX.IGNORE_FUNC           = false;
HAX.NEWLINE_AT            = 96;
HAX.SEPARATOR             = "\n";

HAX.shouldExplore = function(val) {
    try { 
        if (val === undefined || val === null) { return false }
        if (val + "" == "[object Window]") { return false; }
        return typeof val === 'object';
    }
    catch (e) {
        return false;
    }
}

HAX.format = function(path,value){
    if( value.length > HAX.NEWLINE_AT*0.7 || value.search("\n") != -1 ){
        path = path + " = \n" + value + "\n" + HAX.SEPARATOR
        if( !HAX.lastseparated ){
            HAX.lastseparated = true;
            path = HAX.SEPARATOR + path;
        }
        return path;
    }
    else if( path.length > HAX.NEWLINE_AT ){
        return path + "\t".repeat(Math.max(0,Math.ceil((HAX.NEWLINE_AT-path.length)/4))) + "= \n" + value + "\n"
    }
    HAX.lastseparated = false;
    return path + "\t".repeat(Math.max(0,Math.ceil((HAX.NEWLINE_AT-path.length)/4))) + "= " + value + "\n"
}

HAX.log = "";
HAX.seed = Math.random(Date.parse());
console.log("seed: "+HAX.seed);
HAX.lastseparated = false

HAX.recursivelyExplore = function (obj, path, depth) {    

    obj.traversalMarker = HAX.seed;
    for (const key in obj) {

        if( HAX.EXPLORATION_BLACKLIST.includes(key) ){ continue; }
        if( !obj.hasOwnProperty(key) ) { continue; }
        var obj2 = obj[key];

        if( HAX.shouldExplore(obj2) ){
            if (depth < HAX.MAX_SEARCH_DEPTH) {
                try{ 
                    HAX.recursivelyExplore(obj2, path + "." + key, depth + 1); 
                } 
                catch (e){
                    HAX.log = HAX.log + HAX.format(path, "[Unexplorable]");
                }
            }
        }

        else if( ( !HAX.IGNORE_NULL || obj2!==null ) && ( !HAX.IGNORE_FUNC || typeof obj2 !== 'function' ) ){
            try {
                var finalPath = path + "." + key
                if ( HAX.log.length > 134217728 ) {
                    console.log(HAX.log);
                    HAX.log = "";
                }
                if( typeof obj2 === 'symbol' ){
                    HAX.log = HAX.log + HAX.format(finalPath, "[Symbol] " + obj2.valueOf());
                }
                else {
                    HAX.log = HAX.log + HAX.format(finalPath, obj2+"");
                }
            }
            catch (e) {
                console.log(e);
                HAX.log = HAX.log + HAX.format(finalPath,"[Unprintable " + (typeof obj2) + "]");
            }
        }

    }
}
HAX.recursivelyExplore(window, "window", 0);
console.log(HAX.log);