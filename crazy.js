
const TRAINING_DATA = "Crazy? I was crazy once. They locked me in a room. A rubber room. A rubber room with rats. And rats make me crazy."

let processedData = TRAINING_DATA.toLowerCase().split(" ")
let markov = {}

function dePunct(str){
    return str.replace(/[^a-z]/gm,"")
}

for (let i = 1; i < processedData.length; i++) {
    const pre_words = [processedData[i-1], dePunct(processedData[i-1])]
    const post = processedData[i]
    for(let pre of pre_words){
        markov[pre] = markov[pre] || []
        markov[pre].push(post)
    }
}

function pickRandom(array = []) {
    return array[ Math.floor(Math.random()*array.length) ];
}

function generate(words, depth){
    const next = words[words.length - 1]
    const pool = markov[dePunct(next)]

    if(!pool) {
        words.pop()
        return generate(
            words,
            depth
        )
    }

    if(depth > 256) return words;
    return generate(
        [...words, pickRandom(pool)],
        depth + 1
    )
}

const crazy = generate(["crazy?"],0)
for (let i = 1; i < crazy.length; i++) {
    const prev = crazy[i-1];
    if(prev.match(/[^a-zA-Z]/gm)){
        crazy[i] = crazy[i][0].toUpperCase() + crazy[i].substring(1)
    }
}
console.log(crazy.join(" "))