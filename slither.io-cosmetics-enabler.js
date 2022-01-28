/**************************
*    Fast's Slither.io    *
*    Cosmetics Enabler    *
**************************/

/*  HOW TO USE:
    Go to http://slither.io and run this script.
    Now go to change your snake's skin
    Observe you now have a new button, "Select Cosmetic"
*/

document.getElementById("csk").addEventListener("click",function(){
    scos.style.display = "block";
    scosh.style.display = "block";
    for( i in actco ){
        actco[i] = 1;
    }
});
