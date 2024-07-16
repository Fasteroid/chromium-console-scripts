function getpath(path, key){
    return key.match(/[^(a-z|$|_|A-Z)]/) ? 
        `${path}[\`${key}\`]` // evil string key 
        : `${path}.${key}`;       // normal key
}

function recurTraverse(obj, path = "somewhere", everything = new Set(), prototypes = new Set() ){
    for( let key of [...Object.getOwnPropertySymbols(obj), ...Object.getOwnPropertyNames(obj)] ){
        try {
            const victim = obj[key];
            if( everything.has(victim) ) continue;
            if( !(victim instanceof Object) ) continue;

            const nestedpath = getpath(path, key)
            console.log(nestedpath)

            everything.add(victim);
            recurTraverse(victim, nestedpath, everything, prototypes);

            const proto = Object.getPrototypeOf(victim);
            if( proto instanceof Object && !everything.has(proto) ){
                everything.add(proto);
                prototypes.add(proto);
                const nestedprotopath = proto.constructor.name ?? "Something";
                console.log(nestedprotopath)
                recurTraverse(proto, nestedprotopath, everything, prototypes);
            }
        }
        catch(e){
            
        }
    }

    return [prototypes, everything]
}

recurTraverse(window, "window")