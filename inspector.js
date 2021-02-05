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
inspector.burstTime             = 100; // in ms

// helper functions
inspector.shouldExplore = function(val) { try {  if (val === undefined || val === null) { return false } if (val + "" == "[object Window]") { return false; } return typeof val === 'object'; } catch (e) { return false; } } // avoid infinite recursion
inspector.join = function(array){ var output = []; for (let index = 0; index < array.length; index++) { if( array[index] != null ){ if( typeof array[index] === 'string' ){ output[index] = "'" + array[index] + "'"; } else{ output[index] = array[index]; } } else{ output[index] = "null"} } return output.join(", "); } // display null properly
inspector.isCustom = function(f){ return !(/\{\s*\[native code\]\s*\}/).test(f); } // does it have native code?
inspector.trace = function(){ let trace = (new Error().stack).replaceAll("    ","").split("at ").splice(3); var output = []; for (let index = 0; index < trace.length; index++) { output[index] = " ".repeat(index+1) + trace[index]; } return output.join(""); } // get fancy stack trace
inspector.argobj = function Arguments( args ) { for (let index = 0; index < args.length; index++) { this[index] = args[index]; } } // names the object "Arguments" in console
inspector.returnobj = function Returned( obj ) { this.result = obj } // names the object "Arguments" in console
inspector.originobj = function Origins( obj ) { this.function = obj }
inspector.justify = function(string,value){ return string + "\t".repeat(Math.max(0,Math.ceil((value-string.length)/4))) } // aligns text
inspector.resetAntiSpam = function(){ inspector.logs = 0; setTimeout( inspector.resetAntiSpam, inspector.burstTime ); }
inspector.resetAntiSpam();

inspector.handleLogging = function(data, args, result, exception){
    if( (inspector.burstLimit <= 0 || inspector.logs < inspector.burstLimit) ){
        inspector.logs++;
        try{
            console.groupCollapsed(data.location + "(" + inspector.join([...args]) + ");");
            if(args.length > 0){
                console.log(new inspector.argobj([...args]));
            }
            if( result ){
                console.log(new inspector.returnobj(result));
            }
            console.log("Stack Trace:\n" + inspector.trace());
            if( !exception || exception.passed ){
                console.log("To Unhook:\n" + data.location + " = " + data.location + ".old;");
            }
            else{
                console.warn("Unhooked.")
            }
            console.log(data.function);
        }
        finally{
            console.groupEnd();
        }
    }
}

inspector.seed = Math.random();
inspector.firstDetours = { }

inspector.detour = function (obj, root="", path=root, depth=0) { 
    if( depth > inspector.MAX_SEARCH_DEPTH ) { return; }
    if( depth == 0 ){ inspector.firstDetours[root] = false; }
    if( obj._inspector_breadcrumb == inspector.seed ) { return; }
    obj._inspector_breadcrumb = inspector.seed;
    try{
        for (const key in obj) {
            if( !obj.hasOwnProperty(key) ) { continue; }
            var obj2 = obj[key];
            if( inspector.shouldExplore(obj2) ){
                if( inspector.BANNED_KEYS.includes(key) ){ continue; }
                inspector.detour(obj2, root, path+"."+key, depth+1); 
            }
            else if( 
                (obj2!==null) && (obj2!=undefined) && 
                (typeof obj2 === 'function') && 
                ( !obj2._wrapped ) &&
                ( inspector.DETOUR_NATIVE_FUNCS || inspector.isCustom(obj2) ) 
            ){

                if( inspector.BANNED_FUNCTIONS.includes(key) ){ continue; }
                if( !inspector.firstDetours[root] ){ 
                    console.groupCollapsed("Detoured Function List"); 
                    inspector.firstDetours[root] = true;
                }
                inspector.log[inspector.log.length] = inspector.justify( (obj2+"").split(")")[0] + "){...} ", 32) + " >\t\t"+ path+"."+key;                
                
                // janky hack mate, thanks
                // https://traceoverflow.com/questions/9134686/adding-code-to-a-javascript-function-programmatically
                obj[key] = (function() {

                    let data = {};
                    data.function = obj2;
                    data.location = path+"."+key;
                    data.parent   = obj;
                    data.key      = key;
                    let func_name;
                    if( data.function.name != "" ){
                        func_name = obj2.name + " [detoured "+data.location+"]"
                    }
                    else{
                        func_name = key + " [detoured "+data.location+"]"
                    }

                    var detoured = {[func_name]: function() { /* INSPECTOR-WRAPPED FUNCTION */
                        let result;
                        let exception;

                        try{ 
                            result = data.function.apply(this, arguments); // use .apply() to call the original function
                        }
                        catch(e){
                            if( !e.passed ){ // only revert the culprit
                                console.warn("WARNING: function '"+data.location+"' threw an exception, unhooking.")
                                data.parent[data.key] = data.function;
                                exception = e;
                            }
                        }

                        if( arguments[0] == inspector.resetAntiSpam ){ return result; } // skip everything after this if this is setTimeout antispam

                        inspector.handleLogging(data,arguments,result,exception);
                        if(exception){ 
                            exception.passed = true;
                            throw exception
                        } // make sure to still throw any exceptions after we log them

                        return result;

                    }}[func_name];

                    // fixes weird functions that have their own data fields
                    for (const key in obj2) {
                        if (Object.hasOwnProperty.call(obj2, key)) {
                            detoured[key] = obj2[key];
                        }
                    }

                    detoured._wrapped = true;
                    detoured.code     = data.function;
                    detoured.old      = obj2;

                    return detoured;
                })();

                if(inspector.log.length > 64){
                    console.log(inspector.log.join("\n"));
                    inspector.log = [];
                }

            }
        }
    }
    finally{
        if( depth == 0 & inspector.firstDetours[root] ){
            console.log(inspector.log.join("\n"));
            inspector.log = [];    
            console.groupEnd();   
        }
    }
}
inspector.detour(window, "window");
