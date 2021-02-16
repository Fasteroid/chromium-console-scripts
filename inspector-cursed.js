/**************************************
*  Fast's JS Function Call Inspector: *
*       Cursed          Edition       *
**************************************/

var inspector = { // don't touch anything in here
    detours: new WeakMap(), 
    byPaths: [],
    spamcounter: 0, 
    isCursedKey: (key) => key.match(/[^(a-z|$|A-Z)]/),
    isBanned: (key) => key == "window.inspector" || key=="window.performance" || inspector.BANNED_PATHS.includes(key) || inspector.includesPartial(inspector.BANNED_PATHS,key), // pls don't remove hardcoded values from here
    antispam: () => { inspector.spamcounter = 0; setTimeout(inspector.antispam,inspector.ANTISPAM_INTERVAL); },
    ttime: 0,
    anonsDetoured: 0,
};

/*  HOW TO USE:
    Paste in chrome console and hit entEr.  Cr   A s  h.
    t   h E    J aV as C rIp t  wI LL   cO n  sUm e     y OU~~~

*/

inspector.MAX_SEARCH_DEPTH   = 5;             // Max recursive depth to search.
inspector.DETOUR_METAMETHODS = true;          // Look for functions stored under functions and detour those too!
inspector.ANTISPAM_INTERVAL  = 1000;          // in ms
inspector.ANTISPAM_QUOTA     = 64;            // max logs per interval
inspector.LIST_DETOURED      = false;          // print whenever something gets detoured
inspector.LIST_GROUPING_MODE = console.group; // or console.groupCollapsed

inspector.DETOUR_RETURNED    = true;          // attempt to detour returned functions - kinda bad idea
inspector.DETOUR_PASSED      = true;          // attempt to detour passed functions - very bad idea

// Something specific spamming console?  Completely breaking the website?  Add it here.  Supports both full paths and substrings of paths.
// Feel free to make a PR if you find something nasty I haven't added yet.
inspector.BANNED_PATHS = [
    "window.document","frameElement","webpackJsonp","cssRules","document","$"
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
            console.log(`detoured: ${path}`);
        }
        else{
            console.log(`ignored:  %c${path}`,"color: #666666;");
        }
    };
}
else{
    inspector.logDetoured = () => {};
}

