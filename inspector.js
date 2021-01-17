/**************************************
*  Fast's JS Function Call Inspector: *
*       Chrome Console Edition        *
**************************************/
var inspector = { traversed: {}, log: [], logs: 0 };

/*  HOW TO USE:
 *  Paste into chrome console and smash enter to gain  T O T A L   O M N I P R E S E N C E!
 *  You can also detour subsets of the website by calling inspector.detour(window.subset);
 *  The antispam parameters are used to make sure chrome console isn't overwhelmed.
 * 
 *  FOR ALL DETOURED FUNCTIONS:
 *    ._code is what will be run instead of the original function.  This will be a call-logging detour by default.
 *    ._old will be the original non-detoured function.  Use this to revert function detours.
*/
inspector.EXPLORATION_BLACKLIST = ["inspector"];
inspector.FUNCTION_BLACKLIST    = ["log"];
inspector.MAX_SEARCH_DEPTH      = 6;
inspector.DETOUR_NATIVE_FUNCS   = false;

inspector.LOG_BURST_LIMIT  = 64;  
inspector.LOG_BURST_RESET  = 100; // in ms

// helper functions
inspector.shouldExplore = function(val) { try {  if (val === undefined || val === null) { return false } if (val + "" == "[object Window]") { return false; } return typeof val === 'object'; } catch (e) { return false; } } // avoid infinite recursion
inspector.join = function(array){ var output = []; for (let index = 0; index < array.length; index++) { if( array[index] != null ){ if( typeof array[index] === 'string' ){ output[index] = "'" + array[index] + "'"; } else{ output[index] = array[index]; } } else{ output[index] = "null"} } return output.join(", "); } // display null properly
inspector.isCustom = function(f){ return !(/\{\s*\[native code\]\s*\}/).test(f); } // does it have native code?
inspector.trace = function(){ let trace = (new Error().stack).replaceAll("   ","  ").split("at ").splice(2); var output = []; for (let index = 0; index < trace.length; index++) { output[index] = " ".repeat(index) + trace[index]; } return output.join(""); } // get fancy stack trace
inspector.construct = function Arguments( args ) { for (let index = 0; index < args.length; index++) { this[index] = args[index]; } } // names the object "Arguments" in console
inspector.justify = function(string,value){ return string + "\t".repeat(Math.max(0,Math.ceil((value-string.length)/4))) } // aligns text

inspector.resetAntiSpam = function(){ inspector.logs = 0; setTimeout( inspector.resetAntiSpam, inspector.LOG_BURST_RESET ); }
inspector.resetAntiSpam();

inspector.detour = function (obj, path, depth) { 
    if( depth == undefined ){ depth = 0 };
    if( depth == 0 ){
        console.groupCollapsed("Detoured Function List");
    }
    if( inspector.traversed[path] ){ return; }
    if( depth > inspector.MAX_SEARCH_DEPTH ) { return; }
    inspector.traversed[path] = true;
    for (const key in obj) {
        if( !obj.hasOwnProperty(key) ) { continue; }
        var obj2 = obj[key];
        if( inspector.shouldExplore(obj2) ){
            if( inspector.EXPLORATION_BLACKLIST.includes(key) ){ continue; }
            try{ 
                inspector.detour(obj2, path + "." + key, depth + 1); 
            } 
            catch (e){ }
        }
        else if( 
            (obj2!==null) && (obj2!=undefined) && 
            (typeof obj2 === 'function') && 
            (!obj2._wrapped) &&
            ( inspector.DETOUR_NATIVE_FUNCS || inspector.isCustom(obj2) ) 
        ){
            if( inspector.FUNCTION_BLACKLIST.includes(key) ){ continue; }
            // janky hack mate, thanks
            // https://traceoverflow.com/questions/9134686/adding-code-to-a-javascript-function-programmatically
            inspector.log[inspector.log.length] = inspector.justify( (obj2+"").split(")")[0] + "){...} ", 32) + " >\t\t"+ path+"."+key;
            obj[key] = (function() {
                let data = {};
                data._function = obj2;
                data._location = path+"."+key;
                var new_function = {[obj2.name]: function() { // new wrapped function
                    if( arguments[1]!=inspector.resetAntiSpam && (inspector.LOG_BURST_LIMIT <= 0 || inspector.logs < inspector.LOG_BURST_LIMIT) ){
                        inspector.logs++;
                        try{
                            console.groupCollapsed(data._location + "(" + inspector.join([...arguments]) + ");");
                            console.log(new inspector.construct([...arguments]));
                            console.log(data.override);
                            console.log("Name: "+data)
                            console.log("Stack Trace:\n" + inspector.trace());
                            console.log("To Unhook:\n" + data._location + " = " + data._location + ".old;");
                        }
                        finally{
                            console.groupEnd();
                        }
                    }
                    var result = data._function.apply(this, arguments); // use .apply() to call it
                    if(result != undefined){
                        return result;
                    }
                }}[data._function.name];
                // fixes weird functions that have their own data fields
                for (const key in obj2) {
                    if (Object.hasOwnProperty.call(obj2, key)) {
                        new_function[key] = obj2[key];
                    }
                }
                new_function._wrapped = true;
                new_function._code    = data._function;
                new_function._old     = obj2;
                return new_function;
            })();
            if(inspector.log.length > 64){
                console.log(inspector.log.join("\n"));
                inspector.log = [];
            }
        }
    }
    if(depth == 0){
        console.log(inspector.log.join("\n"));
        inspector.log = [];    
        console.groupEnd();   
    }
}
inspector.detour(window, "window", 0);
