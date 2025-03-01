const { Client, GatewayIntentBits } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');
const fs = require('fs');
const path = require('path');
const roleSelector = require('./roleSelector'); // Path to roleSelector.js
const logRoleHierarchy = require('./logRoleHierarchy'); // Path to logRoleHierarchy.js
const autoReaction = require('./autoReaction'); // Path to autoReaction.js
const initializeWelcome = require('./welcomeSignUp'); //path to welcomeSignUp.js
const voiceChannel = require('./voiceChannel'); //path to voiceChannel.js
const transferLogic = require('./transferLogic'); //path to transferLogic.js
const feedbackThreading = require('./feedbackThreading'); // Path to feedbackThreading.js

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
  ],
});

// Commands array to hold the loaded commands
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Load each command into the commands array
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  commands.push(command);  // Store command in the array instead of client.commands
}

// Command registration
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Register commands for a specific guild
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands.map(command => command.data.toJSON()) }, // Register all commands from the commands array
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();

// Initialize roleSelector and logRoleHierarchy when the bot is ready
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Call the roleSelector function to send the role selection embed
  //roleSelector(client);

  // Log the role hierarchy when the bot is ready
  //logRoleHierarchy(client);

  // Call the autoReaction function to add reactions to messages in specific channels
  autoReaction(client);

  // Call the feedbackThreading function to create threads for messages in a specific channel
  feedbackThreading(client);

  // Call the initializeWelcome function to send a welcome message to new members
  initializeWelcome(client);

  // Call the transferLogic function to send a transfer embed
  transferLogic(client);

  // Call the voiceChannel function to create a voice channel
  voiceChannel.startVoiceChannel(client);
});

// Handle interaction events (like slash commands)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  // Find the command in the commands array
  const command = commands.find(cmd => cmd.data.name === interaction.commandName);
  if (!command) return;

  try {
    // Execute the command
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    // Send an error message if the command execution fails
    await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

// Log in to Discord with the app's token
client.login(token);
