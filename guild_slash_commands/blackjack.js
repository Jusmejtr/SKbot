const { createCanvas, loadImage } = require('canvas');
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const { addMoney, removeMoney, getMoney } = require('../utils/economy-db');

var deck = [];
let playerHand = [];
let dealerHand = [];
let canDoubleDown = false; // Variable to track if doubling down is allowed
let playing = false;

const imgSize = {
    cardWidth: 250,
    cardHeight: 363,
    tableWidth: 2000,
    tableHeight: 1300,
    offset: 50,
    spaceBetweenCards: 50
}


module.exports = {
    name: 'balance',
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Let\'s play some blackjack')
        .addIntegerOption((option) =>
            option.setName('bet').setDescription('Your bet for this game').setRequired(true).setMinValue(20).setMaxValue(1000)
        ),
    async execute(interaction) {
        let userBet = interaction.options.getInteger('bet');

        async function drawTextWithBorderBox(ctx, text, x, y, width, height, fontSize, textColor, borderColor, borderWidth, backgroundColor) {
            // Nastavenie fontu pre text
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Vypočítanie pozície textu
            const textX = x + width / 2;
            const textY = y + height / 2;

            // Kreslenie obdĺžnika s čiernym okrajom
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, width, height);

            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = borderColor;
            ctx.strokeRect(x, y, width, height);

            // Vykreslenie textu
            ctx.fillStyle = textColor;
            ctx.fillText(text, textX, textY);
        }

        async function generateBlackjackTable(playerCards, dealerCards, forcePlayerHardHand, hiddenDealerCard = false) {
            const canvas = createCanvas(imgSize.tableWidth, imgSize.tableHeight);
            const ctx = canvas.getContext('2d');
            const background = await loadImage(path.join(__dirname, '..', 'props', 'table.png'));
            ctx.drawImage(background, 0, 0);


            const totalPlayerCardLength = (playerCards.length * imgSize.cardWidth) + (playerCards.length - 1) * imgSize.spaceBetweenCards;
            const totalDealerCardLength = (dealerCards.length * imgSize.cardWidth) + (dealerCards.length - 1) * imgSize.spaceBetweenCards;
            // player
            for (let i = 0; i < playerCards.length; i++) {
                const playerImage = await loadImage(path.join(__dirname, '..', 'props', 'cards', `${playerCards[i].value}_of_${playerCards[i].suit}.png`));
                ctx.drawImage(playerImage, (imgSize.tableWidth / 2) - (totalPlayerCardLength / 2) + (i * (imgSize.cardWidth + imgSize.spaceBetweenCards)), imgSize.tableHeight - imgSize.offset - imgSize.cardHeight, imgSize.cardWidth, imgSize.cardHeight);// render player card
            }
            const playerHandValue = calculateHandValue(playerCards);
            drawTextWithBorderBox(ctx, handValueString(playerHandValue, forcePlayerHardHand), imgSize.tableWidth / 2 - 90, imgSize.tableHeight - imgSize.offset - imgSize.cardHeight - 100 - imgSize.offset, 180, 100, 72, '#000000', '#000000', 5, '#FFFFFF'); //player sum

            //dealer
            if (hiddenDealerCard == true) {
                const card = await loadImage(path.join(__dirname, '..', 'props', 'cards', `${dealerCards[0].value}_of_${dealerCards[0].suit}.png`));
                const hiddenCard = await loadImage(path.join(__dirname, '..', 'props', 'cards', 'hidden.png'));

                ctx.drawImage(card, (imgSize.tableWidth / 2) - imgSize.cardWidth - (imgSize.spaceBetweenCards / 2), imgSize.offset, imgSize.cardWidth, imgSize.cardHeight);//dealer first card
                ctx.drawImage(hiddenCard, (imgSize.tableWidth / 2) + (imgSize.spaceBetweenCards / 2), imgSize.offset, imgSize.cardWidth, imgSize.cardHeight);//dealer hidden card

                drawTextWithBorderBox(ctx, dealerCards[0].value, imgSize.tableWidth / 2 - 90, imgSize.cardHeight + 100, 180, 100, 72, '#000000', '#000000', 5, '#FFFFFF'); //dealer sum
            } else {
                for (let i = 0; i < dealerCards.length; i++) {
                    const dealerImage = await loadImage(path.join(__dirname, '..', 'props', 'cards', `${dealerCards[i].value}_of_${dealerCards[i].suit}.png`));

                    ctx.drawImage(dealerImage, (imgSize.tableWidth / 2) - (totalDealerCardLength / 2) + (i * (imgSize.cardWidth + imgSize.spaceBetweenCards)), imgSize.offset, imgSize.cardWidth, imgSize.cardHeight);// render dealer card             
                }
                const dealerHandValue = calculateHandValue(dealerCards);
                drawTextWithBorderBox(ctx, handValueString(dealerHandValue, true), imgSize.tableWidth / 2 - 90, imgSize.cardHeight + 100, 180, 100, 72, '#000000', '#000000', 5, '#FFFFFF'); //dealer
            }
            return canvas.toBuffer();
        }

        function initializeDeck() {
            deck = [];
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

            const softValue = value - (aces > 0 ? 10 : 0);
            return { soft: softValue, hard: value };// A 5; soft = 6, hard = 16
        }

        function handValueString(handValue, forceHardValue = false) {
            if (forceHardValue == true) return handValue.hard;
            if (handValue.soft !== handValue.hard) {
                return `${handValue.soft}/${handValue.hard}`;
            }
            return `${handValue.hard}`;
        }

        async function validateBet(user, bet) {
            const money = await getMoney(user);
            if (money == null) {
                return null;
            }
            if (bet > money) return false;
            return true;
        }

        async function startBlackjackGame() {
            if (playing) {
                interaction.editReply("Currently other player is playing blackjack");
                return null;
            }
            const validateMoney = await validateBet(interaction.user.id, userBet);
            if (validateMoney == null) {
                interaction.editReply("You don't have economy account or some error occurred.");
                return null;
            } else if (validateMoney == false) {
                interaction.editReply("Sorry, you don't have enough money");
                return null;
            }
            removeMoney(interaction.user.id, userBet);
            initializeDeck();
            shuffleDeck();
            playing = true;

            playerHand = [deck.pop(), deck.pop()];
            dealerHand = [deck.pop(), deck.pop()];

            const playerHandValue = calculateHandValue(playerHand);

            if (playerHandValue.hard === 21) {
                await interaction.editReply({
                    content: `**Gratulujem k blackjacku. Výhra: ${parseInt(userBet * 2.5)}**`,
                    files: [new AttachmentBuilder(await generateBlackjackTable(playerHand, dealerHand, true), { name: 'table.png' })],
                });
                await addMoney(interaction.user.id, userBet * 2.5);
                playing = false;
                return null;
            } else {
                if (await getMoney(interaction.user.id) >= userBet) {
                    canDoubleDown = true;
                } else {
                    canDoubleDown = false;
                }
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
                            .setDisabled(!canDoubleDown)
                    );
                const gameMessage = await interaction.editReply({
                    content: 'Aké je vaše rozhodnutie?',
                    files: [new AttachmentBuilder(await generateBlackjackTable(playerHand, dealerHand, false, true), { name: 'table.png' })],
                    components: [row]
                });
                return gameMessage;
            }
        }

        function handToString(hand) {
            return hand.map(card => `**${card.value}** of ${card.suit}`).join(', ');
        }

        async function handleInteraction(collector, buttonInteraction) {
            if (buttonInteraction.customId === 'hit') {
                collector.resetTimer();
                playerHand.push(deck.pop());
                const playerHandValue = calculateHandValue(playerHand);

                if (playerHandValue.hard > 21) {
                    collector.stop("bust");

                    let dealerHandValue = calculateHandValue(dealerHand);
                    while (dealerHandValue.soft < 17) {
                        dealerHand.push(deck.pop());
                        dealerHandValue = calculateHandValue(dealerHand);
                    }
                    await interaction.editReply({
                        content: `**Žiaľ máte too many, prajem viacej šťastia do ďalšieho kola**`,
                        files: [new AttachmentBuilder(await generateBlackjackTable(playerHand, dealerHand, true), { name: 'table.png' })],
                        components: []
                    });

                    playing = false;
                } else if (playerHandValue.hard === 21) {
                    collector.stop("win");
                    addMoney(interaction.user.id, userBet * 2);

                    let dealerHandValue = calculateHandValue(dealerHand);
                    while (dealerHandValue.soft < 17) {
                        dealerHand.push(deck.pop());
                        dealerHandValue = calculateHandValue(dealerHand);
                    }

                    await interaction.editReply({
                        content: `**Gratulujem, máte blackjack. Výhra: ${userBet * 2}**`,
                        files: [new AttachmentBuilder(await generateBlackjackTable(playerHand, dealerHand, true), { name: 'table.png' })],
                        components: []
                    });
                    playing = false;
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

                    await buttonInteraction.update({
                        content: `Aké je Vaše ďalšie rozhodnutie?`,
                        files: [new AttachmentBuilder(await generateBlackjackTable(playerHand, dealerHand, false, true), { name: 'table.png' })],
                        components: [row]
                    });
                }
            } else if (buttonInteraction.customId === 'stand') {
                collector.stop("stand");
                let dealerHandValue = calculateHandValue(dealerHand);
                while (dealerHandValue.soft < 17) {
                    dealerHand.push(deck.pop());
                    dealerHandValue = calculateHandValue(dealerHand);
                }
                const playerHandValue = calculateHandValue(playerHand);

                await interaction.editReply({
                    content: `Stojíme na ${handValueString(playerHandValue, true)}. ${getResult(dealerHandValue, playerHandValue)}`,
                    files: [new AttachmentBuilder(await generateBlackjackTable(playerHand, dealerHand, true), { name: 'table.png' })],
                    components: []
                });

                playing = false;
            } else if (buttonInteraction.customId === 'double' && canDoubleDown) {
                removeMoney(interaction.user.id, userBet);
                collector.stop("double");
                let playerHandValue = calculateHandValue(playerHand);
                let valueBeforeDouble = playerHandValue.hard;

                playerHand.push(deck.pop());

                if (playerHandValue.hard > 21) {
                    await interaction.editReply({
                        content: `Double na ${valueBeforeDouble}. **Máte too many. Prajem viacej šťastia do ďalšieho kola**`,
                        files: [new AttachmentBuilder(await generateBlackjackTable(playerHand, dealerHand, true), { name: 'table.png' })],
                        components: []
                    });
                } else {
                    let dealerHandValue = calculateHandValue(dealerHand);
                    while (dealerHandValue.soft < 17) {
                        dealerHand.push(deck.pop());
                        dealerHandValue = calculateHandValue(dealerHand);
                    }
                    await interaction.editReply({
                        content: `Double na ${valueBeforeDouble}. ${getResult(dealerHandValue, playerHandValue, true)}`,
                        files: [new AttachmentBuilder(await generateBlackjackTable(playerHand, dealerHand, true), { name: 'table.png' })],
                        components: []
                    });
                }
                playing = false;
            }
        }

        async function handleEnd(interaction, reason) {
            if (reason === 'time') {
                canDoubleDown = false;
                let dealerHandValue = calculateHandValue(dealerHand);
                while (dealerHandValue.soft < 17) {
                    dealerHand.push(deck.pop());
                    dealerHandValue = calculateHandValue(dealerHand);
                }
                await interaction.channel.send({ content: `Čas vypršal!\nDealer's hand: ${handToString(dealerHand)} (Value: ${handValueString(dealerHandValue)})`, components: [] });

                const playerHandValue = calculateHandValue(playerHand);
                getResult(dealerHandValue, playerHandValue);
            }
            playing = false;
        }

        function getResult(dealerHandValue, playerHandValue, double = false) {
            if (dealerHandValue.hard > 21) {
                if (double == true) {
                    addMoney(interaction.user.id, userBet * 4);
                    return `**Dealer má too many, gratulujem k výhre ${parseInt(userBet * 4)}**`;
                } else {
                    addMoney(interaction.user.id, userBet * 2);
                    return `**Dealer má too many, gratulujem k výhre ${parseInt(userBet * 2)}**`;
                }
            } else if (playerHandValue.hard > dealerHandValue.hard) {
                if (double == true) {
                    addMoney(interaction.user.id, userBet * 4);
                    return `**Gratulujem k výhre ${parseInt(userBet * 4)}**`;
                } else {
                    addMoney(interaction.user.id, userBet * 2);
                    return `**Gratulujem k výhre ${parseInt(userBet * 2)}**`;
                }
            } else if (playerHandValue.hard < dealerHandValue.hard) {
                return '**V tomto kole vyhráva dealer. Prajem viacej štastia do ďalšieho kola**';
            } else {
                if (double == true) {
                    addMoney(interaction.user.id, userBet * 2);
                } else {
                    addMoney(interaction.user.id, userBet);
                }
                return '**A je to remíza. Prajem viacej štastia do ďalšieho kola**';
            }
        }

        await interaction.deferReply();
        const result = await startBlackjackGame();

        if (result == null) return;

        const filter = i => i.user.id === interaction.user.id;
        const collector = result.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (buttonInteraction) => {
            await handleInteraction(collector, buttonInteraction);
        });

        collector.on('end', async (collected, reason) => {
            await handleEnd(interaction, reason);
        });
    }
}