let stuff = [];
let n = 0;
for( child of temp1.children ){
    let url = child.querySelector('[id^="video-title"]');
    if(url){
        stuff[n] = url.href.match(/^(.*?)\&list/)[1];
        n++;
    }
}
console.log('"'+stuff.join('", \n"')+'"');