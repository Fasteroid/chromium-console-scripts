


const INSPECTOR3 = {

    ORIGINAL: Symbol('original'),

    BLACKLIST: [
        ...Object.values(console),
        Object, Reflect, Function, Symbol, // TODO: finer-grained control; some methods on these are probably okay to detour
    ],

    getOriginal(obj){
        return obj[INSPECTOR3.ORIGINAL] ?? obj;
    },
    getOriginalMethod(obj, prop){
        return INSPECTOR3.getOriginal(obj[prop]).bind(INSPECTOR3.getOriginal(obj));
    },

    proxyWrap(obj) {
        let wrappedProto = Object.getPrototypeOf(obj);
            wrappedProto = wrappedProto ? INSPECTOR3.proxyWrap( wrappedProto ) : wrappedProto;
    
        return new (INSPECTOR3.getOriginal(Proxy))(obj, {
            
            getPrototypeOf: function(target){
                return wrappedProto;
            },
    
            get(target, prop, receiver) {
                if (prop === INSPECTOR3.ORIGINAL){
                    return target;
                }
                    
                const value = INSPECTOR3.getOriginalMethod(Reflect,"get")(target, prop, receiver);
    
                if (typeof value === 'function') {
                    return function (...args) {
                        return value.apply(target, args);
                    };
                }
                return value;
            },
    
            apply: function(target, thisArg, argumentsList){
                let start  = INSPECTOR3.getOriginalMethod(performance,"now")();
                    let result = target.apply(thisArg, argumentsList);
                let end    = INSPECTOR3.getOriginalMethod(performance,"now")();
    
                console.log(target.name, end - start, result);
                
                return result;
            },

            construct: function(target, argumentsList, newTarget){
                let start  = INSPECTOR3.getOriginalMethod(performance,"now")();
                    let result = new target(...argumentsList);
                let end    = INSPECTOR3.getOriginalMethod(performance,"now")();
    
                console.log("construct " + target.name, end - start, result);
    
                return result;
            }
    
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

function recurTraverse(obj, path = "somewhere", everything = new Set([INSPECTOR3, ...INSPECTOR3.BLACKLIST]), prototypes = new Set() ){
    for( let key of [...Object.getOwnPropertySymbols(obj), ...Object.getOwnPropertyNames(obj)] ){

            try {
                obj[key];
            }
            catch(e){
                continue;
            }

            const victim = obj[key];
            if( INSPECTOR3.getOriginalMethod(everything, "has")(victim) ) continue;
            if( !(victim instanceof Object) ) continue;

            const nestedpath = INSPECTOR3.getPath(path, key)

            const prox = INSPECTOR3.proxyWrap(victim);
            INSPECTOR3.getOriginalMethod(everything,"add")(prox);
            INSPECTOR3.getOriginalMethod(everything,"add")(victim);

            obj[key] = prox;

            recurTraverse(victim, nestedpath, everything, prototypes);


    }

    return [prototypes, everything]
}

recurTraverse(window, "window")