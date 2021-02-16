This is a small collection of JS scripts for chrome console that might be useful for reverse-engineering or debugging.

## JS Global Dumper
Paste in chrome console and run to recursively print all discovered values and their types to console.  Can be memory intensive and may crash chrome console on larger websites when using high recursion depth.  Object paths can be blacklisted if necessary.

## JS Call Inspector
Paste in chrome console and run to attach debug events to all discovered functions.  Has support for antispam, path blacklisting, and selective detouring of parts of a website. 
The cursed version lets you detour even passed arguments and returned functions.

## JS Global Corruptor
Paste in chrome console and run to change all discovered values to different values of the same type.  The results of this can range from boring to spectacular—strings seem to be the most entertaining thing to corrupt.  This script has the potential to corrupt your cookies if you randomize functions, which may result in websites breaking persistently.  If this happens, simply clear your cookies and refresh.  Have fun!
