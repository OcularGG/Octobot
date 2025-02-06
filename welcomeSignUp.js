//welcomeSignUp.js UPDATED
const {PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');


module.exports = (client) => {
  client.on('guildMemberAdd', async (member) => {
    const channelId = '1099496723086323712'; // Channel to send the welcome embed

    try {
      // Fetch the channel using the provided channel ID
      const ocularPublicChannel = await client.channels.fetch(channelId);

      if (ocularPublicChannel) {
        console.log('Found Ocular Public channel. Sending embed...');

        // Create the welcome embed
        const welcomeEmbed = new EmbedBuilder()
          .setColor('#00FF00') // Green color for the welcome message
          .setTitle('Welcome to Ocular!')
          .setDescription(`Welcome **${member.user.username}** to the OCULAR Community, a member of our __Welcome Committee__ will be by to say hello shortly!`)
          .setThumbnail(member.user.displayAvatarURL())
          .setTimestamp()
          .setImage('attachment://welcome.jpg');
          .setFooter({ text: 'Enjoy your stay!' });

        // Create the buttons
        const buttonRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('apply_ocular')
            .setLabel('Apply to OCULAR')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('apply_friend')
            .setLabel('Apply as a Friend')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('diplomatic_inquiry')
            .setLabel('Diplomatic Inquiry')
            .setStyle(ButtonStyle.Success)
        );

        // Send the welcome message with buttons
        await ocularPublicChannel.send({
          embeds: [welcomeEmbed],
          components: [buttonRow]
        });
      } else {
        console.error('Ocular Public channel not found!');
      }
    } catch (error) {
      console.error('Error fetching the channel or sending the welcome message:', error);
    }
  });

  // Handling button interactions
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return; 

    // Modal for Apply to OCULAR
    if (interaction.customId === 'apply_ocular') {
        const modal = new ModalBuilder()
          .setCustomId('modal_apply_ocular')
          .setTitle('OCULAR Application')
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
                .setCustomId('active_times')
                .setLabel('What times in-game are you most active?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('past_guilds')
                .setLabel('Provide the names of ALL past guilds.')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('content_type')
                .setLabel('Applying for Roads, BZ, or both?')  
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('vouch_member')
                .setLabel('Can a member of OCULAR vouch for you?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            )
          );
      
        await interaction.showModal(modal);
        return;
      }

    // Modal for Apply as a Friend
    if (interaction.customId === 'apply_friend') {
        const modal = new ModalBuilder()
          .setCustomId('modal_apply_friend')
          .setTitle('Friendship Application')
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
                .setCustomId('vouching_member')
                .setLabel('Who is vouching for you in OCL?') 
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            )
          );
      
        await interaction.showModal(modal);
        return;
      }

    // Modal for Diplomatic Inquiry
    if (interaction.customId === 'diplomatic_inquiry') {
        const modal = new ModalBuilder()
          .setCustomId('modal_diplomatic_inquiry')
          .setTitle('Diplomatic Inquiry')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('character_name')
                .setLabel('What is your character name?')  // Updated question
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('guild_alliance')
                .setLabel('What is your guild/alliance?')  // Updated question
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('authority_to_speak')
                .setLabel('Do you have authority to speak for them?')  // Updated question
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('discussion_subject')
                .setLabel('Briefly describe what you want to discuss.')  // Updated question
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            )
          );
      
        await interaction.showModal(modal);
        return;
      }
      
  });

  // Handling modal submissions (to process the submitted data)
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return; // Make sure it's a modal submission

    // Handle application submissions
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

