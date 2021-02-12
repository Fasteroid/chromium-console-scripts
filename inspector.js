/**************************************
*  Fast's JS Function Call Inspector: *
*       Chrome Console Edition        *
**************************************/
var inspector = { detours: new WeakMap() };

/*  HOW TO USE:
    Paste in chrome console and hit enter.  Click on debug log events to expand them.  
    Call inspector.revert() on detoured functions to unhook them from the detour system.
    Add any problematic functions or objects to BANNED_PATHS to ban traversing them.  
*/

inspector.MAX_SEARCH_DEPTH = 5;     // Max recursive depth to search.
inspector.DETOUR_METAMETHODS = true; // Be prepared to add entries to BANNED_KEYS to prevent the site from breaking with this on.
inspector.GROUPING_MODE      = console.group  // or console.groupCollapsed

// Something specific spamming console?  Completely breaking the website?  Add it here.  Feel free to make PRs with your additions.
inspector.BANNED_PATHS = [

    // general torture
    "['document']","['frameElement']",

    // jQuery memes
    "window['$']['fn']['init']","window['$']['event']","window['$']['Event']","window['$']['find']",

    // &what; unicode database (amp-what.com)
    "window['_rollbarShims']","window['Rollbar']",

    // YouTube
    "window['Polymer']","window['ytPubsubPubsubInstance']"

]; 

{ 
    // TODO: rework these functions so that they're pretty to look at in console
    inspector.join = function(array){ var output = []; for (let index = 0; index < array.length; index++) { if( array[index] != null ){ if( typeof array[index] === 'string' ){ output[index] = "'" + array[index] + "'"; } else{ output[index] = array[index]; } } else{ output[index] = "null"} } return output.join(", "); } // display null properly
    inspector.trace = function(){ let trace = (new Error().stack).replaceAll("    ","").split("at ").splice(3); var output = []; for (let index = 0; index < trace.length; index++) { output[index] = " ".repeat(index+1) + trace[index]; } return output.join(""); } // get fancy stack trace
    inspector.argobj = function Arguments( args ) { for (let index = 0; index < args.length; index++) { this[index] = args[index]; } } // names the object "Arguments" in console
    inspector.returnobj = function Returned( obj ) { this.result = obj } // names the object "Arguments" in console
    inspector.originobj = function Origins( obj ) { this.function = obj }

    inspector.handleLogging = function(data, args, result, exception){
        try{
            if(!exception){
                console.groupCollapsed(data.location + "(" + inspector.join([...args]) + ");");
            }
            else{
                console.group(data.location + "(" + inspector.join([...args]) + ");");
                console.warn("Exception Thrown.");
            }
            if(args.length > 0){
                console.log(new inspector.argobj([...args]));
            }
            if( result != undefined ){ // printing null might be important here
                console.log(new inspector.returnobj(result));
            }
            console.log("Stack Trace:\n" + inspector.trace());
        }
        finally{
            console.groupEnd();
        }
    }
}

inspector.includesPartial = function(strings,string){
    for (const key in strings) {
        if(string.includes(strings[key])){ return true; }
    }
    return false;
}

inspector.isBanned = function(key){
    if( key == "window['inspector']" ){ return true; }
    if( inspector.BANNED_PATHS.includes(key) ){ 
        return true;
    }
    if( inspector.includesPartial(inspector.BANNED_PATHS,key) ){ 
        return true;
    }
    return false;
}

inspector.revert = function(detoured_function){
    let old = inspector.detours.get(detoured_function);
    if( old ){
        old();
        console.log("Function unhooked.")
    }
    inspector.detours.delete(detoured_function);
}

inspector.cloneProperties = function(parent,child){
    for(var key in parent) { // clone properties from old to new
        if(parent.hasOwnProperty(key)) {
            child[key] = parent[key];
        }
    }
}

inspector.detour = function(obj,key,func,path) {

    console.log(`detouring function at ${path}`)

    var metadata = { }
    metadata.name = key;
    metadata.location = path;
    metadata.old = func;

    let detoured_function = function() {
        let result;
        try{ result = func.apply(this,arguments); } // use .apply() to call it
        catch(e){ inspector.handleLogging(metadata,arguments,e,true); throw e; } // throw any caught exceptions
        inspector.handleLogging(metadata,arguments,result);
        return result;
    };

    inspector.detours.set(detoured_function,function(){obj[key] = func}); // make it easy to revert without adding any fields to the new function

    inspector.cloneProperties(func,detoured_function);

    obj[key] = detoured_function;

}

inspector.recurse = function(obj, path, depth=0, relpath=path, refs=new WeakSet()) {    

    if( depth > inspector.MAX_SEARCH_DEPTH ){ return; }

    // Avoid infinite recursion
    if(refs.has(obj)){ return; }
    else if( obj!=null ){ refs.add(obj); }
    let group = depth > 0;

    for (const key in obj) {
        try{
            let value = obj[key]; // if we hit a css sheet this will throw an exception
            if( value == window ){ continue; }
            let type = typeof(value)
            let newpath = `${path}['${key}']`;
            let doDetour = false;
            switch(type){
                case 'function':
                    doDetour = true;
                    if( !inspector.DETOUR_METAMETHODS ){ break; }
                case 'object':
                    if( inspector.isBanned(newpath) ){ continue; }
                    if( group && doDetour ){ group = false; inspector.GROUPING_MODE(relpath); }
                    inspector.recurse(value, newpath, depth+1, key, refs);     
                break;
            }
            if(doDetour){
                inspector.detour(obj,key,value,newpath); // this has to be here due to recursion order 
            }
        }
        catch(e){
            console.log("Traversal Error")
        }
    }
    if( !group ){
        console.groupEnd();
    }

}
console.groupCollapsed("Detours")
inspector.recurse(window, "window");
console.groupEnd()