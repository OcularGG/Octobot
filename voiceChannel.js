const { Client, GatewayIntentBits,UserSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: null,  // Not necessary unless you want a specific command trigger
    async startVoiceChannel(client) {
        const mainVoiceChannelId = '1336425557595783232'; // ID of the main voice channel to monitor
        const createdVoiceChannels = new Map();  // Store created channels

        client.on('ready', () => {
            console.log(`Logged in as ${client.user.tag}!`);
        });

        // Helper function to create a temporary voice channel
        async function createTempChannel(guild, member, mainChannel) {
            const tempChannel = await guild.channels.create({
                name: `${member.displayName}'s Channel`,
                type: ChannelType.GuildVoice,
                parent: mainChannel.parent,
                userLimit: 0,
                    permissionOverwrites: [
                         {
                                id: guild.id, // Everyone
                                deny: [PermissionFlagsBits.Connect], // Deny everyone from connecting by default
                         },
                         {
                                id: member.id, // Channel owner
                                allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles],
                         },
                         {
                                id: '1336395193980817458', 
                                allow: [PermissionFlagsBits.Connect],
                         },
                         {
                                id: '1336395194995834971',
                                allow: [PermissionFlagsBits.Connect],
                         },
        ],
            });

            await member.voice.setChannel(tempChannel);  // Move user to new channel
            return tempChannel;
        }

        // Create and send the initial embed with select menus
        async function sendChannelSetupMessage(tempChannel, member) {
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Welcome to your own temporary voice channel!')
                .setDescription('Use the following select menus to control your channel settings/permissions.')
                .setThumbnail(client.user.displayAvatarURL());

            const settingsMenu = new StringSelectMenuBuilder()
                .setCustomId('change_channel_settings')
                .setPlaceholder('Change channel settings:')
                .addOptions([
                    { label: 'Name', value: 'name' },
                    { label: 'Limit', value: 'limit' },
                ]);

            const permissionsMenu = new StringSelectMenuBuilder()
                .setCustomId('change_permissions')
                .setPlaceholder('Change channel permissions:')
                .addOptions([
                    { label: 'Lock', value: 'lock' },
                    { label: 'Unlock', value: 'unlock' },
                    { label: 'Permit', value: 'permit' },
                ]);

            const row1 = new ActionRowBuilder().addComponents(settingsMenu);
            const row2 = new ActionRowBuilder().addComponents(permissionsMenu);

            const message = await tempChannel.send({ embeds: [embed], components: [row1, row2] });

            // Store the channel and message ID for further interaction handling
            createdVoiceChannels.set(tempChannel.id, { ownerId: member.id, messageId: message.id });
        }

        // Event listener for voice state updates
        client.on('voiceStateUpdate', async (oldState, newState) => {
            if (newState.channelId === mainVoiceChannelId && oldState.channelId !== mainVoiceChannelId) {
                const guild = newState.guild;
                const member = newState.member;

                const tempChannel = await createTempChannel(guild, member, newState.channel);
                await sendChannelSetupMessage(tempChannel, member);
            }
        });

        // Handle interactions with select menus
       client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    const { customId, values, member, channel } = interaction;
    const userId = member.id;

    // Handle changes based on the selected menu
    if (customId === 'change_channel_settings') {
        // Check if the user is the owner of the channel inside this block
        const channelData = createdVoiceChannels.get(channel.id);
        if (!channelData || channelData.ownerId !== userId) {
            return interaction.reply({ content: 'You are not the owner of this channel.', flags: 64 });
        }

        if (values[0] === 'name') {
            await showNameChangeModal(interaction);
        } else if (values[0] === 'limit') {
            await showLimitChangeModal(interaction);
        }

    } else if (customId === 'change_permissions') {
        // Check if the user is the owner of the channel inside this block as well
        const channelData = createdVoiceChannels.get(channel.id);
        if (!channelData || channelData.ownerId !== userId) {
            return interaction.reply({ content: 'You are not the owner of this channel.', flags: 64 });
        }

        await handlePermissionsChange(interaction, values[0], channel, member.guild);
    }
});

        // Handle modal interactions for name and limit
       client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;

    const { customId, fields, member, channel } = interaction;
    const userId = member.id;

    if (customId === 'name_modal') {
        // Check if the user is the owner of the channel inside this block
        const channelData = createdVoiceChannels.get(channel.id);
        if (!channelData || channelData.ownerId !== userId) {
            return interaction.reply({ content: 'You are not the owner of this channel.', flags: 64 });
        }

        const newName = fields.getTextInputValue('new_name');
        await channel.setName(newName);
        await interaction.reply(`The channel name has been updated to: ${newName}`, { flags: 64 });

    } else if (customId === 'limit_modal') {
        // Check if the user is the owner of the channel inside this block as well
        const channelData = createdVoiceChannels.get(channel.id);
        if (!channelData || channelData.ownerId !== userId) {
            return interaction.reply({ content: 'You are not the owner of this channel.', flags: 64 });
        }

        const newLimit = parseInt(fields.getTextInputValue('new_limit'));
        if (isNaN(newLimit) || newLimit < 0) {
            return interaction.reply({ content: 'Please provide a valid number for the user limit.', flags: 64 });
        }
        await channel.setUserLimit(newLimit);
        await interaction.reply(`The user limit has been updated to: ${newLimit}`, { flags: 64 });
    }
});


        // Permissions change handler
        async function handlePermissionsChange(interaction, action, channel, guild) {
            switch (action) {
                case 'lock':
                    await channel.permissionOverwrites.edit(channel.guild.id, { CONNECT: PermissionFlagsBits.Deny });
                    await interaction.reply('Channel locked.');
                    break;
                case 'unlock':
                    await channel.permissionOverwrites.edit(channel.guild.id, { CONNECT: PermissionFlagsBits.Allow });
                    await interaction.reply('Channel unlocked.');
                    break;
                case 'permit':
                    const members = await guild.members.fetch();

                     const selectMenu = new UserSelectMenuBuilder()
                        .setCustomId('select_permitted_member')
                        .setPlaceholder('Select a member to permit:')
                        .setMinValues(1)  // Allow at least one selection
                        .setMaxValues(1);  // Limit to 1 selection

                    const row = new ActionRowBuilder().addComponents(selectMenu);
                    await interaction.reply({ content: 'Select a member to permit to the channel:', components: [row] });
                    break;
            }
        }

        // Handle the response to the "permit" dropdown
        client.on('interactionCreate', async (interaction) => {
        // Check that the interaction is a User Select Menu
         if (!interaction.isUserSelectMenu()) return;

        if (interaction.customId === 'select_permitted_member') {
        const memberId = interaction.values[0]; // The selected user's ID from the dropdown
        const member = await interaction.guild.members.fetch(memberId);
        const channelData = createdVoiceChannels.get(interaction.channel.id);

        if (!channelData || channelData.ownerId !== interaction.member.id) {
            return interaction.reply({ content: 'You are not the owner of this channel.', flags: 64 });
        }

        // Update the selected member's permission to connect to the channel
        await interaction.channel.permissionOverwrites.edit(memberId, { CONNECT: PermissionFlagsBits.Allow });
        await interaction.reply({ content: `${member.user.username} has been permitted to join the channel.` });
        }
        });
        // Modal for changing channel name
        async function showNameChangeModal(interaction) {
            const modal = new ModalBuilder()
                .setCustomId('name_modal')
                .setTitle('Change Channel Name')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('new_name')
                            .setLabel('Enter a new channel name')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                            .setMaxLength(100)
                    )
                );
            await interaction.showModal(modal);
        }

        // Modal for changing user limit
        async function showLimitChangeModal(interaction) {
            const modal = new ModalBuilder()
                .setCustomId('limit_modal')
                .setTitle('Change Channel User Limit')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('new_limit')
                            .setLabel('Enter a new user limit')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                            .setMaxLength(3)
                            .setPlaceholder('Enter a number')
                    )
                );
            await interaction.showModal(modal);
        }

        // Clean up empty channels
        setInterval(async () => {
            for (const [channelId, data] of createdVoiceChannels.entries()) {
                try {
                    // Attempt to fetch the channel
                    const channel = await client.channels.fetch(channelId);
                    
                    // Check if the channel has no members
                    if (channel.members.size === 0) {
                        // Delete the channel if it's empty
                        await channel.delete();
                        
                        // Clean up the map
                        createdVoiceChannels.delete(channelId);
                    }
                } catch (error) {
                    // Generic error handling
                    console.error(`Error handling channel ${channelId}:`, error);
                    
                    // Optionally, remove the invalid channel from the map
                    createdVoiceChannels.delete(channelId);
                }
            }
        }, 1000);  // Check every second
        
    }
};
