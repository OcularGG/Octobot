// feedbackThreading and AutoReaction
const { Client, GatewayIntentBits,EmbedBuilder } = require('discord.js');

module.exports = (client) => {

  const channelReactions = {
    '1100847035013419114': '<:Ocular:1324391933635727380>',
    '1279139853854052475': '<:salt:1292156003659419648>',
    '1317640150662123570': '<:upvote:1284182666853355562>',
  };

  const OcularGeneralID = '1097537635205009560'; // Channel to send the embed

  const CHANNEL_ID = '1345088516475977738';

  const REACTION_THRESHOLD = 25; // Set the number of reactions required to trigger the embed

  client.on('messageCreate', async (message) => {

    if (channelReactions[message.channel.id]) {
      if (message.author.bot) return;
      if (message.reference) return;
      // React to the message with the emoji defined in the map
      const reactionEmoji = channelReactions[message.channel.id];
      await message.react(reactionEmoji);
    }
    
    if (message.content.includes('@everyone') || message.content.includes('@here')) {
      if (message.author.id === '1207434980855259206') return;
      if (message.channel.id === '1105324018447433748') return;
      await message.delete();
      console.log('Deleted a message mentioning @everyone or @here:', message.content);
    }

    if (message.channel.id === CHANNEL_ID) {
      try {
        if (message.reference) {
          await message.delete();
          console.log('Deleted a reply message:', message.content);
        }
        else {
          if (!message.hasThread) {
            await message.startThread({
              name: `Suggestion from: ${message.author.username}`,
              reason: 'Auto-threading message',
            });
            console.log('Thread created for message:', message.content);
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    }
  });

  client.on('messageReactionAdd', async (reaction, user) => {
    // Ignore reactions from bots
    if (user.bot) return;

    // Log when a reaction is detected
    console.log(`Reaction detected in channel: ${reaction.message.channel.id}, by user: ${user.tag}`);

    // Check if the reaction is on a message from a channel we care about
    if (reaction.message.channel.id in channelReactions) {
      // Ensure the reaction is fully fetched
      await reaction.message.fetch();

      // Get the total number of reactions on the message
      let totalReactions = 0;
      reaction.message.reactions.cache.forEach((r) => {
        totalReactions += r.count; // Count all reactions (regardless of emoji)
      });

      // Log the current total number of reactions
      console.log(`Total number of reactions on the message: ${totalReactions}`);

      // If the total number of reactions exceeds the threshold, send the embed
      if (totalReactions >= REACTION_THRESHOLD) {
        let targetChannelName;
        if (reaction.message.channel.id === '1279139853854052475') {
          targetChannelName = 'Hall of Salt';
        } else if (reaction.message.channel.id === '1100847035013419114') {
          targetChannelName = 'Humble Brag';
        }

        // Create an embed with the message link and channel info
        const embed = new EmbedBuilder()
          .setColor('#FF4500') // Customize embed color
          .setTitle('This post just hit 25 reactions!')
          .setDescription(`go check out this new awesome **${targetChannelName}** post.`)
          .addFields({ name: 'Link to the Post:', value: `[Click here to view the post](${reaction.message.url})` })
          .setTimestamp()
          .setFooter({ text: 'Feed me more reactions' });

        // Fetch the target channel to post the embed in
        const ocularGeneralChannel = await client.channels.fetch(OcularGeneralID);

        if (ocularGeneralChannel) {
          console.log('Found Ocular General channel. Sending embed...');
          await ocularGeneralChannel.send({ embeds: [embed] });
        } else {
          console.error('Ocular General channel not found!');
        }
      }
  }
});
};
