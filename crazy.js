
const TRAINING_DATA = "Crazy? I was crazy once. They locked me in a room. A rubber room. A rubber room with rats. And rats make me crazy."

let processedData = TRAINING_DATA.toLowerCase().split(" ")
let markov = {}

function getVar(str){
    return str.replace(/[^a-z]/gm,"")
}

for (let i = 1; i < processedData.length; i++) {
    const pre = processedData[i-1]
    const pre_var = getVar(pre)
    const post = processedData[i]
    const post_var = getVar(post)
    markov[pre] = markov[pre] || []
    markov[pre_var] = markov[pre_var] || []
    markov[pre].push(post)
    markov[pre_var].push(post)
    markov[pre].push(post_var)
    markov[pre_var].push(post_var)
}

function pickRandom(array = []) {
    return array[ Math.floor(Math.random()*array.length) ];
}

function generate(words, depth){
    const next = words[words.length - 1]
    const pool = markov[next]

    if(!pool) {
        words.pop()
        return generate(
            words,
            depth
        )
    }

    if(depth > 128) return words;
    return generate(
        [...words, pickRandom(pool)],
        depth + 1
    )
}

const crazy = generate(["crazy?"],0)
console.log(crazy.join(" "))