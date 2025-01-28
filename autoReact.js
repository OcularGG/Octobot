// autoReaction.js

module.exports = (client) => {
    // Define a lookup table mapping channel IDs to reaction emojis
    const channelReactions = {
      'CHANNEL_ID_1': '👍',  // Replace with actual channel ID and your chosen emoji
      'CHANNEL_ID_2': '🎉',  // ...
      'CHANNEL_ID_3': '🔥',
      // Add as many channel-to-emoji mappings as you need
    };
  
    // Listen for new messages
    client.on('messageCreate', async (message) => {
      try {
        // 1. Ignore messages from bots (including this bot)
        if (message.author.bot) return;
  
        // 2. Check if the message is in one of the channels defined in our lookup
        if (!channelReactions.hasOwnProperty(message.channel.id)) return;
  
        // 3. If the message is a reply to another message, skip it
        if (message.reference) return;
  
        // 4. Retrieve the emoji based on the channel ID
        const reactionEmoji = channelReactions[message.channel.id];
  
        // 5. React to the message
        await message.react(reactionEmoji);
  
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
    });
  };