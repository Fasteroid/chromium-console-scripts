/**********************************
*  Fast's Soundcloud URL Scraper  *
**********************************/

/*  HOW TO USE:
    Navigate to anywhere on soundcloud with tracks visible.
    Scroll through the ones you want to capture then run this script.

    Note: This may capture a few non-track urls at the beginnings and ends of captures.
*/

let stuff = []
let n = 0
let playlist = document.getElementsByClassName("sc-link-primary");
for( child of playlist ){
    stuff[n] = child.href
    n++;
}
console.log('"'+stuff.join('", \n"')+'"')