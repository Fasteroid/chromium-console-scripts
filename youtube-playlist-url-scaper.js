/****************************
*  Fast's YouTube Playlist  *
*     Video URL Scraper     *
****************************/

/*  HOW TO USE:
    Navigate to any playlist and play the first video, then scroll down the playlist.  
    Once you're done scrolling, run this script to capture the URLs.
*/

let stuff = []
let n = 0
let playlist = document.getElementsByClassName("style-scope ytd-playlist-video-list-renderer");
for( child of playlist ){
    let url = child.querySelector('[id^="video-title"]')
    if(url){
        stuff[n] = url.href.match(/^(.*?)\&list/)[1]
        n++
    }
}
if(stuff.length == 0){
    n = 0
    let playlist = document.querySelectorAll(".ytd-playlist-panel-video-renderer");
    for( child of playlist ){
        let url = child.href
        if(url){
            stuff[n] = url.match(/^(.*?)\&list/)[1]
            n++
        }
    }
}
console.log('"'+stuff.join('", \n"')+'"')