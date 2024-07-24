const cardEmotes = {
    '2_of_hearts': '<:2_of_hearts:1265240271151566970>',
    '2_of_diamonds': '<:2_of_diamonds:1264998585716441189>',
    '2_of_clubs': '<:2_of_clubs:1264998584227467296>',
    '2_of_spades': '<:2_of_spades:1265239477845229650>'
};

function getCardEmote(name) {
    let string = `${name.value}_of_${name.suit}`;
    return cardEmotes[string];
}

module.exports = { getCardEmote };