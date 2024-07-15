let inspector = {

    BANNED_PATHS:    ["constructor","RegExp"],
    PROXIED_OBJECTS: new WeakMap(),
    MAX_DEPTH:       10,
    MIN_CPU_TO_LOG:  5,             // don't log any calls that take less than this

    BANNED_OBJECTS:  new WeakSet([
        Object, Proxy, Array, Reflect, String, WeakSet, WeakMap, Date, Error, Function, Number, Boolean, RegExp,
        Document, Location, Window, 
        window.performance, window.document, window.location, window.console, window.navigator, window.performance.now, RegExp.prototype.exec
    ]),

    COLORS: {  // inspired by Wiremod's Expression 2 Language in Garry's Mod
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
    },

    isBanned: (key) => key === "window.inspector" || inspector.BANNED_PATHS.includes(key) || inspector.includesPartial(inspector.BANNED_PATHS,key),
    includesPartial: (parts, string) => parts.some(part => string.includes(part)),
    isCursedKey: (key) => key.match(/[^(a-z|$|_|A-Z)]/),

    trace: function(){ let trace = (new Error().stack).replaceAll("    ","").split("at ").splice(3); var output = []; for (let index = 0; index < trace.length; index++) { output[index] = " ".repeat(index+1) + trace[index]; } return output.join(""); }, // get fancy stack trace
    argobj: function Arguments( args ) { for (let index = 0; index < args.length; index++) { this[index] = args[index]; } },
    returnobj: function Returned( obj ) { this.result = obj; },

    getPropertyNames: Object.getOwnPropertyNames,


    block_: true,

    getPath: (path, key) => {
        return inspector.isCursedKey(key) ? 
            `${path}[\`${key}\`]` // evil string key 
            : `${path}.${key}`;       // normal key
    },

    getOld: function(obj){
        return inspector.PROXIED_OBJECTS.get(obj) || obj;
    },

    join: function(array){ 
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
    },

    // console.groupCollapsed.apply(this,inspector.getPrettyCall(data,args));
    // if(args.length > 0){ console.log(new inspector.argobj(args)); }
    // if( typeof result !== 'undefined' ){ console.log(new inspector.returnobj(result)); }
    // console.log(data.old);
    // console.log("Stack Trace:\n" + inspector.trace());

    getPrettyCall: function(path, args, time){
        let tags = [`%c ${(time).toFixed(0)}us %c| `,inspector.COLORS.string, inspector.COLORS.default];
        if(args.length === 0){
            tags[0] += `${path}();`
            return tags;
        }
        const colors = inspector.COLORS; // tiny perf save
        for (let i = 0; i < args.length; i++) {
            const type = args[i] === null ? 'null' : typeof(args[i]);
            tags[tags.length] = colors[type]
            tags[tags.length] = colors.default; // argument separators
        }
        tags[0] += `${path}(%c${inspector.join(args)}%c);`;

        return tags;
    },

    logFunctionCall: function(path, args, time, result){
        if(time < inspector.MIN_CPU_TO_LOG) return;
        console.groupCollapsed( ...inspector.getPrettyCall(path, args, time) );
            if(args.length > 0){ console.log(new inspector.argobj(args)); }
            if( typeof result !== 'undefined' ){ console.log(new inspector.returnobj(result)); }
            console.log("Stack Trace:\n" + inspector.trace());
        console.groupEnd();
    },

    logDetoured: function(path, success, obj){
        if( success === true ){
            console.log(`success: %c${path}`,inspector.COLORS["function"]);
        }
        else if( !inspector.LIST_SUCCESS_ONLY ){
            console.log(`%cignored: %c${path} %c(${success})`,"color: #666666;",inspector.COLORS[typeof(obj)+"_ignored"],"color: #666666;");
        }
    },

    primitiveMap: {
        string:    String,
        number:    Number,
        boolean:   Boolean,
    },

    wrapPrimitive: function(obj){
        const ctor = inspector.primitiveMap[typeof obj];
        if( ctor ){
            return new ctor(obj);
        }
    },


    getDeepProxy(obj, path){
        if( inspector.PROXIED_OBJECTS.has(obj) ) return obj;
        
        let proto = Object.getPrototypeOf(obj);
            proto = proto ? inspector.getDeepProxy( Object.getPrototypeOf(obj), proto+"" ) : proto;
    
        let handlers = {

            setPrototypeOf: function(target, prototype){
                console.log("setPrototypeOf", target, prototype);
                return Object.setPrototypeOf(target, inspector.getDeepProxy(prototype));
            },

            getPrototypeOf: function(target){
                return proto;
            },

            apply: function(target, thisArg, argumentsList){
                target = inspector.getOld(target);

                let start  = performance.now();
                    let result = target.apply(thisArg, argumentsList);
                let end    = performance.now();

                inspector.logFunctionCall(path, argumentsList, end - start, result);
                
                return result;
            },
    
            construct: function(target, argumentsList, newTarget){
                target = inspector.getOld(target);

                let start  = performance.now();
                    let result = new target(...argumentsList);
                let end    = performance.now();

                inspector.logFunctionCall(path, argumentsList, end - start, result);

                return result;
            }
        };
        
        return new Proxy(obj, handlers);
    },

    applyProxy(obj, key, path){
        try {
            const victim = obj[key];
            if( inspector.PROXIED_OBJECTS.has(victim) ) return false;
            if( inspector.BANNED_OBJECTS.has(victim) ) return false;
            if( !(victim instanceof Object) ) return false;
            
            const deepProxy = inspector.getDeepProxy(victim, path);
            inspector.PROXIED_OBJECTS.set(deepProxy, victim);
            obj[key] = deepProxy;
        }
        catch(e){
            return false;
        }
        return true;
    },

    applyProxyRecursively(obj, path, depth = 0, explored = new WeakSet()){
        if( !(obj instanceof Object) ) return;
        if( depth > inspector.MAX_DEPTH ) return;

        explored.add(obj);

        for( let key of Object.getOwnPropertyNames(obj) ){
            try {
                if( inspector.isBanned(path) ) continue;

                const victim = obj[key];

                if( explored.has(victim) ) continue;
                explored.add(victim);
                
                if( inspector.BANNED_OBJECTS.has(victim) ) continue;
                let nestedPath = inspector.getPath(path, key)

                if( inspector.applyProxy(obj, key, nestedPath) ){
                    inspector.logDetoured(nestedPath, true, victim);
                    inspector.applyProxyRecursively(victim, nestedPath, depth+1, explored);
                }
            }
            catch(e){ }
        }

    }
}
inspector.BANNED_OBJECTS.add(inspector);

inspector.applyProxyRecursively(window, "window")
