My slowly-growing collection of chromium console scripts.  May occasionally prove useful for debugging or reverse-engineering things.

## Chrome Dumper
Recursively prints all discovered JS values and their types to console.&ensp;Can be memory intensive and may crash chrome console on larger websites when using high recursion depth.&ensp;Object paths can be blacklisted if necessary.

## Chrome Inspector
Attaches debug events to all discovered JS functions.&ensp;Has support for antispam, path blacklisting, and selective detouring of parts of a website.

## Chrome Corruptor
Changes all discovered JS values to different values of the same type from elsewhere on the site.&ensp;The results of this can range from boring to spectacular.&ensp;Strings are currently the most entertaining and safe thing to corrupt.<br>
<i><b>NOTE:</b>&ensp;Running this can create bad cookies that persistently break things.&ensp;Fixing this requires clearing your cookies if it happens.</i>

## Chrome Searcher
Recursively searches for JS values or values under keys containing search terms from searcher.SEARCH_KEYS and prints them to console.

## Discord Dumper
Ctrl+Shift+I in Discord, paste in chromium console, and run to record a transcript of DMs as you scroll.&ensp;Start at the top and scroll your way down.&ensp;Might not work as of the most recent update; haven't tested yet.

## Soundcloud Track URL Scraper
Extracts links to track/song titles of the current page. &ensp;Originally used to scrape my likes from https://soundcloud.com/fasteroid-1/likes for use in another script. &ensp;make sure to scroll every t

## YouTube Playlist URL Scraper
Extracts links to videos of YouTube playlists. &ensp;Navigate to the first video in a playlist like [this one](https://www.youtube.com/watch?v=q6EoRBvdVPQ&list=PLFsQleAWXsj_4yDeebiIADdH5FMayBiJo&index=1), scroll through as much as you want to scrape, then run to capture the URLs.

## Gamer Text
This one is stupid, all it does is give text on the site an rgb color-scrolling effect.&ensp;It can probably be modified to do funnier things than this.