if (interaction.customId === 'modal_apply_ocular') {
    // Get the answers from the modal
    const characterName = interaction.fields.getTextInputValue('character_name');
    const activeTimes = interaction.fields.getTextInputValue('active_times');
    const pastGuilds = interaction.fields.getTextInputValue('past_guilds');
    const contentType = interaction.fields.getTextInputValue('content_type');
    const vouchMember = interaction.fields.getTextInputValue('vouch_member');
  
    const username = interaction.user.username;
  
    try {
      const parentChannel = await interaction.guild.channels.fetch('1301595825469919273');
      const channel = await interaction.guild.channels.create({
        name: `OCL-${username}`,
        type: 0,
        parent: parentChannel.id,
        reason: 'OCL application channel',
      });
  
      // Store the applicant's ID in the channel's topic
      await channel.setTopic(`Applicant ID: ${interaction.user.id}`);
  
      const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('Ocular Application Submission')
        .addFields(
          { name: 'Character Name', value: characterName, inline: true },
          { name: 'Active Times', value: activeTimes, inline: true },
          { name: 'Past Guilds', value: pastGuilds, inline: true },
          { name: 'Roads or BZ?', value: contentType, inline: true },
          { name: 'Can a member vouch for you?', value: vouchMember, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Ocular Application' });
  
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('accept_ocl').setLabel('Accept OCL').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('accept_uni').setLabel('Accept Uni').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('decline').setLabel('Decline').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('deleteChannel2').setLabel('Delete Ticket').setStyle(ButtonStyle.Danger)
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
           //set nickname
      await interaction.member.setNickname(characterName)
      .then(() => {
        console.log(`Nickname set to ${characterName}`);
      })
      .catch((error) => {
        console.error('Error setting nickname:', error);
      });
  
      await interaction.reply({
        content: `Thank you for applying to Ocular! A custom channel has been created for your application: <#${channel.id}>`,
        ephemeral: true,
      });
  
    } catch (error) {
      console.error('Error creating the channel or sending the message:', error);
      await interaction.reply({
        content: 'There was an error processing your application. Please try again later.',
        ephemeral: true,
      });
    }
  }
  

  if (interaction.customId === 'modal_apply_friend') {
    // Get the answers from the modal
    const characterName = interaction.fields.getTextInputValue('character_name');
    const vouchingMember = interaction.fields.getTextInputValue('vouching_member');
    
    // Get the username of the person who submitted the modal
    const username = interaction.user.username;
    
    try {
      // Fetch the parent channel where the new channel should be created
      const parentChannel = await interaction.guild.channels.fetch('1301595825469919273'); // Channel ID to be the parent
      
      // Create a new channel with a unique name based on the user's username
      const channel = await interaction.guild.channels.create({
        name: `friend-${username}`,  // Channel name: #friend-<username>
        type: 0,  // 'text' channel type
        parent: parentChannel.id,  // Set the parent channel
        reason: 'Friend application channel',
      });
  
      // Set the topic after the channel has been created
      await channel.setTopic(`Applicant ID: ${interaction.user.id}`);
    
      // Create the embed to send to the new channel
      const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('Friendship Application Submission')
        .addFields(
          { name: 'Character Name', value: characterName, inline: true },
          { name: 'Vouching Member', value: vouchingMember, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Friendship Application' });
  
      // Create the "Vouched" and "Trusted" buttons
      const vouchedButton = new ButtonBuilder()
        .setCustomId('vouched')
        .setLabel('Vouched')
        .setStyle(ButtonStyle.Primary); // Blue button
    
      const trustedButton = new ButtonBuilder()
        .setCustomId('trusted')
        .setLabel('Trusted')
        .setStyle(ButtonStyle.Success); // Green button

      const deleteButton = new ButtonBuilder()
        .setCustomId('deleteChannel')
        .setLabel('Delete Ticket')
        .setStyle(ButtonStyle.Danger); // Red button
  
      // Add the buttons to the action row
      const actionRow = new ActionRowBuilder().addComponents(vouchedButton, trustedButton, deleteButton);
    
      // Send the embed and buttons to the newly created channel
      await channel.send({
        embeds: [embed],
        components: [actionRow],
      });
    
      // Ensure the applicant has access to the newly created channel
      const applicant = interaction.user;
    
      // Allow the applicant to view the channel and send messages
      await channel.permissionOverwrites.create(applicant.id, {
        ViewChannel: true,
        SendMessages: true,
      });

      //set nickname
await interaction.member.setNickname(characterName)
      .then(() => {
        console.log(`Nickname set to ${characterName}`);
      })
      .catch((error) => {
        console.error('Error setting nickname:', error);
      });

      // Reply to the user that their submission has been processed
      await interaction.reply({
        content: `Thank you for applying to be a friend! A custom channel has been created for your application: <#${channel.id}>`,
        ephemeral: true
      });
    
    } catch (error) {
      console.error('Error creating the channel or sending the message:', error);
      await interaction.reply({
        content: 'There was an error processing your application. Please try again later.',
        ephemeral: true
      });
    }
  }
  
      
      if (interaction.customId === 'modal_diplomatic_inquiry') {
        // Get the answers from the modal
        const characterName = interaction.fields.getTextInputValue('character_name');
        const guildAlliance = interaction.fields.getTextInputValue('guild_alliance');
        const authorityToSpeak = interaction.fields.getTextInputValue('authority_to_speak');
        const discussionSubject = interaction.fields.getTextInputValue('discussion_subject');
      
      
        // Get the username of the person who submitted the modal
        const username = interaction.user.username;
      
        try {
          // Fetch the parent channel where the new channel should be created
          const parentChannel = await interaction.guild.channels.fetch('1301595825469919273'); // Channel ID to be the parent
      
          // Create a new channel with a unique name based on the user's username
          const channel = await interaction.guild.channels.create({
            name: `diplo-${username}`,  // Channel name: #friend-<username>
            type: 0,  // 'text' channel type
            parent: parentChannel.id,  // Set the parent channel
            reason: 'Diplomatic application channel',
          });
      
          // Create the embed to send to the new channel
          const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('Diplomatic inquiry')
            .addFields(
              { name: 'Character Name:', value: characterName, inline: true },
              { name: 'Guild or Alliance:', value: guildAlliance, inline: true },
              { name: 'Authority to speak?:', value: authorityToSpeak, inline: true },
              { name: 'Subject:', value: discussionSubject, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Diplomatic Inquiry' });
      
          // Send the embed to the newly created channel
          await channel.send({ embeds: [embed] });
      
          // Ensure the applicant has access to the newly created channel
          const applicant = interaction.user;
      
          // Allow the applicant to view the channel and send messages
          await channel.permissionOverwrites.create(applicant.id, {
            ViewChannel: true,
            SendMessages: true,
          });

          //set nickname
      await interaction.member.setNickname(characterName)
      .then(() => {
        console.log(`Nickname set to ${characterName}`);
      })
      .catch((error) => {
        console.error('Error setting nickname:', error);
      });

          // Reply to the user that their submission has been processed
          await interaction.reply({
            content: `Thank you for your diplomatic inquiry! A custom channel has been created for your inquiry: <#${channel.id}>`,
            ephemeral: true
          });
      
        } catch (error) {
          console.error('Error creating the channel or sending the message:', error);
          await interaction.reply({
            content: 'There was an error processing your application. Please try again later.',
            ephemeral: true
          });
        }
      }
          });

          client.on('interactionCreate', async (interaction) => {
            if (!interaction.isButton()) return;
            //Friend APP button logic

            if (interaction.customId === 'deleteChannel') {
              // Check if the member has Administrator permission or a specific role
              const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.roles.cache.has('1336395122534776924');
              
              if (!hasPermission) {
                  // If the user doesn't have permission, send a message informing them
                  await interaction.reply({
                      content: 'You do not have permission to delete this channel.',
                      ephemeral: true, // Make this message visible only to the user
                  });
                  return; // Exit the function to prevent the channel from being deleted
              }
      
              // Get the channel where the interaction occurred
              const channel = interaction.channel;
      
              try {
                  // Delete the channel
                  await channel.delete();
                  console.log(`Channel ${channel.name} has been deleted.`);
              } catch (error) {
                  console.error(`Error deleting the channel: ${error.message}`);
              }
          }
            
            if (interaction.customId === 'deleteChannel2') {
              // Check if the member has Administrator permission or a specific role
              const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.roles.cache.has('1336395122534776924');
              
              if (!hasPermission) {
                  // If the user doesn't have permission, send a message informing them
                  await interaction.reply({
                      content: 'You do not have permission to delete this channel.',
                      ephemeral: true, // Make this message visible only to the user
                  });
                  return; // Exit the function to prevent the channel from being deleted
              }
      
              // Get the channel where the interaction occurred
              const channel = interaction.channel;
      
              try {
                  // Delete the channel
                  await channel.delete();
                  console.log(`Channel ${channel.name} has been deleted.`);
              } catch (error) {
                  console.error(`Error deleting the channel: ${error.message}`);
              }
          }

          if (interaction.customId === 'vouched') {
            // Check if the user has the required permission first
            const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.roles.cache.has('1336395122534776924');
            if (!hasPermission) {
                return interaction.reply({
                    content: 'You do not have permission to use this button.',
                    ephemeral: true,
                });
            }
        
            // Fetch the channel topic and extract the applicant ID
            const channel = interaction.channel;
            const topic = channel.topic;
            const applicantId = topic ? topic.split('Applicant ID: ')[1] : null;
          
            // Ensure that applicantId is present
            if (!applicantId) {
              return interaction.reply({
                content: 'Could not find the applicant ID in the channel topic.',
                ephemeral: true,
              });
            }
          
            // Fetch the applicant member from the guild
            let applicant;
            try {
              applicant = await interaction.guild.members.fetch(applicantId);
            } catch (error) {
              return interaction.reply({
                content: 'Could not find the applicant member in the guild.',
                ephemeral: true,
              });
            }
        
            if (applicant.nickname) {
              // Add "[F]" in front of the applicant's current nickname
              const newNickname = `[F] ${applicant.nickname}`;
        
              // Change the applicant's nickname
              try {
                  await applicant.setNickname(newNickname);
                  console.log(`Applicant's nickname changed to: ${newNickname}`);
              } catch (error) {
                  console.error('Error setting nickname:', error);
                  return interaction.reply({
                      content: 'There was an error setting the applicant\'s nickname.',
                      ephemeral: true,
                  });
              }
          } else {
              return interaction.reply({
                  content: 'Applicant does not have a nickname set, cannot modify it.',
                  ephemeral: true,
              });
          }
        
            try {
              // Fetch the role by ID
              const role = await interaction.guild.roles.cache.get('1336395198904799355');
          
              if (!role) {
                return interaction.reply({
                  content: 'The role could not be found.',
                  ephemeral: true,
                });
              }
          
              // Add the 'vouched' role to the applicant
              await applicant.roles.add(role);
          
              return interaction.reply({
                content: `The applicant has been successfully vouched and given the role: ${role.name}`,
                ephemeral: true,
              });
            } catch (error) {
              console.error('Error assigning role:', error);
              return interaction.reply({
                content: 'There was an error assigning the role to the applicant. Please try again later.',
                ephemeral: true,
              });
            }
        }
        
            if (interaction.customId === 'trusted') {
                // Fetch the applicant's member from the guild
                const channel = interaction.channel;
                const topic = channel.topic;
                const applicantId = topic ? topic.split('Applicant ID: ')[1] : null;
                const applicant = await interaction.guild.members.fetch(applicantId); // Ensure `applicantId` is properly defined or passed
                const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.roles.cache.has('1336395122534776924');
            
                if (!hasPermission) {
                    return interaction.reply({
                        content: 'You do not have permission to use this button.',
                        ephemeral: true,
                    });
                }
            if (applicant.nickname) {
                // Add "[TF]" in front of the applicant's current nickname
                const newNickname = `[TF] ${applicant.nickname}`;
        
                // Change the applicant's nickname
                try {
                    await applicant.setNickname(newNickname);
                    console.log(`Applicant's nickname changed to: ${newNickname}`);
                } catch (error) {
                    console.error('Error setting nickname:', error);
                    return interaction.reply({
                        content: 'There was an error setting the applicant\'s nickname.',
                        ephemeral: true,
                    });
                }
            } else {
                return interaction.reply({
                    content: 'Applicant does not have a nickname set, cannot modify it.',
                    ephemeral: true,
                });
            }
            
                try {
                    // Assign the 'trusted' role to the applicant
                    const role = await interaction.guild.roles.cache.get('1336395197730521133');
                    if (role) {
                        await applicant.roles.add(role);
                        return interaction.reply({
                            content: `The applicant has been successfully confirmed as trusted and given the role: ${role.name}`,
                            ephemeral: true,
                        });
                    } else {
                        return interaction.reply({
                            content: 'The role could not be found.',
                            ephemeral: true,
                        });
                    }
                } catch (error) {
                    console.error('Error assigning role:', error);
                    return interaction.reply({
                        content: 'There was an error assigning the role to the applicant. Please try again later.',
                        ephemeral: true,
                    });
                }
            }
            //Ocular APP button logic
            if (interaction.customId === 'accept_ocl') {
                const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.roles.cache.has('1336395122534776924');
                const channel = interaction.channel;
              const topic = channel.topic;
              const applicantId = topic ? topic.split('Applicant ID: ')[1] : null;

              if (!hasPermission) {
                return interaction.reply({
                  content: 'You do not have permission to use this button.',
                  ephemeral: true,
                });
              }
          
              if (!applicantId) {
                return interaction.reply({
                  content: 'Could not find applicant information.',
                  ephemeral: true,
                });
              }
          
              const applicant = await interaction.guild.members.fetch(applicantId);

              if (applicant.nickname) {
                // Add "[OCL]" in front of the applicant's current nickname
                const newNickname = `[OCL] ${applicant.nickname}`;
        
                // Change the applicant's nickname
                try {
                    await applicant.setNickname(newNickname);
                    console.log(`Applicant's nickname changed to: ${newNickname}`);
                } catch (error) {
                    console.error('Error setting nickname:', error);
                    return interaction.reply({
                        content: 'There was an error setting the applicant\'s nickname.',
                        ephemeral: true,
                    });
                }
            } else {
                return interaction.reply({
                    content: 'Applicant does not have a nickname set, cannot modify it.',
                    ephemeral: true,
                });
              }
              
          
              // Assign roles for 'accept_ocl'
              const oclRole = interaction.guild.roles.cache.get('1336395193980817458');
              const portalerRole = interaction.guild.roles.cache.get('1336395195775717481');
          
              if (oclRole && portalerRole) {
                await applicant.roles.add([oclRole, portalerRole]);
              } else {
                return interaction.reply({
                  content: 'Could not assign roles, please check the role IDs.',
                  ephemeral: true,
                });
              }
          
              await channel.send({
                content: `${applicant.user}, your application has been accepted to Ocular! Welcome to the guild!`,
              });
          
              await interaction.reply({
                content: 'The acceptance message has been sent, and roles have been assigned.',
                ephemeral: true,
              });
            }
          //Uni APP button logic
            if (interaction.customId === 'accept_uni') {
                const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.roles.cache.has('1336395122534776924');
                const channel = interaction.channel;
              const topic = channel.topic;
              const applicantId = topic ? topic.split('Applicant ID: ')[1] : null;

              if (!hasPermission) {
                return interaction.reply({
                  content: 'You do not have permission to use this button.',
                  ephemeral: true,
                });
              }
          
              if (!applicantId) {
                return interaction.reply({
                  content: 'Could not find applicant information.',
                  ephemeral: true,
                });
              }
          
              const applicant = await interaction.guild.members.fetch(applicantId);

              if (applicant.nickname) {
                // Add "[OCLU]" in front of the applicant's current nickname
                const newNickname = `[OCLU] ${applicant.nickname}`;
        
                // Change the applicant's nickname
                try {
                    await applicant.setNickname(newNickname);
                    console.log(`Applicant's nickname changed to: ${newNickname}`);
                } catch (error) {
                    console.error('Error setting nickname:', error);
                    return interaction.reply({
                        content: 'There was an error setting the applicant\'s nickname.',
                        ephemeral: true,
                    });
                }
            } else {
                return interaction.reply({
                    content: 'Applicant does not have a nickname set, cannot modify it.',
                    ephemeral: true,
                });
            }
              // Assign roles for 'accept_uni'
              const uniRole = interaction.guild.roles.cache.get('1336395194995834971');
              const portalerRole = interaction.guild.roles.cache.get('1336395195775717481');
          
              if (uniRole && portalerRole) {
                await applicant.roles.add([uniRole, portalerRole]);
              } else {
                return interaction.reply({
                  content: 'Could not assign roles, please check the role IDs.',
                  ephemeral: true,
                });
              }
          
              await channel.send({
                content: `${applicant.user}, your application has been accepted to Uni! Welcome to the guild!`,
              });
          
              await interaction.reply({
                content: 'The acceptance message has been sent, and roles have been assigned.',
                ephemeral: true,
              });
            }
          //Decline button logic
            if (interaction.customId === 'decline') {
                const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.roles.cache.has('1336395122534776924');

              if (!hasPermission) {
                return interaction.reply({
                  content: 'You do not have permission to use this button.',
                  ephemeral: true,
                });
              } 
              const modal = new ModalBuilder()
                .setCustomId('decline_reason_modal')
                .setTitle('Decline Reason')
                .addComponents(
                  new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                      .setCustomId('decline_reason_input')
                      .setLabel('Enter the reason for declining')
                      .setStyle(TextInputStyle.Paragraph)
                      .setRequired(true)
                  )
                );
          
              await interaction.showModal(modal);
            }
          });
          client.on('interactionCreate', async (interaction) => {
            
            if (!interaction.isModalSubmit()) return;

            if (interaction.customId === 'decline_reason_modal') {
                const reason = interaction.fields.getTextInputValue('decline_reason_input');
                const channel = interaction.channel;
                const topic = channel.topic;
                const applicantId = topic ? topic.split('Applicant ID: ')[1] : null;
              
                if (!applicantId) {
                  return interaction.reply({
                    content: 'Could not find applicant information.',
                    ephemeral: true,
                  });
                }
              
                const applicant = await interaction.guild.members.fetch(applicantId);
              
                await channel.send({
                  content: `${applicant.user}, your application has been declined. Reason: ${reason}`,
                });
              
                await interaction.reply({
                  content: 'The decline reason has been submitted.',
                  ephemeral: true,
                });
              }
          });
}
      
