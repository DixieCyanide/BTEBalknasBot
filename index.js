const fs = require('node:fs');
const { Client, Events, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { ActionRowBuilder, EmbedBuilder } = require('@discordjs/builders');
const { channelId, messageId, token } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const mapMessage = {
    embeds: [new EmbedBuilder(require('./assets/embeds/mapEmbed.json'))],
    files: [new AttachmentBuilder('./assets/pics/map.png')],
    components: [
        new ActionRowBuilder(require('./assets/buttons/buttons0.json')),
        new ActionRowBuilder(require('./assets/buttons/buttons1.json')),
        new ActionRowBuilder(require('./assets/buttons/buttons2.json'))
    ]
};

client.once(Events.ClientReady, () => {
    console.log('Bot is ready!');

    const channel = client.channels.cache.get(channelId);

    channel.messages.fetch(messageId)
    .then(message => { message.edit(mapMessage) })
    .catch((error) => {
        console.log('Original message was deleted, restoring...');
        channel.send(mapMessage)
        .then(message => {
            const sentMsg = message;
            const cfg = require('./config.json');
            cfg.messageId = sentMsg.id;
            fs.writeFileSync('./config.json', JSON.stringify(cfg, null, 2));
        });
    });
});

client.on(Events.InteractionCreate, async interaction => {
    if(interaction.isButton) {
        try {
            await interaction.reply({
                embeds: [new EmbedBuilder(require(`./assets/embeds/${interaction.customId}Embed.json`))],
                files: [new AttachmentBuilder(`./assets/pics/${interaction.customId}Map.png`)],
                ephemeral: true
            });
        } catch (error) {
            interaction.reply({content: 'Something went wrong.', ephemeral: true});
            console.error(`Assets for ${interaction.customId} are anavailable.`)
        }
    }
    
    if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.login(token);