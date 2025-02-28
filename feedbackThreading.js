//feedbackThreading.js
const { Client, GatewayIntentBits } = require('discord.js');
module.exports = (client) => {
    const CHANNEL_ID = '1345088516475977738';
  
    client.on('messageCreate', async (message) => {
      if (message.channel.id === CHANNEL_ID) {
        try {
          if (!message.hasThread) {
            await message.startThread({
              name: `Suggestion from: ${message.author.username}`,
              reason: 'Auto-threading message',
            });
            console.log('Thread created for message:', message.content);
          }
        } catch (error) {
          console.error('Error creating thread:', error);
        }
      }
    });
  };
  