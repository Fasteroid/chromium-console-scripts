/**********************************
* Fast's Epic JS Memory Corruptor *
*      Chrome Console Edition     *
**********************************/
var CORRUPT = [];


CORRUPT.BANNED_KEYS       = ["CORRUPT","traversalMarker","$","jQuery","Ajax","document","location"];
CORRUPT.MAX_RECUR         = 15;
CORRUPT.CORRUPTION_TYPES  = ['number','string']
CORRUPT.CORRUPTION_START  = 1;
CORRUPT.CONTINUOUS        = true;

function isObject(val) {
    try { 
        if (val === undefined || val === null) { return false }
        if (val + "" == "[object Window]") { // technically yes, but no.
            return false; 
        }
        return (typeof val === 'function') || (typeof val === 'object' || (typeof val === 'symbol'));
    }
    catch (e) {
        return false;
    }
}

function pickRandom(array,len) {
    return array[ Math.floor(Math.random()*len) ];
}

CORRUPT.seed = Math.random(Date.parse());
console.log("seed: "+CORRUPT.seed);

CORRUPT.values   = [];
CORRUPT.number   = [];
CORRUPT.failed   = 0;
CORRUPT.count    = 0;

function recursivelyMap(obj, path, depth) {    
    for (const key in obj) {
        if( CORRUPT.BANNED_KEYS.includes(key) ){ continue; }
        if( !obj.hasOwnProperty(key) ) { continue; }
        var obj2 = obj[key];
        if( isObject(obj2)  ){
            if (depth < CORRUPT.MAX_RECUR) {
                try{ 
                    recursivelyMap(obj2, path + "." + key, depth + 1); 
                } 
                catch (e){ }
            }
        }
        else if( obj2!==null ){
            try {
                var type = typeof( obj2 );
                if( !CORRUPT.CORRUPTION_TYPES.includes(type) ){ continue }
                if( CORRUPT.values[type] == undefined ){
                    CORRUPT.number[type] = 0;
                    CORRUPT.values[type] = [];
                }
                CORRUPT.values[type][CORRUPT.number[type]] = obj2;
                CORRUPT.number[type]++;
                CORRUPT.count++;
            }
            catch (e) { }
        }
    }
}

function recursivelyDestroy(obj, path, depth) {    
    for (const key in obj) {
        if( CORRUPT.BANNED_KEYS.includes(key) ){ continue; }
        if( !obj.hasOwnProperty(key) ) { continue; }
        var obj2 = obj[key];
        if( isObject(obj2) ){
            if (depth < CORRUPT.MAX_RECUR) {
                try{ 
                    recursivelyDestroy(obj2, path + "." + key, depth + 1); 
                } 
                catch (e){ }
            }
        }
        else if( obj2!==null && depth >= CORRUPT.CORRUPTION_START ){
            try {
                var type = typeof( obj2 );
                if( !CORRUPT.CORRUPTION_TYPES.includes(type) ){ continue }
                obj[key] = pickRandom(CORRUPT.values[type],CORRUPT.number[type])
            }
            catch (e) { 
                CORRUPT.failed++;
            }
        }
    }
}

recursivelyMap(window, "window", 0);
console.log(CORRUPT.values);

if( CORRUPT.CONTINUOUS ){
    console.log("Engaging CONTINUOUS CORRUPTION");
    setTimeout(function(){ recursivelyDestroy(window, "window", 0); }, 250);
}
else{
    recursivelyDestroy(window, "window", 0);
    console.log("Corrupted "+(CORRUPT.count - CORRUPT.failed)+"/"+CORRUPT.count+" values.");
}