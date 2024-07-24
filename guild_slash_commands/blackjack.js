const { createCanvas, loadImage } = require('canvas');
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const { addMoney, removeMoney, getMoney } = require('../utils/economy-db');

let deck = [];
let playerHand = [];
let dealerHand = [];
let canDoubleDown = false;
let playing = false;

const imgSize = {
    cardWidth: 250,
    cardHeight: 363,
    tableWidth: 2000,
    tableHeight: 1300,
    offset: 50,
    spaceBetweenCards: 50
};

module.exports = {
    name: 'balance',
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Let\'s play some blackjack')
        .addIntegerOption(option =>
            option.setName('bet').setDescription('Your bet for this game').setRequired(true).setMinValue(20).setMaxValue(1000)
        ),
    async execute(interaction) {
        let userBet = interaction.options.getInteger('bet');

        function drawTextWithBorderBox(ctx, text, x, y, width, height, fontSize, textColor, borderColor, borderWidth, backgroundColor) {
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const textX = x + width / 2;
            const textY = y + height / 2;

            ctx.fillStyle = backgroundColor;
            ctx.fillRect(x, y, width, height);

            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = borderColor;
            ctx.strokeRect(x, y, width, height);

            ctx.fillStyle = textColor;
            ctx.fillText(text, textX, textY);
        }

        function totalCardLength(cards) {
            return (cards.length * imgSize.cardWidth) + (cards.length - 1) * imgSize.spaceBetweenCards;
        }

        async function generateBlackjackTable(playerCards, dealerCards, forcePlayerHardHand, hiddenDealerCard = false) {
            const canvas = createCanvas(imgSize.tableWidth, imgSize.tableHeight);
            const ctx = canvas.getContext('2d');
            const background = await loadImage(path.join(__dirname, '..', 'props', 'table.png'));
            ctx.drawImage(background, 0, 0);

            const loadCardImages = playerCards.concat(hiddenDealerCard ? dealerCards.slice(0, 1) : dealerCards)
                .map(card => loadImage(path.join(__dirname, '..', 'props', 'cards', `${card.value}_of_${card.suit}.png`)));
            const [playerImages, dealerImages] = await Promise.all([
                Promise.all(loadCardImages.slice(0, playerCards.length)),
                Promise.all(loadCardImages.slice(playerCards.length))
            ]);

            playerImages.forEach((img, i) => {
                ctx.drawImage(img, (imgSize.tableWidth / 2) - (totalCardLength(playerCards) / 2) + (i * (imgSize.cardWidth + imgSize.spaceBetweenCards)), imgSize.tableHeight - imgSize.offset - imgSize.cardHeight, imgSize.cardWidth, imgSize.cardHeight);
            });
            const playerHandValue = calculateHandValue(playerCards);
            drawTextWithBorderBox(ctx, handValueString(playerHandValue, forcePlayerHardHand), imgSize.tableWidth / 2 - 100, imgSize.tableHeight - imgSize.offset - imgSize.cardHeight - 100 - imgSize.offset, 200, 100, 72, '#000000', '#000000', 5, '#FFFFFF');

            if (hiddenDealerCard) {
                ctx.drawImage(dealerImages[0], (imgSize.tableWidth / 2) - imgSize.cardWidth - (imgSize.spaceBetweenCards / 2), imgSize.offset, imgSize.cardWidth, imgSize.cardHeight);
                const hiddenCard = await loadImage(path.join(__dirname, '..', 'props', 'cards', 'hidden.png'));
                ctx.drawImage(hiddenCard, (imgSize.tableWidth / 2) + (imgSize.spaceBetweenCards / 2), imgSize.offset, imgSize.cardWidth, imgSize.cardHeight);
                drawTextWithBorderBox(ctx, dealerCards[0].value, imgSize.tableWidth / 2 - 100, imgSize.cardHeight + 100, 200, 100, 72, '#000000', '#000000', 5, '#FFFFFF');
            } else {
                dealerImages.forEach((img, i) => {
                    ctx.drawImage(img, (imgSize.tableWidth / 2) - (totalCardLength(dealerCards) / 2) + (i * (imgSize.cardWidth + imgSize.spaceBetweenCards)), imgSize.offset, imgSize.cardWidth, imgSize.cardHeight);
                });
                const dealerHandValue = calculateHandValue(dealerCards);
                drawTextWithBorderBox(ctx, handValueString(dealerHandValue, true), imgSize.tableWidth / 2 - 100, imgSize.cardHeight + 100, 200, 100, 72, '#000000', '#000000', 5, '#FFFFFF');
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
            if (forceHardValue) return handValue.hard;
            return handValue.soft !== handValue.hard ? `${handValue.soft}/${handValue.hard}` : `${handValue.hard}`;
        }

        async function validateBet(user, bet) {
            const money = await getMoney(user);
            return money != null && bet <= money;
        }

        async function startBlackjackGame() {
            if (playing) {
                await interaction.editReply("Currently another player is playing blackjack");
                return null;
            }
            const validateMoney = await validateBet(interaction.user.id, userBet);
            if (validateMoney == null) {
                await interaction.editReply("You don't have economy account or some error occurred.");
                return null;
            } else if (validateMoney == false) {
                await interaction.editReply("Sorry, you don't have enough money");
                return null;
            }
            await removeMoney(interaction.user.id, userBet);
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
                canDoubleDown = await getMoney(interaction.user.id) >= userBet;
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId('hit').setLabel('Hit').setStyle('Primary'),
                        new ButtonBuilder().setCustomId('stand').setLabel('Stand').setStyle('Secondary'),
                        new ButtonBuilder().setCustomId('double').setLabel('Double').setStyle('Success').setDisabled(!canDoubleDown)
                    );
                const gameMessage = await interaction.editReply({
                    content: 'Aké je vaše rozhodnutie?',
                    files: [new AttachmentBuilder(await generateBlackjackTable(playerHand, dealerHand, false, true), { name: 'table.png' })],
                    components: [row]
                });
                return gameMessage;
            }
        }

        async function handleInteraction(collector, buttonInteraction) {
            if (buttonInteraction.customId === 'hit') {
                collector.resetTimer();
                playerHand.push(deck.pop());
                const playerHandValue = calculateHandValue(playerHand);

                if (playerHandValue.hard > 21) {
                    collector.stop("bust");

                    let dealerHandValue = calculateHandValue(dealerHand);
                    while (dealerHandValue.hard < 17) {
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
                    while (dealerHandValue.hard < 17) {
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
                            new ButtonBuilder().setCustomId('hit').setLabel('Hit').setStyle('Primary'),
                            new ButtonBuilder().setCustomId('stand').setLabel('Stand').setStyle('Secondary'),
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
                while (dealerHandValue.hard < 17) {
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
                await removeMoney(interaction.user.id, userBet);
                collector.stop("double");
                let playerHandValue = calculateHandValue(playerHand);
                let valueBeforeDouble = playerHandValue.hard;

                playerHand.push(deck.pop());

                playerHandValue = calculateHandValue(playerHand);

                let dealerHandValue = calculateHandValue(dealerHand);
                while (dealerHandValue.hard < 17) {
                    dealerHand.push(deck.pop());
                    dealerHandValue = calculateHandValue(dealerHand);
                }

                if (playerHandValue.hard > 21) {
                    await interaction.editReply({
                        content: `Double na ${handValueString(playerHandValue)}. **Máte too many. Prajem viacej šťastia do ďalšieho kola**`,
                        files: [new AttachmentBuilder(await generateBlackjackTable(playerHand, dealerHand, true), { name: 'table.png' })],
                        components: []
                    });
                } else {
                    await interaction.editReply({
                        content: `Double na ${handValueString(playerHandValue)}. ${getResult(dealerHandValue, playerHandValue, true)}`,
                        files: [new AttachmentBuilder(await generateBlackjackTable(playerHand, dealerHand, true), { name: 'table.png' })],
                        components: []
                    });
                }
                playing = false;
            }
        }

        async function handleEnd(interaction, reason) {
            if (reason === 'time') {
                let dealerHandValue = calculateHandValue(dealerHand);
                while (dealerHandValue.hard < 17) {
                    dealerHand.push(deck.pop());
                    dealerHandValue = calculateHandValue(dealerHand);
                }
                const playerHandValue = calculateHandValue(playerHand);

                await interaction.editReply({
                    content: `Čas vypršal! Stojíme na: ${playerHandValue.hard}. ${getResult(dealerHandValue, playerHandValue)}`,
                    files: [new AttachmentBuilder(await generateBlackjackTable(playerHand, dealerHand, true), { name: 'table.png' })],
                    components: []
                });
            }
            playing = false;
        }

        function getResult(dealerHandValue, playerHandValue, double = false) {
            if (dealerHandValue.hard > 21) {
                const winnings = double ? userBet * 4 : userBet * 2;
                addMoney(interaction.user.id, winnings);
                return `**Dealer má too many, gratulujem k výhre ${winnings}**`;
            } else if (playerHandValue.hard > dealerHandValue.hard) {
                const winnings = double ? userBet * 4 : userBet * 2;
                addMoney(interaction.user.id, winnings);
                return `**Gratulujem k výhre ${winnings}**`;
            } else if (playerHandValue.hard < dealerHandValue.hard) {
                return '**V tomto kole vyhráva dealer. Prajem viacej štastia do ďalšieho kola**';
            } else {
                const winnings = double ? userBet * 2 : userBet;
                addMoney(interaction.user.id, winnings);
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
