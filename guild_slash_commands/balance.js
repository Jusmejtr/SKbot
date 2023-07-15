const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'balance',
    data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('How many coins do you have?')
        .addUserOption((option) =>
						option.setName('user').setDescription('The user you want to find out how many coins he has').setRequired(false),
					),
    execute(interaction, db){
        let user = interaction.options.getUser('user') ?? interaction.user;
        
        if (user) {
            db.collection('economy').doc(user.id).get().then((q) => {
                if(!q.exists){
                    interaction.reply({content: `${user.username} don't have account`});
                }else{
                    var hodnota = q.data().money;
                    
                    if(interaction.options.getUser('user') == null){
                        interaction.reply({content: `You have ${hodnota} coins`});
                    }else{
                        interaction.reply({content: `${user.username} has ${hodnota} coins`});
                    }
                }
            }); 
        } else {
            interaction.reply({content: 'Error'});
        }
    }
}