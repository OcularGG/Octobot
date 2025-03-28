//welcomeSignUp.js UPDATED
const {PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');

module.exports = (client) => {
  
  // Your existing event listener
client.on('guildMemberAdd', async (member) => {
  const channelId = '1099496723086323712'; // Channel to send the welcome embed

  try {
    const ocularPublicChannel = await client.channels.fetch(channelId);

    if (ocularPublicChannel) {
      console.log('Found Ocular Public channel. Sending embed...');

      const welcomeImagePath = path.join(__dirname, 'assets', 'welcome.png');
      const pfpUrl = member.user.displayAvatarURL({ format: 'png', size: 256 }); 

      const welcomeImage = await loadImage(welcomeImagePath);

      console.log('Profile Picture URL:', pfpUrl);

    
      try {
        const response = await axios.head(pfpUrl); 
        const contentType = response.headers['content-type'];
        console.log('Profile Picture Content-Type:', contentType); 

        if (!contentType.startsWith('image/')) {
          console.error('The profile picture is not an image or is an unsupported type!');
          return;
        }
      } catch (error) {
        console.error('Error fetching profile picture headers:', error);
        return;
      }

      let pfpImageBuffer;
      try {
        const pfpResponse = await axios.get(pfpUrl, { responseType: 'arraybuffer' });
        pfpImageBuffer = await sharp(pfpResponse.data).png().toBuffer(); 
      } catch (error) {
        console.error('Error converting profile picture:', error);
        return;
      }

   
      let pfpImage;
      try {
        pfpImage = await loadImage(pfpImageBuffer); 
      } catch (error) {
        console.error('Error loading profile picture into canvas:', error);
        return; 
      }


      const canvas = createCanvas(welcomeImage.width, welcomeImage.height);
      const ctx = canvas.getContext('2d');

      const pfpX = 689.5;
      const pfpY = 22;
      const pfpWidth = 256;
      const pfpHeight = 256;
      ctx.drawImage(pfpImage, pfpX, pfpY, pfpWidth, pfpHeight); 

      ctx.drawImage(welcomeImage, 0, 0);

      const outputPath = path.join(__dirname, `outputWelcomeImage_${member.id}.png`);

      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on('finish', async () => {
        const welcomeEmbed = new EmbedBuilder()
          .setColor('#00FF00') 
          .setTitle('Welcome to Ocular!')
          .setDescription(`Welcome **${member.user.username}** to the OCULAR Community, a member of our **__Welcome Committee__** will be by to say hello shortly!`)
          .setTimestamp()
          .setImage(`attachment://welcomeImage_${member.id}.png`) 
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

        // Send the welcome message with buttons and the generated image
        await ocularPublicChannel.send({
          embeds: [welcomeEmbed],
          components: [buttonRow],
          files: [{ attachment: outputPath, name: `welcomeImage_${member.id}.png` }] // Attach the generated image
        });

        // Optionally, delete the image file after sending it (cleanup)
        fs.unlinkSync(outputPath); // Remove the temporary image after sending
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

    if (interaction.customId === 'deleteChannel') {
      await interaction.deferReply({ flags: 64 });
// Check if the member has Administrator permission or a specific role
const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.roles.cache.has('1336395122534776924');

if (!hasPermission) {
    // If the user doesn't have permission, send a message informing them
    await interaction.editReply({
        content: 'You do not have permission to delete this channel.',
        flags: 64, // Make this message visible only to the user
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
await interaction.deferReply({ flags: 64 });
// Check if the member has Administrator permission or a specific role
const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.roles.cache.has('1336395122534776924');

if (!hasPermission) {
    // If the user doesn't have permission, send a message informing them
    await interaction.editReply({
        content: 'You do not have permission to delete this channel.',
        flags: 64, // Make this message visible only to the user
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
await interaction.deferReply({ flags: 64 });
// Check if the user has the required permission first
const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.roles.cache.has('1336395122534776924');
if (!hasPermission) {
  return interaction.editReply({
      content: 'You do not have permission to use this button.',
      flags: 64,
  });
}

// Fetch the channel topic and extract the applicant ID
const channel = interaction.channel;
const topic = channel.topic;
const applicantId = topic ? topic.split('Applicant ID: ')[1] : null;

// Ensure that applicantId is present
if (!applicantId) {
return interaction.editReply({
  content: 'Could not find the applicant ID in the channel topic.',
  flags: 64,
});
}

// Fetch the applicant member from the guild
let applicant = null;
  try {
    applicant = await interaction.guild.members.fetch(applicantId);
    console.log(`Applicant fetched: ${applicant}`);
  } catch (error) {
    console.error('Error fetching applicant:', error);
  }

  if (!applicant) {
    return interaction.editReply({
      content: 'Applicant not found in the guild.',
      flags: 64,
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
    return interaction.editReply({
        content: 'There was an error setting the applicant\'s nickname.',
        flags: 64,
    });
}
} else {
return interaction.editReply({
    content: 'Applicant does not have a nickname set, cannot modify it.',
    flags: 64,
});
}

try {
// Fetch the role by ID
const role = await interaction.guild.roles.cache.get('1336395198904799355');

if (!role) {
  return interaction.editReply({
    content: 'The role could not be found.',
    flags: 64,
  });
}

// Add the 'vouched' role to the applicant
await applicant.roles.add(role);

return interaction.editReply({
  content: `The applicant has been successfully vouched and given the role: ${role.name}`,
  flags: 64,
});
} catch (error) {
console.error('Error assigning role:', error);
return interaction.editReply({
  content: 'There was an error assigning the role to the applicant. Please try again later.',
  flags: 64,
});
}
}

if (interaction.customId === 'trusted') {
  await interaction.deferReply({ flags: 64 });
  // Fetch the applicant's member from the guild
  const channel = interaction.channel;
  const topic = channel.topic;
  const applicantId = topic ? topic.split('Applicant ID: ')[1] : null;
  const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.roles.cache.has('1336395122534776924');

  if (!hasPermission) {
      return interaction.editReply({
          content: 'You do not have permission to use this button.',
          flags: 64,
      });
  }

  let applicant = null;
  try {
    applicant = await interaction.guild.members.fetch(applicantId);
    console.log(`Applicant fetched: ${applicant}`);
  } catch (error) {
    console.error('Error fetching applicant:', error);
  }

  if (!applicant) {
    return interaction.editReply({
      content: 'Applicant not found in the guild.',
      flags: 64,
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
      return interaction.editReply({
          content: 'There was an error setting the applicant\'s nickname.',
          flags: 64,
      });
  }
} else {
  return interaction.editReply({
      content: 'Applicant does not have a nickname set, cannot modify it.',
      flags: 64,
  });
}

  try {
      // Assign the 'trusted' role to the applicant
      const role = await interaction.guild.roles.cache.get('1336395197730521133');
      if (role) {
          await applicant.roles.add(role);
          return interaction.editReply({
              content: `The applicant has been successfully confirmed as trusted and given the role: ${role.name}`,
              flags: 64,
          });
      } else {
          return interaction.editReply({
              content: 'The role could not be found.',
              flags: 64,
          });
      }
  } catch (error) {
      console.error('Error assigning role:', error);
      return interaction.editReply({
          content: 'There was an error assigning the role to the applicant. Please try again later.',
          flags: 64,
      });
  }
}
//Ocular APP logic
if (interaction.customId === 'accept_ocl') {
  await interaction.deferReply({ flags: 64 });
  const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.roles.cache.has('1336395122534776924');
  const channel = interaction.channel;
  const topic = channel.topic;
  const applicantId = topic ? topic.split('Applicant ID: ')[1] : null;

  if (!hasPermission) {
    return interaction.editReply({
      content: 'You do not have permission to use this button.',
      flags: 64,
    });
  }

  if (!applicantId) {
    return interaction.editReply({
      content: 'Could not find applicant information.',
      flags: 64,
    });
  }

  // Fetch applicant and handle errors
  let applicant = null;
  try {
    applicant = await interaction.guild.members.fetch(applicantId);
    console.log(`Applicant fetched: ${applicant}`);  // This will log the applicant object if successful
  } catch (error) {
    console.error('Error fetching applicant:', error); // Logs the error if fetching fails
  }

  // Log the value of applicant (whether it's null or an object)
  console.log(`Applicant variable is:`, applicant);

  if (!applicant) {
    return interaction.editReply({
      content: 'Applicant not found in the guild.',
      flags: 64,
    });
  }
  
    console.log(`applicant variable is "${applicant}"`)
  // Check if the applicant exists after fetch
  if (!applicant) {
    return; // Exit early if applicant is not defined
  }

  try {
    // Send DM to the applicant
    await applicant.send("🎉 **Congratulations and Welcome to the OCULAR Family!** 🎉\n\nWe're thrilled to have you with us! To help you get started and familiarize yourself with everything Ocular, please take a moment to review our onboarding file. It will guide you through the ways of Ocular and ensure you're all set for success. https://bit.ly/43jUoYy");
    console.log(`DM sent to ${applicant.user.tag}`);
  } catch (error) {
    console.error('Error sending DM:', error);
  }

  if (applicant.nickname) {
    // Add "[OCL]" in front of the applicant's current nickname
    const newNickname = `[OCL] ${applicant.nickname}`;

    try {
      // Change the applicant's nickname
      await applicant.setNickname(newNickname);
      console.log(`Applicant's nickname changed to: ${newNickname}`);
    } catch (error) {
      console.error('Error setting nickname:', error);
      return interaction.editReply({
        content: 'There was an error setting the applicant\'s nickname.',
        flags: 64,
      });
    }
  } else {
    return interaction.editReply({
      content: 'Applicant does not have a nickname set, cannot modify it.',
      flags: 64,
    });
  }

  // Assign roles for 'accept_ocl'
  const oclRole = interaction.guild.roles.cache.get('1336395193980817458');
  const portalerRole = interaction.guild.roles.cache.get('1336395195775717481');

  if (oclRole && portalerRole) {
    await applicant.roles.add([oclRole, portalerRole]);
  } else {
    return interaction.editReply({
      content: 'Could not assign roles, please check the role IDs.',
      flags: 64,
    });
  }

  // Send a message to the channel
  await channel.send({
    content: `${applicant.user}, your application has been accepted to Ocular! Welcome to the guild!`,
  });

  // Final reply
  await interaction.editReply({
    content: 'The acceptance message has been sent, and roles have been assigned.',
    flags: 64,
  });
}

//Uni APP logic
if (interaction.customId === 'accept_uni') {
      await interaction.deferReply({ flags: 64 });
  const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.roles.cache.has('1336395122534776924');
  const channel = interaction.channel;
const topic = channel.topic;
const applicantId = topic ? topic.split('Applicant ID: ')[1] : null;

if (!hasPermission) {
  return interaction.editReply({
    content: 'You do not have permission to use this button.',
    flags: 64,
  });
}

if (!applicantId) {
  return interaction.editReply({
    content: 'Could not find applicant information.',
    flags: 64,
  });
}

let applicant = null;
  try {
    applicant = await interaction.guild.members.fetch(applicantId);
    console.log(`Applicant fetched: ${applicant}`);
  } catch (error) {
    console.error('Error fetching applicant:', error);
  }

  if (!applicant) {
    return interaction.editReply({
      content: 'Applicant not found in the guild.',
      flags: 64,
    });
  }

try {
  await applicant.send("🎉 **Congratulations and Welcome to the Ocular Family!** 🎉\n\n Were thrilled to have you with us! To help you get started and familiarize yourself with everything Ocular, please take a moment to review our onboarding file. It will guide you through the ways of Ocular and ensure youre all set for success. https://bit.ly/43jUoYy");
  console.log(`DM sent to ${applicant.user.tag}`);
} catch (error) {
  console.error('Error sending DM:', error);
}

if (applicant.nickname) {
  // Add "[OCLU]" in front of the applicant's current nickname
  const newNickname = `[OCLU] ${applicant.nickname}`;

  // Change the applicant's nickname
  try {
      await applicant.setNickname(newNickname);
      console.log(`Applicant's nickname changed to: ${newNickname}`);
  } catch (error) {
      console.error('Error setting nickname:', error);
      return interaction.editReply({
          content: 'There was an error setting the applicant\'s nickname.',
          flags: 64,
      });
  }
} else {
  return interaction.editReply({
      content: 'Applicant does not have a nickname set, cannot modify it.',
      flags: 64,
  });
}
// Assign roles for 'accept_uni'
const uniRole = interaction.guild.roles.cache.get('1336395194995834971');
const portalerRole = interaction.guild.roles.cache.get('1336395195775717481');

if (uniRole && portalerRole) {
  await applicant.roles.add([uniRole, portalerRole]);
} else {
  return interaction.editReply({
    content: 'Could not assign roles, please check the role IDs.',
    flags: 64,
  });
}

await channel.send({
  content: `${applicant.user}, your application has been accepted to Uni! Welcome to the guild!`,
});

await interaction.editReply({
  content: 'The acceptance message has been sent, and roles have been assigned.',
  flags: 64,
});
}
//Decline button logic
if (interaction.customId === 'decline') {
  const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || interaction.member.roles.cache.has('1336395122534776924');

if (!hasPermission) {
  return interaction.Reply({
    content: 'You do not have permission to use this button.',
    flags: 64,
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

if (interaction.customId === 'decline_reason_modal') {
  await interaction.deferReply({ flags: 64 });
const reason = interaction.fields.getTextInputValue('decline_reason_input');
const channel = interaction.channel;
const topic = channel.topic;
const applicantId = topic ? topic.split('Applicant ID: ')[1] : null;

if (!applicantId) {
return interaction.editReply({
  content: 'Could not find applicant information.',
  flags: 64,
});
}

const applicant = await interaction.guild.members.fetch(applicantId);

await channel.send({
content: `${applicant.user}, your application has been declined. Reason: ${reason}`,
});

await interaction.editReply({
content: 'The decline reason has been submitted.',
flags: 64,
});
}

if (interaction.customId === 'modal_apply_ocular') {
  // Defer the reply to prevent timeout
  await interaction.deferReply({ flags: 64 });

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

    // Set nickname
    await interaction.member.setNickname(characterName)
      .then(() => {
        console.log(`Nickname set to ${characterName}`);
      })
      .catch((error) => {
        console.error('Error setting nickname:', error);
      });

    // Reply after all actions are completed
    await interaction.editReply({
      content: `Thank you for applying to Ocular! A custom channel has been created for your application: <#${channel.id}>`,
    });

  } catch (error) {
    console.error('Error creating the channel or sending the message:', error);
    await interaction.editReply({
      content: 'There was an error processing your application. Please try again later.',
    });
  }
}

  

if (interaction.customId === 'modal_apply_friend') {
  // Defer the reply to prevent timeout
  await interaction.deferReply({ flags: 64 });

  // Get the answers from the modal
  const characterName = interaction.fields.getTextInputValue('character_name');
  const vouchingMember = interaction.fields.getTextInputValue('vouching_member');

  // Get the username of the person who submitted the modal
  const username = interaction.user.username;

  try {
    // Fetch the parent channel where the new channel should be created
    const parentChannel = await interaction.guild.channels.fetch('1336428801994915870'); // Channel ID to be the parent

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

    // Set the nickname for the applicant
    await interaction.member.setNickname(characterName)
      .then(() => {
        console.log(`Nickname set to ${characterName}`);
      })
      .catch((error) => {
        console.error('Error setting nickname:', error);
      });

    // Reply after all actions are completed
    await interaction.editReply({
      content: `Thank you for applying to be a friend! A custom channel has been created for your application: <#${channel.id}>`,
    });

  } catch (error) {
    console.error('Error creating the channel or sending the message:', error);
    await interaction.editReply({
      content: 'There was an error processing your application. Please try again later.',
    });
  }
}

      
     if (interaction.customId === 'modal_diplomatic_inquiry') {
  // Defer the reply to prevent timeout
  await interaction.deferReply({ flags: 64 });

  // Get the answers from the modal
  const characterName = interaction.fields.getTextInputValue('character_name');
  const guildAlliance = interaction.fields.getTextInputValue('guild_alliance');
  const authorityToSpeak = interaction.fields.getTextInputValue('authority_to_speak');
  const discussionSubject = interaction.fields.getTextInputValue('discussion_subject');

  // Get the username of the person who submitted the modal
  const username = interaction.user.username;

  try {
    // Fetch the parent channel where the new channel should be created
    const parentChannel = await interaction.guild.channels.fetch('1336428874191474769'); // Channel ID to be the parent

    // Create a new channel with a unique name based on the user's username
    const channel = await interaction.guild.channels.create({
      name: `diplo-${username}`,  // Channel name: #diplo-<username>
      type: 0,  // 'text' channel type
      parent: parentChannel.id,  // Set the parent channel
      reason: 'Diplomatic application channel',
    });

    // Create the embed to send to the new channel
    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('Diplomatic Inquiry')
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

    // Set the nickname for the applicant
    await interaction.member.setNickname(characterName)
      .then(() => {
        console.log(`Nickname set to ${characterName}`);
      })
      .catch((error) => {
        console.error('Error setting nickname:', error);
      });

    // Reply after all actions are completed
    await interaction.editReply({
      content: `Thank you for your diplomatic inquiry! A custom channel has been created for your inquiry: <#${channel.id}>`,
    });

  } catch (error) {
    console.error('Error creating the channel or sending the message:', error);
    await interaction.editReply({
      content: 'There was an error processing your application. Please try again later.',
    });
  }
}

          });

}
      
