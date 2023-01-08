/*********************************
*    Fast's Discord Overrides    *
*  for the Classic Look n' Feel  *
*********************************/

/*  HOW TO USE:
    Ctrl + Shift + I in Discord to bring up console.
    Paste and run this to apply supplied CSS overrides and HTML replacements
*/

/* HTML REPLACEMENTS */
{
    // bring back the old logo text
    let titleOverride = document.createElement('img')
        titleOverride.width = "55"
        titleOverride.height = "12"
        titleOverride.viewBox = "0 0 55 12"
        titleOverride.src = "https://cdn.discordapp.com/attachments/672248280222138391/859629110157508638/window-title-old.png"
    document.querySelector('[class^="wordmarkWindow"]').children[0].replaceWith(titleOverride);
}

/* CSS OVERRIDES */
{
    // if our stylesheet mod doesn't exist, create it
    if( document.styleMods == undefined ){
        document.styleMods = document.createElement("style")
        document.head.appendChild(document.styleMods)
    }

    document.styleMods.innerText = 

        // old @mention coloring
        '.theme-dark .wrapper-1ZcZW- { color: #8ea1e1; background: rgba(114,137,218,.1); }\n' + 

        // force the old blurple in most places
        '[data-popout-root], html { --blurple-original: rgb(114,137,217); --brand-experiment: var(--blurple-original); --brand-experiment-560: var(--blurple-original); }\n' + 

        // force the old blurple for folder icons
        '.expandedFolderIconWrapper-Huv7rA svg { color: var(--blurple-original) !important; }\n'

}