const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js'); // Updated imports

const channelId = '1297997704776912936'; 

module.exports = async (client) => {
  const guild = await client.guilds.fetch('1097537634756214957'); // Replace with your guild ID
  const channel = await guild.channels.fetch(channelId);

  const rolesList = [
    { name: 'Important ', id: '1336458718916776100' },
    { name: 'BZ PvP', id: '1336458731604541541' },
    { name: 'Roads/Small Scale PvP', id: '1336458726181310557' },
    { name: 'UNI PvP', id: '1304110177703825499' },
    { name: 'Roads PvE', id: '1336460629531430995' },
    { name: 'BZ PvE', id: '1336460685881774314' },
    { name: 'UNI PvE', id: '1336458729930883125' },
    { name: 'Ava Skip', id: '1336458732661506059' },
    { name: 'Ava Dungeon', id: '1336459316559085578' },
    { name: 'BZ Power Core/Vortex', id: '1336458727712100382' },
    { name: 'Roads Power Core', id: '1336458729138163712' },
    { name: 'Blue-Yellow HO Route', id: '1336458728320270376 ' }, // Extra space here
    { name: '2v2 HGs', id: '1336459317234237460' },
    { name: '5v5 HGs', id: '1336459318173892709' },
    { name: '10v10 HGs', id: '1336459318425554999' },
    { name: 'Crystal Arena/League', id: '1336459481097437184' },
    { name: 'Fame Farm', id: '1336459483106508862' },
    { name: 'Faction/Bandit', id: '1336459483605372949' },
    { name: 'Castle/OPs', id: '1336459548596240438' },
    { name: 'Ratting', id: '1336459549250424863' },
    { name: 'Scrimmage', id: '1336459549682700402' },
    { name: 'Community Event', id: '1336459738619183165' }
  ];

  // Trim the role IDs to remove any spaces
  rolesList.forEach(role => {
    role.id = role.id.trim();
  });

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Role Selection')
    .setDescription('Select the roles you would like to be pinged for from the choices below.');

  const row = new ActionRowBuilder()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('role_select')
        .setPlaceholder('Select your roles')
        .setMinValues(1) 
        .setMaxValues(rolesList.length) 
        .addOptions(
          rolesList.map(role => ({
            label: role.name,
            value: role.id,
            description: `Select this role to get pings for ${role.name}`,
          }))
        ),
    );

  await channel.send({
    embeds: [embed],
    components: [row],
  });

  const filter = (interaction) => interaction.customId === 'role_select' && interaction.isStringSelectMenu();

  client.on('interactionCreate', async (interaction) => {
    if (filter(interaction)) {
      await interaction.deferUpdate();

      const member = await guild.members.fetch(interaction.user.id);
      const previousRoles = member.roles.cache.filter(role => role.id !== guild.id);

      const rolesToAssign = interaction.values; 
      
      // Fetch selected roles and filter out any undefined roles
      const selectedRoles = rolesToAssign
        .map(roleId => guild.roles.cache.get(roleId))
        .filter(role => role !== undefined); // Ensure there are no undefined roles

      console.log('Roles bot is trying to manage: ', selectedRoles.map(role => role?.name).join(', ')); // Safe access with optional chaining

      const botMember = await guild.members.fetch(client.user.id);
      if (!botMember) {
        console.error('Bot member is not available.');
        return;
      }

      console.log(`Bot's highest role: ${botMember.roles.highest.name}`);

      selectedRoles.forEach(role => {
        if (botMember.roles.highest.comparePositionTo(role) < 0) {
          console.log(`Bot cannot assign the role ${role.name} because it is lower in the role hierarchy.`);
        }
      });

      const channelPermissions = channel.permissionsFor(botMember);
      console.log('Bot permissions in this channel:', channelPermissions.toArray().join(', '));

      // Filter roles to add (only those that are not already assigned)
      const rolesToAdd = selectedRoles.filter(role => !previousRoles.has(role.id));

      // Filter roles to remove (those that the user no longer wants)
      const rolesToRemove = member.roles.cache
        .filter(role => !rolesToAssign.includes(role.id) && rolesList.some(r => r.id === role.id));

      let roleAddedNames = [];
      let roleRemovedNames = [];

      // Add roles
      if (rolesToAdd.length > 0) {
        try {
          await member.roles.add(rolesToAdd);
          roleAddedNames = rolesToAdd.map(role => role.name);
        } catch (error) {
          console.error(`Error adding roles: ${error.message}`);
        }
      } else {
        console.log('No roles to add');
      }

      // Remove roles
      if (rolesToRemove.size > 0) {
        try {
          await member.roles.remove(rolesToRemove);
          roleRemovedNames = rolesToRemove.map(role => role.name);
        } catch (error) {
          console.error(`Error removing roles: ${error.message}`);
        }
      } else {
        console.log('No roles to remove');
      }

      console.log(`Added roles: ${roleAddedNames.join(', ')}`);
      console.log(`Removed roles: ${roleRemovedNames.join(', ')}`);

      // Inform the user about the roles that were added and removed
      await interaction.followUp({
        content: `You have been assigned the roles: ${roleAddedNames.join(', ')}. You have removed the roles: ${roleRemovedNames.join(', ')}.`,
        ephemeral: true,
      });
    }
  });
};
