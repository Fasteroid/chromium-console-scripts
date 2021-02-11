/**********************************
* Fast's Epic JS Memory Corruptor *
*      Chrome Console Edition     *
**********************************/

// WARNING:
// THIS SCRIPT IS VOLATILE AND MAY CORRUPT YOUR COOKIES
// USE WITH CAUTION

var CORRUPT = { logs: [] };

CORRUPT.BANNED_KEYS         = ["CORRUPT","document","location","$","jQuery"];
CORRUPT.MAX_RECUR           = 6;
CORRUPT.CORRUPTION_TYPES    = ['number','string']
CORRUPT.CORRUPT_START_DEPTH = 1;
CORRUPT.ALL                 = false;
CORRUPT.SHOULDLOG           = false;

CORRUPT.CORRPUT_NATIVE_FUNCS = false; // oh god don't enable this

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

CORRUPT.log = function(stuff){
    CORRUPT.logs[CORRUPT.logs.length] = stuff
    if(CORRUPT.logs.length > 64){
        console.log(CORRUPT.logs.join("\n"));
        CORRUPT.logs = [];
    }
}

CORRUPT.seed = Math.random(Date.parse());
console.log("seed: "+CORRUPT.seed);

CORRUPT.values   = [];
CORRUPT.failed   = 0;
CORRUPT.count    = 0;
CORRUPT.cache    = {};

function recursivelyMap(obj, path, depth) { // stores all the default values so we can pick from them randomly
    for (const key in obj) {
        if( CORRUPT.BANNED_KEYS.includes(key) ){ continue; }
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
                if( CORRUPT.values[type] == undefined ){ // init
                    CORRUPT.cache[type] = {};
                    CORRUPT.values[type] = [];
                }
                if( CORRUPT.cache[type][obj2+""] == undefined ){
                    CORRUPT.cache[type][obj2+""] = true // no dupes
                    CORRUPT.values[type][CORRUPT.values[type].length] = obj2;
                }
            }
            catch (e) { }
        }
    }
}

function recursivelyDestroy(obj, path, depth=0) {    
    try{
        for (const key in obj) {
            if( CORRUPT.BANNED_KEYS.includes(key) ){ continue; }
            var obj2 = obj[key];
            if( isObject(obj2) ){
                if (depth < CORRUPT.MAX_RECUR) {
                    try{ 
                        recursivelyDestroy(obj2, path + "." + key, depth + 1); 
                    } 
                    catch (e){ }
                }
            }
            else if( obj2!==null && depth >= CORRUPT.CORRUPT_START_DEPTH){
                try {
                    var type = typeof( obj2 );
                    if( !CORRUPT.CORRUPTION_TYPES.includes(type) ){ continue }
                    if( !CORRUPT.ALL && !obj.hasOwnProperty(key) ) { continue; }
                    if( !CORRUPT.CORRPUT_NATIVE_FUNCS && type == 'function' && (obj2+"").includes("[native code]") ){ continue }
                    let value = pickRandom(CORRUPT.values[type],CORRUPT.values[type].length);
                    if( CORRUPT.SHOULDLOG ){
                        CORRUPT.log(`Changed value at '${path+"."+key}' from '${obj[key]}' to '${value}'`)
                    }
                    obj[key] = value;
                    CORRUPT.count++;
                }
                catch (e) { 
                    CORRUPT.failed++;
                }
            }
        }
    }
    finally{ 
        if(depth==0 && CORRUPT.SHOULDLOG){
            console.log(CORRUPT.logs.join("\n"));
            CORRUPT.logs = [];      
            console.groupEnd();
        }
    }
}

recursivelyMap(window, "window", 0);

console.log(CORRUPT.values);

if(CORRUPT.SHOULDLOG){
    console.groupCollapsed("Corrupted Values:");
}

recursivelyDestroy(window, "window", 0);

console.log("Corrupted "+(CORRUPT.count - CORRUPT.failed)+"/"+CORRUPT.count+" values.");
