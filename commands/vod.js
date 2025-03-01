const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');  // Use EmbedBuilder instead of MessageEmbed
const pool = require('../db'); // Import the pool object from db.js

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vod')
    .setDescription('Gives a point for submitting a vod review.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user who submitted the vod review')
        .setRequired(true)
    ),

  async execute(interaction) {
    // Defer the reply to let Discord know we're processing
    await interaction.deferReply();

    const user = interaction.options.getUser('user');
    
    try {
      // Query the database using pool.query() method directly
      const [userData] = await pool.query('SELECT * FROM vodReview WHERE username = ?', [user.username]);

      if (userData.length === 0) {
        // If the user doesn't exist, create a new entry with 1 point
        await pool.query('INSERT INTO vodReview (username, points) VALUES (?, ?)', [user.username, 1]);
        // Set userData to an array with 1 point if user didn't exist before
        userData.push({ points: 1 });
      } else {
        // If the user exists, increment their points by 1
        await pool.query('UPDATE vodReview SET points = points + 1 WHERE username = ?', [user.username]);
      }

      // Create the embed message using EmbedBuilder
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('VOD Review Submitted!')
        .setDescription(`${user.username} has been given a point for submitting a vod review.`)
        .addFields({ name: 'New Total Points', value: `${userData[0].points}`, inline: true })
        .setTimestamp()
        .setFooter({ text: 'VOD Review System' });

      // Reply with the embed after processing
      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.editReply('There was an error processing your request.');
    }
  },
};
