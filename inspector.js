/**************************************
*  Fast's JS Function Call Inspector: *
*       Chrome Console Edition        *
**************************************/
var inspector = { detours: new WeakMap(), spamcounter: 0 };

/*  HOW TO USE:
    Paste in chrome console and hit enter.  Click on debug log events to expand them.  
    Call inspector.revert() on detoured functions to unhook them from the detour system.
    Add any problematic functions or objects to BANNED_PATHS to ban traversing them.  
*/

inspector.MAX_SEARCH_DEPTH   = 5;             // Max recursive depth to search.
inspector.DETOUR_METAMETHODS = true;          // Look for functions stored under functions and detour those too!
inspector.ANTISPAM_INTERVAL  = 1000           // in ms
inspector.ANTISPAM_QUOTA     = 64             // max logs per interval
inspector.GROUPING_MODE      = console.group  // or console.groupCollapsed

// Something specific spamming console?  Completely breaking the website?  Add it here.  Feel free to make PRs with your additions.
inspector.BANNED_PATHS = [
    "['document']"
]; 

inspector.antispam = function(){ inspector.spamcounter = 0; setTimeout(inspector.antispam,inspector.ANTISPAM_INTERVAL) }
inspector.antispam()

{ 
    // TODO: rework these functions so that they're pretty to look at in console
    inspector.join = function(array){ var output = []; for (let index = 0; index < array.length; index++) { if( array[index] != null ){ if( typeof array[index] === 'string' ){ output[index] = "'" + array[index] + "'"; } else{ output[index] = array[index]; } } else{ output[index] = "null"} } return output.join(", "); } // display null properly
    inspector.trace = function(){ let trace = (new Error().stack).replaceAll("    ","").split("at ").splice(3); var output = []; for (let index = 0; index < trace.length; index++) { output[index] = " ".repeat(index+1) + trace[index]; } return output.join(""); } // get fancy stack trace
    inspector.argobj = function Arguments( args ) { for (let index = 0; index < args.length; index++) { this[index] = args[index]; } } // names the object "Arguments" in console
    inspector.returnobj = function Returned( obj ) { this.result = obj } // names the object "Arguments" in console
    inspector.originobj = function Origins( obj ) { this.function = obj }

    inspector.handleLogging = function(data, args, result){
        if(inspector.spamcounter == inspector.ANTISPAM_QUOTA){ console.warn(`ANTISPAM: Suppressing further logs for the next ${inspector.ANTISPAM_INTERVAL} ms`) }
        if(inspector.spamcounter > inspector.ANTISPAM_QUOTA){ return }
        if(args[0] == inspector.antispam){ return }
        try{
            inspector.spamcounter++;
            console.groupCollapsed(`${data.location}(${inspector.join(args)});`);
            if(args.length > 0){
                console.log(new inspector.argobj(args));
            }
            if( typeof result !== 'undefined' ){ // printing null might be important here
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
        old.revert();
        console.log("Function unhooked.")
    }
    inspector.detours.delete(detoured_function);
}

inspector.getOld = function(detoured_function){
    let old = inspector.detours.get(detoured_function);
    return old.get();
}

inspector.cloneProperties = function(parent,child){
    for(var key in parent) { // clone properties from old to new
        if(parent.hasOwnProperty(key)) {
            child[key] = parent[key];
        }
    }
}

inspector.detour = function(obj,key,path="unknown") {

    let func = obj[key];

    // I had a 1-on-1 talk with $.fn.init and found out the value of 'this' was different between the original func and the detoured one
    // hopefully I can find a way to get and use the correct 'this' in the detoured calls
    
    if(func.toString().includes("this")){ 
        console.warn(`WARNING: function at ${path} contained 'this'.  I can't hook those functions yet.`)
        return false;
    }
    else{
        console.log(`detouring function at ${path}`)
    }

    let metadata = { }
    metadata.location = `${path}['${key}']`;
    metadata.old      = func;
    let func_name = metadata.location + " [detoured]"

    let detoured_function = {[func_name]: (function() {
        let result = func.apply(this,arguments);
        inspector.handleLogging(metadata,arguments,result);
        if( result != undefined ){
            return result; 
        }
    })}[func_name]

    inspector.detours.set(detoured_function,{ // make it easy to revert without adding any fields to the new function
        revert: (function(){obj[key] = func}),
        get: (function(){return func})
    }); 

    inspector.cloneProperties(func,detoured_function);

    obj[key] = detoured_function;
    return true;

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
                inspector.detour(obj,key,newpath); // this has to be here due to recursion order 
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
