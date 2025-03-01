const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const pool = require('../db'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vodleaderboard')
    .setDescription('Shows the top 10 users with the most points for VOD reviews.'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const [topUsers] = await pool.query('SELECT username, points FROM vodReview ORDER BY points DESC LIMIT 10');

      if (topUsers.length === 0) {
        return await interaction.editReply('No users have points in the VOD review leaderboard.');
      }

      const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('VOD Review Leaderboard')
        .setDescription('Top 10 users with the most points for submitting VOD reviews.')
        .setTimestamp()
        .setFooter({ text: 'VOD Review Leaderboard' });

      topUsers.forEach((user, index) => {
        embed.addFields({ 
          name: `${index + 1}. ${user.username}`, 
          value: `${user.points} points`, 
          inline: true 
        });
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.editReply('There was an error fetching the leaderboard.');
    }
  },
};
