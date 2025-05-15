/************************************
*   Fast's JS Discord DMs Dumper    *
*     Chromium Console Edition      *
************************************/

// IMPORTANT: START AT THE TOP OF THE DMS!  If you start at the bottom and scroll up the messages WILL get logged in reverse.

/*  HOW TO USE:
    PREPARE: Scroll to the beginning of the DMs you want to capture.
    RUN:     Ctrl+Shift+I in discord, paste in console and smash enter as normal.
    USE:     Scroll down to capture more DMs.
    DONE:    call printLogged() to get your messages!
*/

let DiscordMessages = "";
let LastAuthor;
let totalLogged = 0;
let scroller =  $('[class^="scrollerInner"]');
function msgLog(msg){
    let thisAuthor = msg.querySelector('[class^="header"] [class^="username"]')?.innerText;
    if( thisAuthor ){ LastAuthor = thisAuthor }
    
    let msgContent = msg.querySelector('[id^="message-content"]')?.firstChild?.innerText;
    msgContent = msgContent?.replaceAll("\n", "\n\t")
    DiscordMessages += `${LastAuthor}:\n\t${msgContent}\n`;
}
function printLogged(){ console.log(DiscordMessages) };

try{ observer.disconnect() } catch (e){ } // unhook any previous observers if the script is run twice

let observer = new MutationObserver(
    function(mutations) {
        let count = 0
        for( let change of mutations ){
            let msg = change.addedNodes[0]
            if( msg ){
                count++;
                msgLog(msg)
            }
        }
        console.log("Appended "+count+" messages");
    }
)
for( let msg of scroller.children ){ 
    msgLog(msg);
    totalLogged++;
}
console.log("Logged "+totalLogged+" messages initially...");
observer.observe(scroller, { attributes: true, childList: true, characterData: true });
