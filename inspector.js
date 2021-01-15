/**************************************
*  Fast's JS Function Call Inspector: *
*        Chrome Console Edition       *
**************************************/
var SPEC = [];

/*  HOW TO USE:
 *  Paste into chrome console and smash enter to gain  O M N I P R E S E N C E
*/
SPEC.EXPLORATION_BLACKLIST = ["SPEC","traversalMarker","$","jQuery","Ajax","console"]; 
SPEC.MAX_SEARCH_DEPTH      = 10;
SPEC.DETOUR_NATIVE_FUNCS   = false;

SPEC.shouldExplore = function(val) {
    try { 
        if (val === undefined || val === null) { return false }
        if (val + "" == "[object Window]") { return false; }
        return typeof val === 'object';
    }
    catch (e) {
        return false;
    }
}

SPEC.format = function(path,value){
    if( value.length > SPEC.NEWLINE_AT*0.7 || value.search("\n") != -1 ){
        path = path + " = \n" + value + "\n" + SPEC.SEPARATOR
        if( !SPEC.lastseparated ){
            SPEC.lastseparated = true;
            path = SPEC.SEPARATOR + path;
        }
        return path;
    }
    else if( path.length > SPEC.NEWLINE_AT ){
        return path + "\t".repeat(Math.max(0,Math.ceil((SPEC.NEWLINE_AT-path.length)/4))) + "= \n" + value + "\n"
    }
    SPEC.lastseparated = false;
    return path + "\t".repeat(Math.max(0,Math.ceil((SPEC.NEWLINE_AT-path.length)/4))) + "= " + value + "\n"
}

SPEC.join = function(array){
    var output = [];
    for (let index = 0; index < array.length; index++) {
        if( array[index] != null ){ // NO NULL!!!1
            if( typeof array[index] === 'string' ){
                output[index] = "'" + array[index] + "'";
            }
            else{
                output[index] = array[index];
            }
        }
        else{
            output[index] = "null"
        }
    }
    return output.join(", ");
}

SPEC.isCustom = function(f){ return !(/\{\s*\[native code\]\s*\}/).test(f); }
SPEC.or = function(a,b){ if( a != "" ){ return a; } return b; }
SPEC.trace = function(){ let trace = (new Error().stack).replaceAll("    ","  ").split("at ").splice(2); var output = []; for (let index = 0; index < trace.length; index++) { output[index] = " ".repeat(index) + trace[index]; } return output.join(""); }
SPEC.construct = function Arguments( args ) { for (let index = 0; index < args.length; index++) { this[index] = args[index]; } }

SPEC.seed = Math.random(Date.parse());
console.log("seed: "+SPEC.seed);
SPEC.log = "";
SPEC.locations = { }

SPEC.recursivelyExplore = function (obj, path, depth) {    

    obj.traversalMarker = SPEC.seed;
    for (const key in obj) {

        if( SPEC.EXPLORATION_BLACKLIST.includes(key) ){ continue; }
        if( !obj.hasOwnProperty(key) ) { continue; }
        var obj2 = obj[key];

        if( SPEC.shouldExplore(obj2) ){
            if (depth < SPEC.MAX_SEARCH_DEPTH) {
                try{ 
                    SPEC.recursivelyExplore(obj2, path + "." + key, depth + 1); 
                } 
                catch (e){ }
            }
        }
        else if( obj2!==null && typeof obj2 === 'function' && !obj2.__IsWrapped && ( SPEC.DETOUR_NATIVE_FUNCS || SPEC.isCustom(obj2) ) ){
            if ( SPEC.log.length > 8192 ) {
                console.log(SPEC.log);
                SPEC.log = "";
            }
            // janky hack mate, thanks
            // https://traceoverflow.com/questions/9134686/adding-code-to-a-javascript-function-programmatically
            obj[key] = (function() {
                var cached_function = obj2;
                SPEC.locations[cached_function] = path+"."+key;
                return function() {

                    console.groupCollapsed(SPEC.or(cached_function.name,"anonymous") + "(" + SPEC.join([...arguments]) + ");");
                        console.log(new SPEC.construct([...arguments]));
                        console.log(cached_function);
                        console.log("Stack Trace:\n" + SPEC.trace());
                        console.log("Location:\n" + SPEC.locations[cached_function]);
                    console.groupEnd();

                    var result = cached_function.apply(this, arguments); // use .apply() to call it
                    return result;
                };
            })();
            SPEC.log = SPEC.log + "DETOURED FUNC: " + (obj2+"").split(")")[0] + "){...}\n";
            obj[key].__IsWrapped = true;
        }

    }
}
SPEC.recursivelyExplore(window, "window", 0);
console.log(SPEC.log);