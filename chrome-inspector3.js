


const SAFESPACE = {
    ORIGINAL: Symbol('original'),
    getOriginal(obj){
        return obj[SAFESPACE.ORIGINAL] ?? obj;
    },
    getOriginalMethod(obj, prop){
        return SAFESPACE.getOriginal(obj[prop]).bind(SAFESPACE.getOriginal(obj));
    },
    proxyWrap(obj) {
        let wrappedProto = Object.getPrototypeOf(obj);
            wrappedProto = wrappedProto ? SAFESPACE.proxyWrap( wrappedProto ) : wrappedProto;
    
        return new Proxy(obj, {
            
            getPrototypeOf: function(target){
                return wrappedProto;
            },
    
            get(target, prop, receiver) {
                if (prop === SAFESPACE.ORIGINAL){
                    return target;
                }
                    
                const value = SAFESPACE.getOriginalMethod(Reflect,"get")(target, prop, receiver);
    
                if (typeof value === 'function') {
                    // SAFESPACE.getOriginalMethod(console,"log")("value.apply:", value.apply)
                    return function (...args) {
                        return value.apply(target, args);
                    };
                }
                return value;
            },
    
            apply: function(target, thisArg, argumentsList){
                let start  = SAFESPACE.getOriginalMethod(performance,"now")();
                    SAFESPACE.getOriginalMethod(console,"log")("target.apply:", target.apply)
                    let result = target.apply(thisArg, argumentsList);
                let end    = SAFESPACE.getOriginalMethod(performance,"now")();
    
                SAFESPACE.getOriginalMethod(console,"log")(target.name, end - start, result);
                
                return result;
            },
    
        });
    },
    getPath(path, key){
        return (typeof key === 'symbol') ? 
            `${path}[${key.toString()}]`
            : key.toString().match(/[^(a-z|$|_|A-Z)]/) ? 
            `${path}[\`${key.toString()}\`]` // evil string key or some other bullshit
            : `${path}.${key}`;   // normal key
    }
}

function recurTraverse(obj, path = "somewhere", everything = new Set([Proxy, Object, Reflect, Function, Symbol, SAFESPACE, console]), prototypes = new Set() ){
    for( let key of [...Object.getOwnPropertySymbols(obj), ...Object.getOwnPropertyNames(obj)] ){

            try {
                obj[key];
            }
            catch(e){
                continue;
            }

            const victim = obj[key];
            if( SAFESPACE.getOriginalMethod(everything, "has")(victim) ) continue;
            if( !(victim instanceof Object) ) continue;

            const nestedpath = SAFESPACE.getPath(path, key)
            SAFESPACE.getOriginalMethod(console, "log")(nestedpath)

            const prox = SAFESPACE.proxyWrap(victim);
            SAFESPACE.getOriginalMethod(everything,"add")(prox);
            SAFESPACE.getOriginalMethod(everything,"add")(victim);

            obj[key] = prox;

            recurTraverse(victim, nestedpath, everything, prototypes);


    }

    return [prototypes, everything]
}

recurTraverse(window, "window")