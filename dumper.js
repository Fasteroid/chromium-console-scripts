/**********************************
*  Fast's Funny JS Global Dumper: *
*     Chrome Console Edition      *
**********************************/
var HAX = [];

/*  HOW 2 USE:
 *  hit f12 and paste it in chrome consloe then hit enter 2 hack XDDDDDDD
 *  advenced settings 4 pro haxxorz are below dont touch them unless ur a pro haxxor
*/
HAX.BANNED_KEYS = ["HAX","traversalMarker","$","jQuery","Ajax"];
HAX.MAX_RECUR   = 15;
HAX.IGNORE_NULL = true;

function isObject(val) {
    try { 
        if (val === undefined || val === null) { return false }
        if (val + "" == "[object Window]") { // technically yes, but no.
            return false; 
        }
        var toStringTryCatchBait = val + "";
        return (typeof val === 'function') || (typeof val === 'object');
    }
    catch (e) {
        return false;
    }
}
HAX.log = "";
HAX.seed = Math.random(Date.parse());
console.log("seed: "+HAX.seed);
function recursivelyExplore(obj, path, depth) {    
    obj.traversalMarker = HAX.seed;
    for (const key in obj) {
        if( HAX.BANNED_KEYS.includes(key) ){ continue; }
        if( !obj.hasOwnProperty(key) ) { continue; }
        var obj2 = obj[key];
        if (isObject(obj2) && typeof obj !== 'function') {
            if (depth < HAX.MAX_RECUR) {
                try{ recursivelyExplore(obj2, path + "." + key, depth + 1); } catch (e){ console.log("exploration error at "+path); }
            }
        }
        else if( !HAX.IGNORE_NULL || obj2!==null ){
            try {
                var finalPath = path + "." + key
                if ( HAX.log.length > 134217728) {
                    console.log(HAX.log);
                    HAX.log = "";
                }
                HAX.log = HAX.log + (finalPath + "\t".repeat(Math.max(0,Math.ceil((128-finalPath.length)/4))) + "= "+obj2 ) + "\n";
            }
            catch (e) {
                HAX.log = HAX.log + (finalPath + "\t".repeat(Math.max(0,Math.ceil((128-finalPath.length)/4))) + "~ unprintable" ) + "\n";
            }
        }
    }
}
recursivelyExplore(window, "window", 0);
console.log(HAX.log);