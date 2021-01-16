/**************************************
*  Fast's JS Function Call Inspector: *
*      Chrome Console Edition    *
**************************************/
var spec = [];

/*  HOW TO USE:
 *  Paste into chrome console and smash enter to gain  T O T A L   O M N I P R E S E N C E!
 *  If total omnipresence breaks the website, try individually detouring elements instead.
 *  The script will try to not detour constructors if DETOUR_CONSTRUCTORS is false.
*/
spec.EXPLORATION_BLACKLIST = ["spec","$","jQuery","Ajax","React","angular"]; 
spec.FUNCTION_BLACKLIST    = ["log"];
spec.MAX_SEARCH_DEPTH      = 6;
spec.DETOUR_NATIVE_FUNCS   = false;
spec.DETOUR_CONSTRUCTORS   = false;
spec.ANTISPAM_INTERVAL     = 10;

// helper functions don't touch
spec.shouldExplore = function(val) { try {  if (val === undefined || val === null) { return false } if (val + "" == "[object Window]") { return false; } return typeof val === 'object'; } catch (e) { return false; } }
spec.doAntispam = spec.ANTISPAM_INTERVAL > 0;
if( spec.doAntispam ){ spec.loggable = false; spec.antispam = function(){ spec.loggable = true; setTimeout(spec.antispam, spec.ANTISPAM_INTERVAL) }; spec.antispam(); }
spec.join = function(array){ var output = []; for (let index = 0; index < array.length; index++) { if( array[index] != null ){ if( typeof array[index] === 'string' ){ output[index] = "'" + array[index] + "'"; } else{ output[index] = array[index]; } } else{ output[index] = "null"} } return output.join(", "); }
spec.isCustom = function(f){ return !(/\{\s*\[native code\]\s*\}/).test(f); }
spec.or = function(a,b){ if( a != "" ){ return a; } return b; }
spec.trace = function(){ let trace = (new Error().stack).replaceAll("   ","  ").split("at ").splice(2); var output = []; for (let index = 0; index < trace.length; index++) { output[index] = " ".repeat(index) + trace[index]; } return output.join(""); }
spec.construct = function Arguments( args ) { for (let index = 0; index < args.length; index++) { this[index] = args[index]; } }
spec.isConstructor = function(key) { key = key+"a"; let charCode = key.charCodeAt(0); return (charCode >= 65) && (charCode <= 90); }

spec.traversed = { }
spec.log = "";
spec.logcount = 0;

spec.detour = function (obj, path, depth) { 
    if( depth == undefined ){ depth = 0 };
    if( spec.traversed[path] ){ return; }
    if( depth > spec.MAX_SEARCH_DEPTH ) { return; }
    spec.traversed[path] = true;
    for (const key in obj) {
        if( !obj.hasOwnProperty(key) ) { continue; }
        var obj2 = obj[key];
        if( spec.shouldExplore(obj2) ){
            if( spec.EXPLORATION_BLACKLIST.includes(key) ){ continue; }
            try{ 
                spec.detour(obj2, path + "." + key, depth + 1); 
            } 
            catch (e){ }
        }
        else if( 
            ( spec.DETOUR_CONSTRUCTORS || !spec.isConstructor(key) ) &&   
            (obj2!==null) && (obj2!=undefined) && 
            (typeof obj2 === 'function') && 
            (!obj2.__IsWrapped) &&
            ( spec.DETOUR_NATIVE_FUNCS || spec.isCustom(obj2) ) 
        ){
            if( spec.FUNCTION_BLACKLIST.includes(key) ){ continue; }
            // janky hack mate, thanks
            // https://traceoverflow.com/questions/9134686/adding-code-to-a-javascript-function-programmatically
            spec.log = spec.log + ( (obj2+"").split(")")[0] + "){...} @ "+ path+"."+key + "\n" );
            spec.logcount++;
            obj[key] = (function() {
                var cached_function = obj2;
                cached_function.override = cached_function;
                cached_function.__IsWrapped = true;
                cached_function.__Location  = path+"."+key;
                cached_function.__Path = path+".";
                var new_function = {[cached_function.name]: function() { // new wrapped function
                    if( spec.loggable ){
                        spec.loggable = !spec.doAntispam;
                        try{
                            console.groupCollapsed(cached_function.__Path + spec.or(cached_function.name,"<anonymous>") + "(" + spec.join([...arguments]) + ");");
                            console.log(new spec.construct([...arguments]));
                            console.log(cached_function.override);
                            console.log("Stack Trace:\n" + spec.trace());
                            console.log("Location:\n" + cached_function.__Location);
                            console.log("To Unhook:\n" + cached_function.__Location + " = " + cached_function.__Location + ".old;");
                        }
                        finally{
                            console.groupEnd();
                        }
                    }
                    var result = cached_function.override.apply(this, arguments); // use .apply() to call it
                    if(result != undefined){
                        return result;
                    }
                }}[cached_function.name];
                new_function.name
                new_function.__IsWrapped = true;
                new_function.old  = cached_function;
                return new_function;
            })();
        }
    }
    if(depth==0){
        console.groupCollapsed("Detoured "+spec.logcount+" functions.")
            console.log(spec.log);
        console.groupEnd();
        spec.log = "";
        spec.logcount = 0;
    }
}
spec.detour(window, "window", 0);
