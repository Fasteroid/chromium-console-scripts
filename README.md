# Welcome!
This is my slowly-growing collection of self-written chromium console witchcraft.&ensp;I archive anything I plan to use more than once here.&ensp;Perhaps you'll find something here of use:

## Chrome Dumper
Recursively prints all discovered JS values and their types to console.&ensp;Can be memory intensive and may crash chrome console on larger websites when using high recursion depth.&ensp;Object paths can be blacklisted if necessary.

## Chrome Corruptor
Changes all discovered JS values to different values of the same type from elsewhere on the site.&ensp;The results of this can range from boring to spectacular.&ensp;Strings are currently the most entertaining and safe thing to corrupt.<br>
<i><b>NOTE:</b>&ensp;Running this can create "bad" cookies that persistently break things.&ensp;Fixing this if it happens requires clearing your cookies.</i>

## Chrome Inspector
Attaches debug events to all discovered JS functions.&ensp;Has support for antispam, path blacklisting, and selective detouring of parts of a website.&ensp;Incredibly powerful for reverse-engineering.

## Chrome Searcher
Recursively searches for JS values or values under keys containing search terms from searcher.SEARCH_KEYS and prints them to console.

## Discord Dumper
Run to record a transcript of DMs as you scroll.&ensp;Start at the top and scroll your way down.&ensp;Might not work as of the most recent update.

## Discord Reverter
Get back the classic look n' feel of Discord!&ensp;Overrides some CSS and HTML elements and is currently a work-in-progress.&ensp;Gives you the old blurple back, probably.

## Shitpost Status Video Scraper
Scrapes YouTube video URLs from [shitpoststatus.com](https://shitpoststatus.com/) and outputs the result as comma-newline separated strings.

## Soundcloud Track URL Scraper
Extracts links to track/song titles of the current page.&ensp;Originally used to scrape my likes from [here](https://soundcloud.com/fasteroid-1/likes) for use in another script.&ensp;Make sure to scroll through everything you want to capture first.

## YouTube Playlist Video URL Scraper
Extracts links to videos of YouTube playlists.&ensp;Navigate to the first video in a playlist like [this one](https://www.youtube.com/watch?v=q6EoRBvdVPQ&list=PLFsQleAWXsj_4yDeebiIADdH5FMayBiJo&index=1), scroll through as much as you want to scrape, then run to capture the URLs.
