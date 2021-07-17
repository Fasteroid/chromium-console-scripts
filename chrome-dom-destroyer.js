/**********************************
*   Fast's DOM Destroyer Script   *
*     Chrome Console Edition      *
**********************************/

// This is basically chrome-corrupter but less dangerous
// You SHOULD be able to run this safely

let DESTROYER = { PROPERTIES_CACHE: {}, STYLES_CACHE: {}, COUNT: 0, STYLECOUNT: 0 };

DESTROYER.PROPERTIES_TO_CORRUPT   = ["className","style","src","href","text","innerText"] //,"fontFamily","innerText","name","color","background","backgroundImage","backgroundColor"];
DESTROYER.PROPERTY_CORRUPT_CHANCE = 0.8
DESTROYER.STYLES_TO_CORRUPT       = ["fontFamily","color","background","backgroundImage","backgroundColor","width","height","textTransform"]
DESTROYER.STYLE_CORRUPT_CHANCE    = 0.9

// prep cache tables
for( property of DESTROYER.PROPERTIES_TO_CORRUPT ){
    DESTROYER.PROPERTIES_CACHE[property] = [];
}
for( property of DESTROYER.STYLES_TO_CORRUPT ){
    DESTROYER.STYLES_CACHE[property] = [];
}

DESTROYER.removeInactive = function(list,cache){
    for (let i = list.length-1; i >= 0; i--) {
        let property = list[i]
        if( cache[property].length == 0 ){
            list.splice(i, 1)
        }
    }
}

DESTROYER.pickRandom = function(array = []) {
    return array[ Math.floor(Math.random()*array.length) ];
};

DESTROYER.readValues = function(node){
    for( property of DESTROYER.PROPERTIES_TO_CORRUPT ){
        let value = node[property]
        DESTROYER.PROPERTIES_CACHE[property].push( value )
    }
};

DESTROYER.writeValues = function(node){
    if( Math.random() > DESTROYER.PROPERTY_CORRUPT_CHANCE ){ return; }
    for( property of DESTROYER.PROPERTIES_TO_CORRUPT ){
        try{
            let value = DESTROYER.pickRandom(DESTROYER.PROPERTIES_CACHE[property])
            if( value == undefined || value == "" ){ continue; }
            node[property] = value;
            DESTROYER.COUNT++;
        }
        catch(e){}
    }
};

DESTROYER.writeStyles = function(node){
    let style = node.style
    if( style == undefined ){
        node.style = new CSSStyleDeclaration()
        style = node.style
    }
    for( property of DESTROYER.STYLES_TO_CORRUPT ){
        if( Math.random() > DESTROYER.STYLE_CORRUPT_CHANCE ){ continue; }
        try{
            let value = DESTROYER.pickRandom(DESTROYER.STYLES_CACHE[property])
            if( value == undefined || value == "" ){ continue; }
            style[property] = value
            DESTROYER.STYLECOUNT++;
        }
        catch(e){}
    }
};

DESTROYER.readStyles = function(node){
    let style = node.style
    if( style ){
        for( property of DESTROYER.STYLES_TO_CORRUPT ){
            let value = style[property]
            if( value == undefined || value == "" ){ continue; }
            DESTROYER.STYLES_CACHE[property].push( value )
        }
    }
};

DESTROYER.explore = function(node, action){
    let shouldRun = true
    for( node of node.children ){
        shouldRun = false
        DESTROYER.explore(node,action)
    }
    if( shouldRun ){
        action(node);
    }
};

// now ruin everything
(new Audio("https://cdn.discordapp.com/attachments/842273685422604328/860762192173072424/flashbang_lol.mp3")).play(); // lol

if( DESTROYER.PROPERTY_CORRUPT_CHANCE > 0 ){
    DESTROYER.explore(document, DESTROYER.readValues);
    DESTROYER.removeInactive( DESTROYER.PROPERTIES_TO_CORRUPT, DESTROYER.PROPERTIES_CACHE )
    DESTROYER.explore(document, DESTROYER.writeValues);
    console.log("Corrupted " + DESTROYER.COUNT + " DOM properties...");
}

if( DESTROYER.STYLE_CORRUPT_CHANCE > 0 ){
    DESTROYER.explore(document, DESTROYER.readStyles);
    DESTROYER.removeInactive( DESTROYER.STYLES_TO_CORRUPT, DESTROYER.STYLES_CACHE )
    DESTROYER.explore(document, DESTROYER.writeStyles);
    console.log("Corrupted " + DESTROYER.STYLECOUNT + " style attributes...");
}