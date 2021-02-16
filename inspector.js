/**************************************
*  Fast's JS Function Call Inspector: *
*       Chrome Console Edition        *
**************************************/
var inspector = { 
    detours: new WeakMap(), 
    spamcounter: 0, 
    isCursedKey: (key) => key.match(/[^(a-z|$|_|A-Z)]/), 
    isBanned: (key) => key == "window.inspector" || key=="window.performance" || inspector.BANNED_PATHS.includes(key) || inspector.includesPartial(inspector.BANNED_PATHS,key), // pls don't remove hardcoded values from here
    antispam: () => { inspector.spamcounter = 0; setTimeout(inspector.antispam,inspector.ANTISPAM_INTERVAL); },
    ttime: 0
};

/*  HOW TO USE:
    Paste in chrome console and hit enter.  Click on debug log events to expand them.  
    Call inspector.unhook() on a detoured function to unhook it from the detour system.
    Call inspector.getOld() on a detoured function to get the original function.
    Add any problematic functions or objects to BANNED_PATHS to ban traversing them.  
*/

inspector.MAX_SEARCH_DEPTH   = 5;             // Max recursive depth to search.
inspector.DETOUR_METAMETHODS = true;          // Look for functions stored under functions and detour those too!
inspector.ANTISPAM_INTERVAL  = 1000;          // in ms
inspector.ANTISPAM_QUOTA     = 64;            // max logs per interval
inspector.LIST_GROUPING_MODE = console.group; // or console.groupCollapsed
inspector.LIST_DETOURED      = true;          // list all attempted detours
inspector.MIN_CPU_TO_LOG     = 50;            // don't log any calls that take less than this

// Something specific spamming console?  Completely breaking the website?  Add it here.  Supports both full paths and substrings of paths.
// Feel free to make a PR if you find something nasty I haven't added yet.
inspector.BANNED_PATHS = [
    "window.document","frameElement","webpackJsonp","cssRules","document",".apply"
]; 

inspector.COLORS = {  // inspired by Wiremod's Expression 2 Language in Garry's Mod
    string:    "color: #999999;",
    number:    "color: #ff6666;",
    bigint:    "color: #a45b5b;",
    boolean:   "color: #668cff;",
    symbol:    "color: #fbfb51;",
    object:    "color: #80ff80;",
    undefined: "color: #ffb56b;",
    function:  "color: #fc83fc;",
    null:      "color: #4d804d;",
    default:   "color: #dddddd"
};

inspector.antispam(); // kick off antispam

inspector.getPath = function(path,key){
    if( inspector.isCursedKey(key) ){
        if( parseInt(key) != NaN ){ // int
            return `${path}[${key}]`;
        }
        else{ // something nasty
            return `${path}[\`${key}\`]`;
        }
    }
    else{
        return `${path}.${key}`;
    }
};

if( inspector.LIST_DETOURED ){
    inspector.logDetoured = function(path,success){
        if( success ){
            console.log(`success: ${path}`);
        }
        else{
            console.log(`ignored: %c${path}`,"color: #666666;");
        }
    };
}
else{
    inspector.logDetoured = () => {};
}

inspector.getPrettyCall = function(data,args){
    let tags = [`%c ${(data.ctime).toFixed(0)}us %c| `,inspector.COLORS.string,inspector.COLORS.default];
    if(args.length==0){
        tags[0] += `${data.location}();`
        return tags;
    }
    const colors = inspector.COLORS; // tiny perf save
    for (let i = 0; i < args.length; i++) {
        const type = args[i]===null ? 'null' : typeof(args[i]);
        tags[tags.length] = colors[type]
        tags[tags.length] = colors.default; // argument separators
    }
    tags[0] += `${data.location}(%c${inspector.join(args)}%c);`;
    return tags;
}

inspector.join = function(array){ 
    var output = []; 
    for (let index = 0; index < array.length; index++){ 
        if( array[index] === null ){ 
            output[index] = "null";
        } 
        else{ 
            let type = typeof(array[index])
            switch( type ){
                case 'string': output[index] = `\`${array[index]}\``; break;
                case 'object': output[index] = `[Object ${(inspector.getOld(array[index].constructor).name)}]`; break;
                case 'undefined': output[index] = 'undefined'; break;
                default: output[index] = array[index]; break;
            }
        } 
    } 
    return output.join("%c, %c"); 
}; // display null properly

inspector.trace = function(){ let trace = (new Error().stack).replaceAll("    ","").split("at ").splice(3); var output = []; for (let index = 0; index < trace.length; index++) { output[index] = " ".repeat(index+1) + trace[index]; } return output.join(""); }; // get fancy stack trace
inspector.argobj = function Arguments( args ) { for (let index = 0; index < args.length; index++) { this[index] = args[index]; } }; // names the object "Returned" in console
inspector.returnobj = function Returned( obj ) { this.result = obj; }; // names the object "Arguments" in console

