/************************************
*   Fast's JS Discord DMs Dumper    *
*     Chromium Console Edition      *
************************************/

// IMPORTANT: START AT THE TOP OF THE DMS!  If you start at the bottom and scroll up the messages WILL get logged in reverse.

/*  HOW TO USE:
    PREPARE: Scroll to the beginning of the DMs you want to capture.
    RUN:     Ctrl+Shift+I in discord, paste in console and smash enter as normal.
    USE:     Scroll down to capture more DMs.
    DONE:    call DiscordDumper.print() to get your messages!
*/

let DiscordDumper = {
    totalLogged: 0,
    scroller: $('[class^="scrollerInner"]'),
    text: "",
    msgLog: function(msg){
        if( msg.className.search("message") == 0 ){
            header = msg.querySelector("h2");
            if( header ){
                text = text + header.firstChild.firstChild.innerText + ": ";
            }
            text = text + msg.firstChild.lastChild.innerText + "\n";
        }
    },
    print: function(){ console.log(DiscordDumper.text) },
    observer: new MutationObserver(function(mutations) {
        let count = 0
        for( let change of mutations ){
          let msg = change.addedNodes[0]
          if( msg ){
            count++;
            DiscordDumper.msgLog(msg)
          }
        }
        console.log("Appended "+count+" messages");
    })
}

for( let msg of DiscordDumper.scroller.children ){ 
    DiscordDumper.msgLog(msg);
    DiscordDumper.totalLogged++;
}
console.log("Logged "+DiscordDumper.totalLogged+" messages initially...");
observer.observe(DiscordDumper.scroller, { attributes: true, childList: true, characterData: true });