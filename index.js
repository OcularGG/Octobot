//INDEX.JS UPDATED
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');
const fs = require('fs');
const path = require('path');
const roleSelector = require('./roleSelector'); // Path to roleSelector.js
const logRoleHierarchy = require('./logRoleHierarchy'); // Path to logRoleHierarchy.js
const autoReaction = require('./autoReaction'); // Path to autoReaction.js
const initializeWelcome = require('./welcomeSignUp'); //path to welcomeSignUp.js

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions,  // Add this line for reactions
  ],
});

client.commands = new Collection();

// Load commands dynamically from the "commands" folder
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
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
      { body: client.commands.map(command => command.data.toJSON()) },
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
  roleSelector(client);

  // Log the role hierarchy when the bot is ready
  //logRoleHierarchy(client);

  // Call the autoReaction function to add reactions to messages in specific channels
autoReaction(client);

//call the initializeWelcome function to send a welcome message to new members
initializeWelcome(client);
});



// Log in to Discord with the app's token
client.login(token);