inspector.handleLogging = function(data, args, result){

    if(args[0] == inspector.antispam){ return; } // ignore antispam setTimeout calls
    if(data.ctime < inspector.MIN_CPU_TO_LOG){ return; } // boooring
    if(inspector.spamcounter == inspector.ANTISPAM_QUOTA){ console.warn(`ANTISPAM: Suppressing further logs for the next ${inspector.ANTISPAM_INTERVAL} ms`); }
    if(inspector.spamcounter > inspector.ANTISPAM_QUOTA){ return; }
    inspector.spamcounter++;

    try{
        console.groupCollapsed.apply(this,inspector.getPrettyCall(data,args));
            if(args.length > 0){ console.log(new inspector.argobj(args)); }
            if( typeof result !== 'undefined' ){ console.log(new inspector.returnobj(result)); }
            console.log(data.old);
            console.log("Stack Trace:\n" + inspector.trace());

    }
    finally{
        console.groupEnd();
    }

};

inspector.includesPartial = function(strings,string){
    for (const key in strings) {
        if(string.includes(strings[key])){ return true; }
    }
    return false;
};

inspector.unhook = function(detoured_function){
    let old = inspector.detours.get(detoured_function);
    if( old ){
        old.revert();
        console.log("Function unhooked.");
        inspector.detours.delete(detoured_function);
        return true;
    }
    return false;
};

inspector.getOld = function(detoured_function){
    let old = inspector.detours.get(detoured_function);
    if( old ){
        return old.get();
    }
    return detoured_function;
};

inspector.cloneProperties = function(parent,child){
    for(var key in parent) { // clone properties from old to new
        if(parent.hasOwnProperty(key)) {
            child[key] = parent[key];
        }
    }
};

inspector.detour = function(obj,key,path="unknown") {
    try{
        let func = obj[key];

        // I had a 1-on-1 talk with $.fn.init and found out the value of 'this' was different between the original func and the detoured one
        // hopefully I can find a way to get and use the correct 'this' in the detoured calls
        
        if(func.toString().includes("this.")){ 
            return false;
        }

        let func_name = path + " [detoured]";
        let metadata = {
            location : path,
            old      : func,
            ctime    : 0,
        }
        metadata.detoured = {[func_name]: (function() {
            let finish, start = performance.now()
            result = func.apply(this,arguments);
            finish = performance.now();
            metadata.ctime = (finish-start)*1000;
            inspector.handleLogging(metadata,arguments,result);
            if( result != undefined ){
                return result; 
            }
        })}[func_name];
        

        inspector.detours.set(metadata.detoured,{ // make it easy to revert without adding any fields to the new function
            revert: (function(){obj[key] = func;}),
            get: (function(){return func;})
        }); 

        inspector.cloneProperties(func,metadata.detoured);

        obj[key] = metadata.detoured;
    }
    catch(e){
        console.log(e);
        return false;
    }
    return true;
};

inspector.recurse = function(obj, path, depth=0, relpath=path, refs=new WeakSet()) {    

    if( depth > inspector.MAX_SEARCH_DEPTH ){ return; }

    // Avoid infinite recursion
    if(refs.has(obj)){ return; }
    else if( obj!=null ){ refs.add(obj); }
    let group = (depth > 0) && inspector.LIST_DETOURED;
    let parent_type = typeof(obj);

    for (const key in obj) {
        try{
            let value = obj[key]; // if we hit a css sheet this will throw an exception
            if( value == window ){ continue; }
            let type = typeof(value);

            let newpath = inspector.getPath(path,key);

            let doDetour = false;

            switch(type){
                case 'function':
                    doDetour = true;
                    if( !inspector.DETOUR_METAMETHODS ){ break; }
                    if( inspector.getOld(value)!=value ){ continue; } // don't detour stuff multiple times!!
                    if( group ){ group = false; inspector.LIST_GROUPING_MODE(`%c${path} (${parent_type})`,inspector.COLORS[parent_type]); }
                case 'object':
                    if( inspector.isBanned(newpath) ){ continue; }
                    inspector.recurse(value, newpath, depth+1, key, refs);     
                break;
            }
            if(doDetour){
                let success = inspector.detour(obj,key,newpath); // this has to be here due to recursion order 
                inspector.logDetoured(newpath,success);
            }
        }
        catch(e){
            console.error(e);
        }
    }
    if( !group ){
        console.groupEnd();
    }

};
console.groupCollapsed("Detours");
inspector.recurse(window, "window");
console.groupEnd();