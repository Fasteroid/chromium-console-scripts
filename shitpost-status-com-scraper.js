/***************************
*  Fast's Shitpost Status  *
*      Video Scraper       *
***************************/

/*  HOW TO USE:
    Go to https://shitpoststatus.com/ and run this script.
    I offer zero guarantees that all output URLs link to existing/available videos.
*/

let xml = new XMLHttpRequest();
xml.onload = function() {
    const playlist = JSON.parse(this.responseText);
    const stuff = [];
    let n = 0;
    for( child of playlist ){
        if(child.id){
            stuff[n] = "https://www.youtube.com/watch?v=" + child.id;
            n++;
        }
    }
    console.log('"'+stuff.join('", \n"')+'"')
}
xml.open("GET", "getvideos.php");
xml.send();