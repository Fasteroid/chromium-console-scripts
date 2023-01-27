const ZERO = "⁢"
const ONE = "⁤"

function forget(text){
    return text.replace(/[a-zA-Z]/g, function(match){
        let bin = match.charCodeAt(0).toString(2);
        if( bin.length<8 ) bin = '0'.repeat(8-bin.length)+bin;
        bin = bin.replaceAll("0", ZERO);
        bin = bin.replaceAll("1", ONE);
        return "☐"+bin;
    });
}

function remember(text){
    return text.replace(/☐(........)/g, function(match){
        match = match.substring(1)
        match = match.replaceAll(ZERO, "0");
        match = match.replaceAll(ONE, "1");
        match = String.fromCharCode( parseInt(match,2) );
        return match;
    });
}