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

    isBanned(key){ return key == "window.SEARCHER" || this.includesPartial(this.BANNED_KEYS,key) }, // pls don't remove hardcoded values from here

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

    BANNED_KEYS: ["document"], // traversal will stop at these keys; this is semi-hardcoded for your own good.

    /**
     * @param {String} path - current path
     * @param {String} key  - key to add 
     * @returns {String} new path
     */
    getPath(path, key){
        return (typeof key === 'symbol') ? 
            `${path}[${key.toString()}]`
            : key.toString().match(/[^(a-z|$|_|A-Z)]/) ? 
            `${path}[\`${key.toString()}\`]` // evil string key or some other bullshit
            : `${path}.${key}`;              // normal key
    },

    /**
     * better toString that actually tells you what it is specifically if it's not a string
     * @param {Object} thing
     * @returns {String}
     */
    advToString(thing){
        let type = typeof(thing);
        let value = "failed..."
        try{
            switch(type){
                case 'symbol': value = thing.description; break; // ugh
                case 'string': value = `"${thing}"`; break;
                case 'function': 
                    value = (thing + "").match(/(function\s*)([^\)]*\(.+)/); 
                    if(value){ value = value[2] }
                    break;
                case 'object':
                    value = thing + ""
                    if(!value.startsWith("[")){
                        value = `[...]`
                        type = "array";
                    }
                break;
                default: value = thing + "";
            }
        }
        finally{}
        return value;
    },

    /**
     * @param {String} keywords - search keywords
     * @param {Object} string  - victim
     * @returns {boolean} did any keyword match?
     */
    includesPartial(keywords, string){
        try {
            const lowerKeywords = keywords.map( s => s.toLowerCase() );
            let lowerString = this.advToString(string);
            lowerString = lowerString+"";
            for( let lowerKeyword of lowerKeywords ){
                if( lowerString.includes(lowerKeyword) ){ return true; }
            }
        }
        catch(e){
            debugger;
        }


        return false;
    },

    /**
     * prints a thing at a path to console
     * @param {Object} thing
     * @param {String} path
     */
    advLog(thing, path, stuff=[]){
        let id = stuff.push(thing);

        let type = typeof(thing);
        let value = "failed..."
        try{
            switch(type){
                case 'symbol': value = thing.valueOf(); break; // ugh
                case 'string': value = `"${thing}"`; break;
                case 'function': 
                    value = (thing + "").match(/(function\s*)([^\)]*\(.+)/); 
                    if(value){ value = value[2] }
                    break;
                case 'object':
                    value = thing + ""
                    if(!value.startsWith("[")){
                        value = `[...]`
                        type = "array";
                    }
                break;
                default: value = thing + "";
            }
        }
        finally{}
        if(path){
            console.log( `(${id}) ${path} = %c${type} %c${value}`, "color: #ff944d;", this.COLORS[type] )
        }
    },

    search(obj, SEARCH_KEYS=[], MAX_SEARCH_DEPTH=10, path="", depth=0, refs=new WeakSet(), stuff=[]) {

        if( depth > MAX_SEARCH_DEPTH ){ return; }
    
        // Avoid infinite recursion
        if(refs.has(obj)){ return; }
        else if( obj!=null ){ refs.add(obj); }
    
        bruh: for (const key in obj) {
            try{
    
                let value = obj[key]; // if we hit a css sheet this will throw an exception
                if( value === null || value === undefined ){ continue; } // skip null
                if( value && value.window == window ){ continue; } // no.
                let type = typeof(value);
                let newpath = this.getPath(path, key);
                if( this.isBanned(newpath) ){ 
                    continue bruh; 
                }
    
                switch(type){
                    case 'function':
                        let code = (value+"")
                        if( this.includesPartial(SEARCH_KEYS, code) ){
                            this.advLog(value, newpath, stuff)
                        }
                    case 'object':
                        if( this.includesPartial(SEARCH_KEYS, value.constructor.name) ){
                            this.advLog(value, newpath, stuff)
                        }
                        this.search(value, SEARCH_KEYS, MAX_SEARCH_DEPTH, newpath, depth+1, refs, stuff);          
                    break;
                }
    
                if( this.includesPartial(SEARCH_KEYS, key) ){
                    this.advLog(value, newpath, stuff)
                    continue bruh;
                }
                
                let text = this.advToString(value)
                if( this.includesPartial(SEARCH_KEYS, text) ){
                    this.advLog(value, newpath, stuff)
                    continue bruh;
                }
    
            }
            catch(e){
                console.error(e);
            }
        }

        return stuff;
    
    }

};

