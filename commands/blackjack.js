require('dotenv').config();
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const { addMoney, removeMoney, getMoney } = require('../utils/economy-db');

const deck = [];
let playerHand = [];
let dealerHand = [];
let canDoubleDown = false; // Variable to track if doubling down is allowed

module.exports = {
    name: 'blackjack',
    description: 'Play blackjack game',
    execute(message) {
        const PREFIX = process.env.PREFIX;


        function initializeDeck() {
            const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
            const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            for (const suit of suits) {
                for (const value of values) {
                    deck.push({ value, suit });
                }
            }
        }

        function shuffleDeck() {
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
        }

        function calculateHandValue(hand) {
            let value = 0;
            let aces = 0;

            for (const card of hand) {
                if (['J', 'Q', 'K'].includes(card.value)) {
                    value += 10;
                } else if (card.value === 'A') {
                    value += 11;
                    aces += 1;
                } else {
                    value += parseInt(card.value, 10);
                }
            }

            while (value > 21 && aces) {
                value -= 10;
                aces -= 1;
            }

            const hardValue = value - (aces > 0 ? 10 : 0);
            return { soft: value, hard: hardValue };
        }

        function handValueString(handValue, forceSoftValue = false) {
            if (forceSoftValue == true) return handValue.soft;
            if (handValue.soft !== handValue.hard) {
                return `${handValue.hard}/${handValue.soft}`;
            }
            return `${handValue.hard}`;
        }

        async function validateBet(user, bet){
            if(bet < 20) return message.reply("Minimal bet is 20");
            const money = await getMoney(user);
            if(bet > money) return message.reply("You don't have enough funds");
        }

        async function startBlackjackGame() {
            

            initializeDeck();
            shuffleDeck();

            playerHand = [deck.pop(), deck.pop()];
            dealerHand = [deck.pop(), deck.pop()];

            const playerHandValue = calculateHandValue(playerHand);

            const playerHandMessage = await message.channel.send(`Your hand: ${handToString(playerHand)} (Value: ${handValueString(playerHandValue)})`);
            const dealerHandMessage = await message.channel.send(`Dealer's hand: ${dealerHand[0].value} of ${dealerHand[0].suit} and [Hidden]`);

            // Check for Blackjack
            if (playerHandValue.soft === 21) {
                playerHandMessage.edit(`Your hand: ${handToString(playerHand)} (Value: ${handValueString(playerHandValue, true)})`);
                message.channel.send('Blackjack! You win!');
                return null;
            } else {
                canDoubleDown = true; // Enable double down option

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('hit')
                            .setLabel('Hit')
                            .setStyle('Primary'),
                        new ButtonBuilder()
                            .setCustomId('stand')
                            .setLabel('Stand')
                            .setStyle('Secondary'),
                        new ButtonBuilder()
                            .setCustomId('double')
                            .setLabel('Double')
                            .setStyle('Success')
                            .setDisabled(!canDoubleDown) // Disable if double down is not allowed
                    );

                const actionMessage = await message.channel.send({ content: 'Choose your action:', components: [row] });
                return {
                    actionMessage: actionMessage,
                    playerHandMessage: playerHandMessage,
                    dealerHandMessage: dealerHandMessage
                }
            }
        }

        function handToString(hand) {
            return hand.map(card => `${card.value} of ${card.suit}`).join(', ');
        }

        if (message.content === PREFIX + 'start') {
            let bet = message.content.split(" ")[1];
            validateBet(message.author.id);
            startBlackjackGame().then((result) => {
                if (result == null) return;

                const { actionMessage, playerHandMessage, dealerHandMessage } = result;

                const filter = i => i.user.id === message.author.id;
                const collector = actionMessage.createMessageComponentCollector({ filter, time: 15000 });

                collector.on('collect', async (buttonInteraction) => {
                    if (buttonInteraction.customId === 'hit') {
                        collector.resetTimer();
                        canDoubleDown = false; // Disable double down option after the first action
                        playerHand.push(deck.pop());
                        const playerHandValue = calculateHandValue(playerHand);

                        playerHandMessage.edit(`Your hand: ${handToString(playerHand)} (Value: ${handValueString(playerHandValue)})`);
                        if (playerHandValue.soft > 21) {
                            collector.stop("bust");

                            let dealerHandValue = calculateHandValue(dealerHand);
                            while (dealerHandValue.soft < 17) {
                                dealerHand.push(deck.pop());
                                dealerHandValue = calculateHandValue(dealerHand);
                            }

                            dealerHandMessage.edit(`Dealer's hand: ${handToString(dealerHand)} (Value: ${handValueString(dealerHandValue, true)})`);

                            await buttonInteraction.update({ content: 'You busted! Dealer wins.', components: [] });
                        } else if (playerHandValue.soft === 21) {
                            collector.stop("win");
                            await buttonInteraction.update({ content: 'You reached 21!', components: [] });
                            // Automatically treat as stand
                            let dealerHandValue = calculateHandValue(dealerHand);
                            while (dealerHandValue.soft < 17) {
                                dealerHand.push(deck.pop());
                                dealerHandValue = calculateHandValue(dealerHand);
                            }

                            playerHandMessage.edit(`Your hand: ${handToString(playerHand)} (Value: ${handValueString(playerHandValue, true)})`);
                            dealerHandMessage.edit(`Dealer's hand: ${handToString(dealerHand)} (Value: ${handValueString(dealerHandValue, true)})`);

                            getResult(dealerHandValue, playerHandValue);
                        } else {
                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('hit')
                                        .setLabel('Hit')
                                        .setStyle('Primary'),
                                    new ButtonBuilder()
                                        .setCustomId('stand')
                                        .setLabel('Stand')
                                        .setStyle('Secondary'),
                                );

                            buttonInteraction.update({ content: 'Choose your action:', components: [row] });
                        }
                    } else if (buttonInteraction.customId === 'stand') {
                        collector.stop("stand");
                        canDoubleDown = false; // Disable double down option after the first action
                        let dealerHandValue = calculateHandValue(dealerHand);
                        while (dealerHandValue.soft < 17) {
                            dealerHand.push(deck.pop());
                            dealerHandValue = calculateHandValue(dealerHand);
                        }
                        const playerHandValue = calculateHandValue(playerHand);

                        playerHandMessage.edit(`Your hand: ${handToString(playerHand)} (Value: ${handValueString(playerHandValue, true)})`);
                        dealerHandMessage.edit(`Dealer's hand: ${handToString(dealerHand)} (Value: ${handValueString(dealerHandValue, true)})`);

                        actionMessage.delete();

                        getResult(dealerHandValue, playerHandValue);
                    } else if (buttonInteraction.customId === 'double' && canDoubleDown) {
                        collector.stop("double");
                        buttonInteraction.update({ content: 'You doubled down. You get one card', components: [] });

                        canDoubleDown = false; // Disable double down option after use
                        playerHand.push(deck.pop());
                        const playerHandValue = calculateHandValue(playerHand);

                        playerHandMessage.edit(`Your hand: ${handToString(playerHand)} (Value: ${handValueString(playerHandValue, true)})`);

                        if (playerHandValue.soft > 21) {
                            message.channel.send('You busted! Dealer wins.');
                        } else {
                            actionMessage.delete();
                            let dealerHandValue = calculateHandValue(dealerHand);
                            while (dealerHandValue.soft < 17) {
                                dealerHand.push(deck.pop());
                                dealerHandValue = calculateHandValue(dealerHand);
                            }
                            dealerHandMessage.edit(`Dealer's hand: ${handToString(dealerHand)} (Value: ${handValueString(dealerHandValue, true)})`);

                            getResult(dealerHandValue, playerHandValue);
                        }
                    }
                });
                collector.on('end', (collected, reason) => {
                    if (reason === 'time') {
                        actionMessage.delete();
                        canDoubleDown = false; // Disable double down option after the first action
                        let dealerHandValue = calculateHandValue(dealerHand);
                        while (dealerHandValue.soft < 17) {
                            dealerHand.push(deck.pop());
                            dealerHandValue = calculateHandValue(dealerHand);
                        }
                        message.reply({ content: `Time\'s up! \nDealer's hand: ${handToString(dealerHand)} (Value: ${handValueString(dealerHandValue, true)})`, components: [] });

                        const playerHandValue = calculateHandValue(playerHand);
                        getResult(dealerHandValue, playerHandValue);
                    }
                });
            });
        }

        function getResult(dealerHandValue, playerHandValue) {
            if (dealerHandValue.soft > 21 || playerHandValue.soft > dealerHandValue.soft) {
                message.channel.send('You win!');
            } else if (playerHandValue.soft < dealerHandValue.soft) {
                message.channel.send('Dealer wins.');
            } else {
                message.channel.send('It\'s a tie!');
            }
        }
    }
}
