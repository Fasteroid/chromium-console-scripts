/**************************************
*  Fast's JS Function Call Inspector: *
*       Chrome Console Edition        *
**************************************/


var inspector = (() => { 
    const oldSetTimeout = window.setTimeout; // save the original setTimeout so antispam calling it doesn't show up in logs
    return {
        detours: new WeakMap(), 
        detourcount: 0,
        spamcounter: 0, 
        isCursedKey: (key) => key.match(/[^(a-z|$|_|A-Z)]/), 
        isBanned: (key) => key == "window.inspector" || key=="window.performance" || inspector.BANNED_PATHS.includes(key) || inspector.includesPartial(inspector.BANNED_PATHS,key), // pls don't remove hardcoded values from here
        isNative: (func) => (func+"").endsWith("{ [native code] }"),
        antispam: () => { inspector.spamcounter = 0; oldSetTimeout(inspector.antispam,inspector.ANTISPAM_INTERVAL); },
        ttime: 0
    }
})();

/*  HOW TO USE:
    Paste in chrome console and hit enter.  Click on debug log events to expand them.  
    Call inspector.unhook() on a detoured function to unhook it from the detour system.
    Call inspector.getOld() on a detoured function to get the original function.
    Add any problematic functions or objects to BANNED_PATHS to ban traversing them.  
*/

inspector.MAX_SEARCH_DEPTH   = 15;            // Max recursive depth to search.
inspector.MAX_SEARCH_WIDTH   = 100;           // Any object besides window with more objects stored under it than this will be ignored.
inspector.ANTISPAM_INTERVAL  = 1000;          // in ms
inspector.ANTISPAM_QUOTA     = 64;            // max logs per interval
inspector.LIST_GROUPING_MODE = console.group; // or console.groupCollapsed
inspector.LIST_DETOURED      = true;          // list attempted detours
inspector.LIST_SUCCESS_ONLY  = true;          // only list successful detours
inspector.MIN_CPU_TO_LOG     = 5;             // don't log any calls that take less than this

inspector.DETOUR_NATIVE      = true;          // detours native functions like setTimeout

inspector.DETOUR_PROTOTYPES  = true;          // if true, recursively explore prototypes and detour everything applicable that's found!

inspector.DETOUR_ARGS        = false;          // function called with detourable arguments?  detour those too!
if( inspector.DETOUR_ARGS ){ console.warn("Function argument detouring enabled.  This will incur a severe performance hit."); }


// Something specific spamming console?  Completely breaking the website?  Add it here.  Supports both full paths and substrings of paths.
// Feel free to make a PR if you find something nasty I haven't added yet.
inspector.BANNED_PATHS = [
    "frameElement","webpackJsonp","cssRules",".apply","onTick","shouldRunAtMaxSpeed","React","timedOut"
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
    default:   "color: #dddddd;",

    function_ignored:  "color: #864086;",
    object_ignored:    "color: #407040;",
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
    inspector.logDetoured = function(path,success,obj){
        if( success === true ){
            console.log(`success: %c${path}`,inspector.COLORS["function"]);
        }
        else if( !inspector.LIST_SUCCESS_ONLY ){
            console.log(`%cignored: %c${path} %c(${success})`,"color: #666666;",inspector.COLORS[typeof(obj)+"_ignored"],"color: #666666;");
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
            return "uses 'this'";
        }
        if( !inspector.DETOUR_NATIVE && inspector.isNative(func) ){ return "native" }

        let func_name = path + " [detoured]";
        let metadata = {
            location : path,
            old      : func,
            ctime    : 0,
        }

        if( inspector.DETOUR_ARGS ){
            metadata.detoured = {[func_name]: (function() { /* DETOUR */
                try{ inspector.recurse(arguments, `${path}(...)`) }
                catch(e){}

                let finish, start = performance.now()
                result = func.apply(this,arguments);
                finish = performance.now();
                metadata.ctime = (finish-start)*1000;
                inspector.handleLogging(metadata,arguments,result);
                if( result != undefined ){
                    return result; 
                }
            })}[func_name];
        }
        else { // avoid the overhead of detouring args if we don't need them
            metadata.detoured = {[func_name]: (function() { /* DETOUR */
                let finish, start = performance.now()
                result = func.apply(this,arguments);
                finish = performance.now();
                metadata.ctime = (finish-start)*1000;
                inspector.handleLogging(metadata,arguments,result);
                if( result != undefined ){
                    return result; 
                }
            })}[func_name];
        }

        metadata.detoured.toString = function(){ // really epic toString override
            return func.toString();
        }

        inspector.detours.set(metadata.detoured,{ // make it easy to revert without adding any fields to the new function
            revert: (function(){obj[key] = func;}),
            get: (function(){return func;})
        }); 

        inspector.cloneProperties(func,metadata.detoured);

        obj[key] = metadata.detoured;
    }
    catch(e){
        console.log(e);
        return "script error";
    }
    return true;
};

inspector.recurse = function(obj, path, depth=0, refs=new WeakSet()) {    

    if( obj == null || obj == undefined ){ return; }
    if( depth > inspector.MAX_SEARCH_DEPTH ){ return; }

    // Avoid infinite recursion
    if( refs.has(obj) ) return;
    else                refs.add(obj);

    let group = (depth > 0) && inspector.LIST_DETOURED;
    let parent_type = typeof(obj);

    if( inspector.DETOUR_PROTOTYPES ){
        try {
            inspector.recurse(Object.getPrototypeOf(obj),`Object.getPrototypeOf(${path})`,depth+1, refs);
        }
        catch(e){}
    }

    for (const key in obj) {
        try{
            let value = obj[key]; // this may throw illegalinvocation
            if( value == window ){ continue; }

            // dodge javascript frameworks and libraries
            let count = 0;
            if( depth > 0 ){
                for (const _ in obj) {
                    count++;
                }
                if( count > inspector.MAX_SEARCH_WIDTH ){
                    inspector.logDetoured(path,`${count} children`,obj);
                    return;
                }
            }
            
            let type = typeof(value);

            let newpath = inspector.getPath(path,key);

            let doDetour = false;

            switch(type){
                case 'function':
                    doDetour = true;
                    if( inspector.getOld(value)!=value ){ continue; } // don't detour stuff multiple times!!
                    if( group ){ group = false; inspector.LIST_GROUPING_MODE(`%c${path} (${parent_type})`,inspector.COLORS[parent_type]); }
                case 'object':
                    if( inspector.isBanned(newpath) ){ continue; }
                    inspector.recurse(value, newpath, depth+1, refs);     
                break;
            }
            if(doDetour){
                let success = inspector.detour(obj,key,newpath); // this has to be here due to recursion order 
                inspector.logDetoured(newpath,success,obj);
                if( success === true ){ inspector.detourcount++; }
            }
        }
        catch(e){}
    }
    if( !group ){
        console.groupEnd();
    }

};
console.groupCollapsed("Detours...");
inspector.recurse(window, "window");
inspector.LIST_DETOURED = false;
console.groupEnd();
console.log(`${inspector.detourcount} total functions detoured.`);
