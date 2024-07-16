


const INSPECTOR3 = {

    MIN_CPU_TO_LOG: 0.1,

    ORIGINAL: Symbol('original'),

    BLACKLIST: [
        ...Object.values(console), console,
        performance, Performance, 
        Proxy, Object, Reflect, Function, Symbol, // TODO: finer-grained control; some methods on these are probably okay to detour
        $, globalThis
    ],

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

    getOriginal(obj){
        return obj[INSPECTOR3.ORIGINAL] ?? obj;
    },
    getOriginalMethod(obj, prop){
        return INSPECTOR3.getOriginal(obj[prop]).bind(INSPECTOR3.getOriginal(obj));
    },

    trace: function(){ 
        let stack = (new Error().stack).replaceAll("    ","").split("at ")
        var output = []; 
        for (let index = 3; index < stack.length; index+=2) { 
            output[index] = " ".repeat(index+1) + stack[index]; 
        } 
        return INSPECTOR3.getOriginalMethod(output,"join")("");
    },

    argobj: function Arguments( args ) { for (let index = 0; index < args.length; index++) { this[index] = args[index]; } },
    returnobj: function Returned( obj ) { this.result = obj; },

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
                    case 'object': output[index] = `[Object ${(array[index].constructor.name)}]`; break;
                    case 'undefined': output[index] = 'undefined'; break;
                    default: output[index] = array[index]; break;
                }
            } 
        } 
        return INSPECTOR3.getOriginalMethod(output,"join")("%c, %c"); 
    },

    // console.groupCollapsed.apply(this,INSPECTOR3.getPrettyCall(data,args));
    // if(args.length > 0){ console.log(new INSPECTOR3.argobj(args)); }
    // if( typeof result !== 'undefined' ){ console.log(new INSPECTOR3.returnobj(result)); }
    // console.log(data.old);
    // console.log("Stack Trace:\n" + INSPECTOR3.trace());

    getPrettyCall: function(path, args, time){
        let tags = [`%c ${(time).toFixed(0)}us %c| `,INSPECTOR3.COLORS.string, INSPECTOR3.COLORS.default];
        if(args.length === 0){
            tags[0] += `${path}();`
            return tags;
        }
        const colors = INSPECTOR3.COLORS; // tiny perf save
        for (let i = 0; i < args.length; i++) {
            const type = args[i] === null ? 'null' : typeof(args[i]);
            tags[tags.length] = colors[type]
            tags[tags.length] = colors.default; // argument separators
        }
        tags[0] += `${path}(%c${INSPECTOR3.join(args)}%c);`;

        return tags;
    },

    logFunctionCall: function(path, args, time, result){
        if(time < INSPECTOR3.MIN_CPU_TO_LOG) return;
        console.groupCollapsed( ...INSPECTOR3.getPrettyCall(path, args, time) );
            if(args.length > 0){ console.log(new INSPECTOR3.argobj(args)); }
            if( typeof result !== 'undefined' ){ console.log(new INSPECTOR3.returnobj(result)); }
            console.log("Stack Trace:\n" + INSPECTOR3.trace());
        console.groupEnd();
    },

    proxyWrap(obj, path) {
        let wrappedProto = Object.getPrototypeOf(obj);
            wrappedProto = wrappedProto ? INSPECTOR3.proxyWrap( wrappedProto, obj.constructor.name ) : wrappedProto;
    
        return new (INSPECTOR3.getOriginal(Proxy))(obj, {
            
            getPrototypeOf: function(target){
                return wrappedProto;
            },

            setPrototypeOf: function(target, prototype){
                console.log(target, prototype)
                wrappedProto = prototype ? INSPECTOR3.proxyWrap( prototype, "<custom prototype>" ) : prototype;
                return true;
            },
    
            get(target, prop, receiver) {
                if (prop === INSPECTOR3.ORIGINAL){
                    return target;
                }
                    
                let value;
                try {
                    value = Reflect.get(target, prop, receiver);
                }
                catch(e){
                    value = target[prop];
                }
    
                if (typeof value === 'function') {
                    return function (...args) {
                        return value.apply(target, args);
                    };
                }
                return value;
            },
    
            apply: function(target, thisArg, argumentsList){
                let start  = performance.now();
                    let result = target.apply(thisArg, argumentsList);
                let end    = performance.now();
    
                INSPECTOR3.logFunctionCall(path, argumentsList, end - start, result);
                
                return result;
            },

            // construct: function(target, argumentsList, newTarget){
            //     let start  = performance.now();
            //         let result = new target(...argumentsList);
            //     let end    = performance.now();
    
            //     console.log("construct " + target.name, end - start, result);
    
            //     return result;
            // }
    
        });
    },

    getPath(path, key){
        return (typeof key === 'symbol') ? 
            `${path}[${key.toString()}]`
            : key.toString().match(/[^(a-z|$|_|A-Z)]/) ? 
            `${path}[\`${key.toString()}\`]` // evil string key or some other bullshit
            : `${path}.${key}`;              // normal key
    }
    
}

function recurTraverse(obj, path = "somewhere", everything = new Set([INSPECTOR3, ...INSPECTOR3.BLACKLIST]), top = true ){

    let keys = [...Object.getOwnPropertySymbols(obj), ...Object.getOwnPropertyNames(obj)];
    if( top ){
        keys = [...keys, ...Object.keys(obj)];
        console.log(keys)
        console.log(keys.includes("setTimeout"))
    }

    for( let key of Object.values(keys) ){
        try {
            try {
                let _ = obj[key];
            }
            catch(e){
                continue;
            }

            const victim = obj[key];
            const nestedpath = INSPECTOR3.getPath(path, key)

            if( INSPECTOR3.getOriginalMethod(everything, "has")(victim) ) continue;
            if( !(victim instanceof Object) ) continue;

            const prox = INSPECTOR3.proxyWrap(victim, nestedpath);
            obj[key] = prox;
        
            INSPECTOR3.getOriginalMethod(everything,"add")(prox);
            INSPECTOR3.getOriginalMethod(everything,"add")(victim);

            recurTraverse(victim, nestedpath, everything, false);
        }
        catch(e){
            console.warn(e);
        }
    }

    return everything
}

recurTraverse(window, "window")