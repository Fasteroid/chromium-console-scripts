/**********************************
*   Fast's DOM Destroyer Script   *
*     Chrome Console Edition      *
**********************************/

// This is basically chrome-corrupter but less dangerous
// You should be able to run this safely

let DESTROYER = { VALUES_CACHE: {}, COUNT: 0 };

DESTROYER.PROPERTIES_TO_CORRUPT = ["className","style","src","fontFamily","innerText","name","color","background","backgroundImage","backgroundColor"];
DESTROYER.CORRUPT_CHANCE        = 0.8

for( property of DESTROYER.PROPERTIES_TO_CORRUPT ){
    DESTROYER.VALUES_CACHE[property] = ['lol']; // prep tables
    console.log(property)
}

DESTROYER.VALUES_CACHE['color'] = ['#ff0000','#00ff00','#0000ff','#ff00ff','#00ffff','#ffff00','#000000','#ffffff']
DESTROYER.VALUES_CACHE['backgroundColor'] = ['#ff0000','#00ff00','#0000ff','#ff00ff','#00ffff','#ffff00','#000000','#ffffff']

DESTROYER.pickRandom = function(array = []) {
    return array[ Math.floor(Math.random()*array.length) ];
}

DESTROYER.readValues = function(node){
    for( property of DESTROYER.PROPERTIES_TO_CORRUPT ){
        if( node[property] == undefined ){ continue; }
        DESTROYER.VALUES_CACHE[property].push( node[property] )
    }
}

DESTROYER.writeValues = function(node){
    if( Math.random() > DESTROYER.CORRUPT_CHANCE ){ return; }
    for( property of DESTROYER.PROPERTIES_TO_CORRUPT ){
        try{
            node[property] = DESTROYER.pickRandom(DESTROYER.VALUES_CACHE[property])
            DESTROYER.COUNT++;
        }
        catch(e){}
    }
}

DESTROYER.explore = function(node, action){
    let shouldRun = true
    for( node of node.children ){
        shouldRun = false
        DESTROYER.explore(node,action)
    }
    if( shouldRun ){
        action(node);
    }
}

// now ruin everything lol
DESTROYER.explore(document, DESTROYER.readValues);
DESTROYER.explore(document, DESTROYER.writeValues);
(new Audio("https://cdn.discordapp.com/attachments/842273685422604328/860762192173072424/flashbang_lol.mp3")).play(); // lol
console.log("Corrupted " + DESTROYER.COUNT + " DOM properties.")