const {PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = async (client) => {
  const transferChannel = '1342372182726279239'; // channel to send the transfer embed
  try {
    // Fetch the channel
    const ocularTransferChannel = await client.channels.fetch(transferChannel);
    if (!ocularTransferChannel) {
      console.error('Could not find the transfer channel.');
      return;
    }

    // Create the embed using EmbedBuilder
    const embed = new EmbedBuilder()
      .setTitle('Inner Guild Transfer')
      .setDescription('Click the button below to start the transfer process')
      .setColor('#0099FF'); // Set color to blue

    // Create the button using ButtonBuilder
    const button = new ButtonBuilder()
      .setCustomId('transfer') // This is the custom ID for the button
      .setLabel('Transfer')
      .setStyle('Primary'); // Set the button style to blue (PRIMARY)

    // Create a row for the button using ActionRowBuilder
    const row = new ActionRowBuilder().addComponents(button);

    // Send the embed with the button
    await ocularTransferChannel.send({
      embeds: [embed],
      components: [row],
    });

    console.log('Transfer embed and button sent successfully!');
  } catch (error) {
    console.error('Error fetching transfer channel or sending message:', error);
  }

    // Handle button interactions
    client.on('interactionCreate', async interaction => {
      if (!interaction.isButton()) return;
      if (interaction.customId === 'transfer') {
              const modal = new ModalBuilder()
                .setCustomId('transferModal')
                .setTitle('Transfer Application')
                .addComponents(
                  new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                      .setCustomId('character_name')
                      .setLabel('What is your character name?')
                      .setStyle(TextInputStyle.Short)
                      .setRequired(true)
                  ),
                  new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                      .setCustomId('transfer_to')
                      .setLabel('What guild are you transfering to?')
                      .setStyle(TextInputStyle.Paragraph)
                      .setRequired(true)
                  )
                );
            
              await interaction.showModal(modal);
              return;
            }
    });
    
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isModalSubmit()) return; // Make sure it's a modal submission
        const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
    if (interaction.customId === 'transferModal') {
      await interaction.deferReply({ flags: 64 });
    
      // Get the answers from the modal
      const characterName = interaction.fields.getTextInputValue('character_name');
      const transferTo = interaction.fields.getTextInputValue('transfer_to');
    
      const username = interaction.user.username;
    
      try {
        const parentChannel = await interaction.guild.channels.fetch('1342234666043838464');
        const channel = await interaction.guild.channels.create({
          name: `TRANSFER-${username}`,
          type: 0,
          parent: parentChannel.id,
          reason: 'OCL Transfer Channel',
        });
    
        // Store the applicant's ID in the channel's topic
        await channel.setTopic(`Applicant ID: ${interaction.user.id}`);
    
        const embed = new EmbedBuilder()
          .setColor('#0099FF')
          .setTitle('Ocular Application Submission')
          .addFields(
            { name: 'Character Name', value: characterName, inline: true },
            { name: 'Going to', value: transferTo, inline: true }
          )
          .setTimestamp()
          .setFooter({ text: 'Transfer Request' });
    
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('transfer_ocl').setLabel('Transfer OCL').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('transfer_uni').setLabel('Transfer Uni').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('decline3').setLabel('Decline').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId('deleteChannel3').setLabel('Delete Ticket').setStyle(ButtonStyle.Danger)
        );
    
        const message = await channel.send({
          embeds: [embed],
          components: [row],
        });
    
        const applicant = interaction.user;
        await channel.permissionOverwrites.create(applicant.id, {
          ViewChannel: true,
          SendMessages: true,
        });

        await interaction.editReply({
            content: `Thank you for applying to Ocular! A custom channel has been created for your application: <#${channel.id}>`,
          });

      } catch (error) {
        console.error('Error handling modal submission:', error);
      }
    }

    });
  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'transfer_ocl') {
      await interaction.deferReply({ ephemeral: true });
        const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.roles.cache.has('1336395122534776924');
            if (!hasPermission) {
                return interaction.editReply({
                    content: 'You do not have permission to use this button.',
                    flags: 64,
                });
            }
        
        const member = interaction.guild.members.cache.get(interaction.user.id);
    
        if (!member) {
            return interaction.editReply({ content: 'Member not found!', flags: 64 });
        }
    
        // Get the current nickname
        const currentNickname = member.nickname;
    
        // Check if the nickname starts with the prefix [OCLU]
        if (currentNickname.startsWith('[OCLU]')) {
            // Remove the [OCLU] prefix from the nickname
            let newNickname = currentNickname.replace(/^\[OCLU\] /, '[OCL] ');
    
            try {
                // Set the new nickname with the [OCL] prefix
                await member.setNickname(newNickname);
                await interaction.reply({ content: 'Successfully removed the [U] from your nickname!', ephemeral: true });
            } catch (error) {
                console.error('Error removing nickname prefix:', error);
                await interaction.reply({ content: 'There was an error updating your nickname.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'Your nickname does not have the [OCLU] prefix.', ephemeral: true });
        }
    }    
  });
};
