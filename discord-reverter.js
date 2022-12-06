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

        // package the old Whitney variants
        '@font-face { font-family: "WhitneyLight"; src: url("https://discord.com/assets/e8acd7d9bf6207f99350ca9f9e23b168.woff") }' +
        '@font-face { font-family: "WhitneyHeader"; src: url("https://discord.com/assets/3bdef1251a424500c1b3a78dea9b7e57.woff") }' +

        // old @mention coloring
        '.theme-dark .wrapper-1ZcZW- { color: #8ea1e1; background: rgba(114,137,218,.1); }\n' + 

        // force the old blurple in most places
        '[data-popout-root], html { --blurple-original: rgb(114,137,217); --brand-experiment: var(--blurple-original); --brand-experiment-560: var(--blurple-original); }\n' + 

        // force all to WhitneyHeader by default
        ':root { --font-display: WhitneyHeader,"Helvetica Neue",Helvetica,Arial,sans-serif }\n' + 
        ':root { --font-primary: WhitneyHeader,"Helvetica Neue",Helvetica,Arial,sans-serif }\n' + 

        // message contents and similar get WhitneyLight
        '.markup-eYLPri { font-family: WhitneyLight,"Helvetica Neue",Helvetica,Arial,sans-serif }\n' +

        // force the old blurple for folder icons
        '.expandedFolderIconWrapper-Huv7rA svg { color: var(--blurple-original) !important; }\n'

}