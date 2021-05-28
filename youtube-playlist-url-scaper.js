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
console.log('"'+stuff.join('", \n"')+'"')