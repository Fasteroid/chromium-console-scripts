/**********************************
*   Fast's DOM Destroyer Script   *
*     Chrome Console Edition      *
**********************************/

// This is basically chrome-corrupter but less dangerous
// You should be able to run this safely

let DESTROYER = { VALUES_CACHE: {} };

DESTROYER.PROPERTIES_TO_CORRUPT = ["innerText","class","style"];

for( property of DESTROYER.PROPERTIES_TO_CORRUPT ){
    DESTROYER.VALUES_CACHE[property] = ["lol"]; // prep tables
    console.log(property)
}

DESTROYER.pickRandom = function(array = []) {
    return array[ Math.floor(Math.random()*array.length) ];
}

DESTROYER.readValues = function(node){
    for( property of DESTROYER.PROPERTIES_TO_CORRUPT ){
        DESTROYER.VALUES_CACHE[property].push( node[property] )
    }
}

DESTROYER.writeValues = function(node){
    for( property of DESTROYER.PROPERTIES_TO_CORRUPT ){
        node[property] = DESTROYER.pickRandom(DESTROYER.VALUES_CACHE[property])
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