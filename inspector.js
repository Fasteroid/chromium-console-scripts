/**************************************
*  Fast's JS Function Call Inspector: *
*       Chrome Console Edition        *
**************************************/
var inspector = { traversed: {}, log: [], logs: 0, path: 0 };

/*  HOW TO USE:
 *  Paste into chrome console and smash enter to gain  T O T A L   O M N I P R E S E N C E!
 *  You can also detour subsets of the website by calling inspector.detour(window.subset);
 * 
 *  The antispam parameters are used to make sure chrome console isn't overwhelmed:
 *    inspector.burstTime    > how long each 'burst' lasts in ms
 *    inspector.burstLimit   > the max messages to log per burst
 * 
 *  All detoured functions will have these fields:
 *    .code  >  is what will be run instead of the original function.  This will be a call-logging detour by default.
 *    .old   >  will be the original non-detoured function.  Use this to revert function detours.
*/

inspector.BANNED_KEYS           = ["inspector"]; // searching for functions will stop at these keys
inspector.BANNED_FUNCTIONS      = ["log"];       // functions under these keys will be left alone
inspector.MAX_SEARCH_DEPTH      = 6;             // max recursive depth to look for functions
inspector.DETOUR_NATIVE_FUNCS   = false;         // detour [native code] ?
inspector.burstLimit            = 64;
inspector.burstTime             = 0;

// helper functions
inspector.shouldExplore = function(val) { try {  if (val === undefined || val === null) { return false } if (val + "" == "[object Window]") { return false; } return typeof val === 'object'; } catch (e) { return false; } } // avoid infinite recursion
inspector.join = function(array){ var output = []; for (let index = 0; index < array.length; index++) { if( array[index] != null ){ if( typeof array[index] === 'string' ){ output[index] = "'" + array[index] + "'"; } else{ output[index] = array[index]; } } else{ output[index] = "null"} } return output.join(", "); } // display null properly
inspector.isCustom = function(f){ return !(/\{\s*\[native code\]\s*\}/).test(f); } // does it have native code?
inspector.trace = function(){ let trace = (new Error().stack).replaceAll("   ","  ").split("at ").splice(2); var output = []; for (let index = 0; index < trace.length; index++) { output[index] = " ".repeat(index) + trace[index]; } return output.join(""); } // get fancy stack trace
inspector.argobject = function Arguments( args ) { for (let index = 0; index < args.length; index++) { this[index] = args[index]; } } // names the object "Arguments" in console
inspector.returnobj = function Returned( obj ) { this.result = obj } // names the object "Arguments" in console
inspector.justify = function(string,value){ return string + "\t".repeat(Math.max(0,Math.ceil((value-string.length)/4))) } // aligns text
inspector.resetAntiSpam = function(){ inspector.logs = 0; setTimeout( inspector.resetAntiSpam, inspector.burstTime ); }
inspector.resetAntiSpam();

inspector.detour = function (obj, path, depth) { 
    if( path == undefined ){ inspector.path++; path="<"+inspector.path+">"; }
    if( inspector.traversed[obj] ){ return; }
    if( depth > inspector.MAX_SEARCH_DEPTH ) { return; }
    if( depth == undefined ){ depth = 0 };
    if( depth == 0 ){
        console.groupCollapsed("Detoured Function List");
    }
    inspector.traversed[obj] = true;
    for (const key in obj) {
        if( !obj.hasOwnProperty(key) ) { continue; }
        var obj2 = obj[key];
        if( inspector.shouldExplore(obj2) ){
            if( inspector.BANNED_KEYS.includes(key) ){ continue; }
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
            if( inspector.BANNED_FUNCTIONS.includes(key) ){ continue; }
            // janky hack mate, thanks
            // https://traceoverflow.com/questions/9134686/adding-code-to-a-javascript-function-programmatically
            inspector.log[inspector.log.length] = inspector.justify( (obj2+"").split(")")[0] + "){...} ", 32) + " >\t\t"+ path+"."+key;
            obj[key] = (function() {
                let data = {};
                data._function = obj2;
                data._location = path+"."+key;
                data._parent   = obj;
                data._key      = key;
                var new_function = {[obj2.name+" (detoured)"]: function() { /* INSPECTOR-WRAPPED FUNCTION */
                    if( arguments[1]!=inspector.resetAntiSpam && (inspector.burstLimit <= 0 || inspector.logs < inspector.burstLimit) ){
                        inspector.logs++;
                        var result;
                        try{
                            result = data._function.apply(this, arguments); // use .apply() to call it
                            console.groupCollapsed(data._location + "(" + inspector.join([...arguments]) + ");");
                            console.log(new inspector.argobject([...arguments]));
                            console.log(new inspector.returnobj(result));
                            if(obj2.name){
                                console.log("Name: "+obj2.name);
                            }
                            console.log("Stack Trace:\n" + inspector.trace());
                            console.log("To Unhook:\n" + data._location + " = " + data._location + ".old;");
                            console.log(data._function);
                        }
                        catch(e){
                            console.warn("WARNING: Detoured function '" + data._location + "' threw an exception.  You should probably put it in the function blacklist and refresh.");
                            data._parent[data._key] = data._function;
                        }
                        finally{
                            console.groupEnd();
                        }
                        return result;
                    }
                }}[data._function.name+" (detoured)"];
                // fixes weird functions that have their own data fields
                for (const key in obj2) {
                    if (Object.hasOwnProperty.call(obj2, key)) {
                        new_function[key] = obj2[key];
                    }
                }
                new_function._wrapped = true;
                new_function._code     = data._function;
                new_function._old      = obj2;
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
inspector.detour(window, "window");