inspector.getPrettyCall = function(data,args){
    // console.log(args)

    let tags = [`%c ${(data.ctime*1000).toFixed(1)}us %c| `,inspector.COLORS.string,inspector.COLORS.default];
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
{ 
    // TODO: rework these functions so that they're pretty to look at in console
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
                    case 'function': output[index] = inspector.getOld(output[index]); break;
                    case 'undefined': output[index] = 'undefined'; break;
                    default: output[index] = array[index]; break;
                }
            } 
        } 
        return output.join("%c, %c"); 
    }; // display null properly

    
    inspector.trace = function(){ let trace = (new Error().stack).replaceAll("    ","").split("at ").splice(3); var output = []; for (let index = 0; index < trace.length; index++) { output[index] = " ".repeat(index+1) + trace[index]; } return output.join(""); }; // get fancy stack trace
    inspector.argobj = function Arguments( args ) { for (let index = 0; index < args.length; index++) { this[index] = args[index]; } }; // names the object "Arguments" in console
    inspector.returnobj = function Returned( obj ) { this.result = obj; }; // names the object "Arguments" in console
    inspector.originobj = function Origins( obj ) { this.function = obj; };

    inspector.handleLogging = function(data, args, result){

        if(args[0] == inspector.antispam){ return; } // setTimeout() hack
        if(inspector.spamcounter == inspector.ANTISPAM_QUOTA){ console.warn(`ANTISPAM: Suppressing further logs for the next ${inspector.ANTISPAM_INTERVAL} ms`); }
        if(inspector.spamcounter > inspector.ANTISPAM_QUOTA){ return; }
        inspector.spamcounter++;

        try{
            const colors = inspector.COLORS;
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
}

inspector.includesPartial = function(strings,string){
    for (const key in strings) {
        if(string.includes(strings[key])){ return true; }
    }
    return false;
};

inspector.unhook = function(detoured_function){
    if( typeof(detoured_function) === 'string' ){ 
        inspector.anons[detoured_function].revert()
        console.log("Function unhooked.");
        inspector.anons[detoured_function] = null; // xd
        return true;
    }
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
    let old;
    if( typeof(detoured_function) === 'string' ){ old = inspector.anons[detoured_function]; }
    else{ old = inspector.detours.get(detoured_function); }
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

inspector.addDetourChunk = function(metadata){
    let func = metadata.old;
    if(func==inspector.antispam){ throw "oh no"; }
    let path = metadata.location;
    let func_name = path + " [detoured]";
    metadata.detoured = {[func_name]: (function() {
        let finish, start = performance.now()
        if( inspector.DETOUR_PASSED ){ inspector.recurse(arguments," => "+path,inspector.MAX_SEARCH_DEPTH) } // allowing recursion here causes instant death
        result = func.apply(this,arguments);
        finish = performance.now();
        metadata.ctime = (finish-start);
        inspector.handleLogging(metadata,arguments,result);
        if( inspector.DETOUR_RETURNED ){
            let type = typeof(returned);
            let doDetour = false;
            switch(type){
                case 'function':
                    doDetour = true;
                    if( !inspector.DETOUR_METAMETHODS ){ break; }
                    if( inspector.getOld(returned)!=returned ){ break; } // don't detour stuff multiple times!!
                case 'object':
                    inspector.recurse(returned, path + "(); => ",inspector.MAX_SEARCH_DEPTH);     
                break;
            }
            if(doDetour){
                return inspector.getDetoured(); // this has to be here due to recursion order 
            }
        }
        if( result !== undefined ){
            return result; 
        }
    })}[func_name];
}

inspector.detour = function(obj,key,path) {
    if(!path){
        inspector.anonsDetoured++;
        path = `<anon${inspector.anonsDetoured}>`;
    }
    try{
        let func = obj[key];
        // I had a 1-on-1 talk with $.fn.init and found out the value of 'this' was different between the original func and the detoured one
        // hopefully I can find a way to get and use the correct 'this' in the detoured calls
        
        if(func.toString().includes("this.")){ 
            return false;
        }

        let metadata = {
            location : path,
            old      : func,
            ctime    : 0,
        }
        inspector.addDetourChunk(metadata)
        
        inspector.byPaths[path] = { // lol this was the only way I could think of
            revert: (function(){metadata.detoured = func;}), // this is so hacky but it works
            get: (function(){return func;})
        }; 
        inspector.detours.set(metadata.detoured,inspector.byPaths[path]); 

        inspector.cloneProperties(func,metadata.detoured);

        obj[key] = metadata.detoured;
    }
    catch(e){
        return false;
    }
    return true;
};

inspector.getDetoured = function(func){
    inspector.anonsDetoured++;
    let path = `<anon${inspector.anonsDetoured}>`;
    let outfunc;
    inspector.recurse(func,path); // just in case
    try{
        if(func.toString().includes("this.")){ 
            throw "no"; // lol
        }
        if(inspector.detours.get(func)){
            throw "no"; // xd
        }
        let metadata = {
            location : path,
            old      : func,
            ctime    : 0,
        }
        inspector.addDetourChunk(metadata);

        inspector.cloneProperties(func,metadata.detoured);

        inspector.byPaths[path] = { // lol this was the only way I could think of
            revert: (function(){metadata.detoured = func;}), // this is so hacky but it works
            get: (function(){return func;})
        }; 
        inspector.detours.set(metadata.detoured,inspector.byPaths[path]); 

        outfunc = metadata.detoured
        inspector.logDetoured(path,true);
    }
    catch(e){
        inspector.logDetoured(path,false);
        outfunc = func;
    }
    finally{
        return outfunc;
    }
}

inspector.recurse = function(obj, path, depth=0, relpath=path, refs=new WeakSet(), uidsenabled) {    

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
        catch(e){ }
    }
    if( !group ){
        console.groupEnd();
    }

};
console.groupCollapsed("Detours");
inspector.recurse(window, "window");
console.groupEnd();