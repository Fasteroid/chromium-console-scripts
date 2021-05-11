let CSS = document.createElement('style');
document.head.appendChild(CSS);
let sheet = CSS.sheet;
let style = `* { color: #000000; }`
sheet.insertRule(style)

let gamer = setInterval(function(){
    let style = `* { color: hsl(${Math.round(Date.now()*90/1000)%360},100%,50%) !important; }`
    sheet.removeRule(0)
    sheet.insertRule(style)
},10)
