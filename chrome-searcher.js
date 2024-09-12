/************************************
*     Fast's Global Object Search   *
*      Chrome Console Edition       *
************************************/

/*  HOW TO USE:
    Paste in chrome console and hit enter.  Take care if you set the max search depth really high.
*/

const SEARCHER = { 

    isCursedKey: (key) => key.match(/[^(a-z|$|_|A-Z)]/), 
    justify:     (string,value) => (string + "\t".repeat(Math.max(0,Math.ceil((value-string.length)/4)))),

    isBanned(key){ return key == "window.SEARCHER" || this.includesPartial(this.BANNED_KEYS, key) }, // pls don't remove hardcoded values from here

    COLORS: {  
        // inspired by Wiremod's Expression 2 Language in Garry's Mod
        string:    "color: #999999;",
        number:    "color: #ff6666;",
        bigint:    "color: #a45b5b;",
        boolean:   "color: #668cff;",
        symbol:    "color: #fbfb51;",
        object:    "color: #80ff80;",
        array:     "color: #80ff80;",
        undefined: "color: #ffb56b;",
        function:  "color: #fc83fc;",
    },

    BANNED_KEYS: ["outerHTML","innerHTML","parentNode","parentElement"], // traversal will stop at these keys; this is semi-hardcoded for your own good.

    MAX_STR_LOG_LENGTH: 255, // strings longer than this will be truncated

    /**
     * @param {String} path - current path
     * @param {String} key  - key to add 
     * @returns {String} new path
     */
    getPath(path, key){
        const str = String(key);
        return str.match(/[^(a-z|$|_|A-Z)]/) ? 
                `${path}[\`${key.toString()}\`]` // evil string key or some other bullshit
                : `${path}.${key}`;              // normal key
    },

    /**
     * @param {String} keywords - search keywords
     * @param {Object} string  - victim
     * @returns {boolean} did any keyword match?
     */
    includesPartial(keywords, string){
        try {
            const lowerKeywords = keywords.map( s => s.toLowerCase() );
            let lowerString = this.advToString(string)[1];
            lowerString = (lowerString+"").toLowerCase();
            for( let lowerKeyword of lowerKeywords ){
                if( lowerString.includes(lowerKeyword) ){ return true; }
            }
        }
        catch(e){
            debugger;
        }


        return false;
    },

    functionRegex: /function(\(.*\)\s*{.*})/gms,

    /**
     * better toString that actually tells you what it is specifically if it's not a string
     * @param {Object} thing
     * @returns {[String, String]} [type, value]
     */
    advToString(thing){
        let type = typeof(thing);
        let value = "failed...";
        try{
            switch(type){
                case 'symbol': value = `Symbol(${thing.description})`; break; // ugh
                case 'string': value = `"${thing}"`; break;
                case 'function': 
                    let temp = this.functionRegex.exec(thing + "");
                    if( temp ){ value = temp[1] }
                    else { value = thing + ""; }
                    break;
                case 'object':
                    if( thing instanceof Array ){
                        value = `[...]`;
                        type = "array";
                    }
                    else {
                        value = `[Object ${(thing.constructor?.name ?? "Object")}]`;
                    }
                break;
                default: value = thing + ""; break;
            }
        }
        catch(e){

        }
        return [type, value];
    },

    /**
     * prints a thing at a path to console
     * @param {Object} thing
     * @param {String} path
     */
    advLog(thing, path, stuff=[]){
        let id = stuff.push(thing) - 1;
        let [type, value] = this.advToString(thing);

        let args = [ undefined, "color: #ff944d;", this.COLORS[type] ];
        if( value.length > this.MAX_STR_LOG_LENGTH ){
            value = value.slice(0, this.MAX_STR_LOG_LENGTH) + "...";
            args.push("(long string truncated)");
        }
        args[0] = `(${id}) ${path} = %c${type} %c${value}`;

        console.log(...args);
    },

    search(obj, SEARCH_KEYS=[], MAX_SEARCH_DEPTH=10, MAX_SEARCH_WIDTH=100, path="", depth=0, refs=new WeakSet(), stuff=[]) {

        if( depth >= MAX_SEARCH_DEPTH ){ return; }

        if( depth === 0 ) console.log("Just a sec...");
    
        try {
            // Avoid infinite recursion
            if( refs.has(obj) ){ return; }
            else if( obj !== null ){ refs.add(obj); }

            let values = Object.entries(obj);
            values.forEach( (pair) => {
                pair[0] = this.getPath(path, pair[0]);
                pair[2] = pair[0];
            });

            if( obj instanceof Map ){ 
                const map_stuff = Array.from(obj.entries());
                for( let pair of map_stuff ){
                    const key = this.advToString(pair[0])[1]; // description of key as best we can
                    pair[0] = `${path}.get(${key})`; 
                    pair[2] = key;
                }
                values.push(...map_stuff);
            }
    
            bruh: for (const [newpath, value, key] of values) {

                if( value === null || value === undefined ){ continue; } // skip null
                // if( value && value.window == window ){ continue; } // no.
                let type = typeof(value);
                if( this.isBanned(newpath) ){ 
                    continue bruh; 
                }

                switch(type){
                    
                    case 'function':
                        this.search(value, SEARCH_KEYS, MAX_SEARCH_DEPTH, MAX_SEARCH_WIDTH, newpath, depth+1, refs, stuff);
                        let code = (value+"");
                        if( this.includesPartial(SEARCH_KEYS, code) ){
                            this.advLog(value, newpath, stuff);
                            continue bruh;
                        }
                    break;
                    case 'object':
                        this.search(value, SEARCH_KEYS, MAX_SEARCH_DEPTH, MAX_SEARCH_WIDTH, newpath, depth+1, refs, stuff);
                        if( this.includesPartial(SEARCH_KEYS, value.constructor?.name ?? "") ){
                            this.advLog(value, newpath, stuff);
                            continue bruh;
                        }
                    break;
                    case 'string':
                        if( this.includesPartial(SEARCH_KEYS, value) ){
                            this.advLog(value, newpath, stuff);
                            continue bruh;
                        }
                    break;
                    case 'symbol':
                        if( this.includesPartial(SEARCH_KEYS, value.description) ){
                            this.advLog(value, newpath, stuff);
                            continue bruh;
                        }
                    break;
                }

                if( this.includesPartial(SEARCH_KEYS, key) ){
                    this.advLog(value, newpath, stuff);
                }

            }
        }
        catch(e){
            console.error(e);
        }

        if( depth === 0 ) console.log(`Search done, found ${stuff.length} results.`);

        return stuff;
    
    }

};

let test = new Map();
test.set("hello", "world");
test.set("foo", "bar");
test.set("baz", "qux");
test.set("quux", "corge");

SEARCHER.search({a: test}, ["hello","world"], 10, Infinity); // search for "baz" in test object