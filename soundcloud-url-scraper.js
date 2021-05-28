let stuff = []
let n = 0
let playlist = document.getElementsByClassName("sc-link-primary");
for( child of playlist ){
    stuff[n] = child.href
    n++;
}
console.log('"'+stuff.join('", \n"')+'"')