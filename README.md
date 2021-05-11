My slowly-growing collection of chromium console scripts.  May occasionally prove useful for debugging or reverse-engineering things.

## Chrome Dumper
Paste in chrome console and run to recursively print all discovered JS variables and their types to console.&ensp;Can be memory intensive and may crash chrome console on larger websites when using high recursion depth.&ensp;Object paths can be blacklisted if necessary.

## Chrome Inspector
Paste in chrome console and run to attach debug events to all discovered JS functions.&ensp;Has support for antispam, path blacklisting, and selective detouring of parts of a website.

## Chrome Corruptor
Paste in chrome console and run to change all discovered JS variables to different values of the same type from elsewhere on the site.&ensp;The results of this can range from boring to spectacular.&ensp;Strings are often the most entertaining thing to corrupt.<br>
<i><b>NOTE:</b>&ensp;Running this may result in bad cookies that persistently break sites.&ensp;If this happens, you will have to clear your cookies.</i>

## Discord Dumper
Ctrl+Shift+I in Discord, paste in chromium console, and run to record a transcript of DMs as you scroll.&ensp;Start at the top and scroll your way down.&ensp;Might not work as of the most recent update; haven't tested yet.

## Gamer Text
This one is stupid, all it does is give most text on the sote an rgb color-scrolling effect.&ensp;It can probably be modified to do funnier things than this too.
