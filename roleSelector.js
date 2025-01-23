const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js'); // Updated imports


const channelId = '1297997704776912936'; 

module.exports = async (client) => {
  const guild = await client.guilds.fetch('1097537634756214957'); // Replace with your guild ID
  const channel = await guild.channels.fetch(channelId);

  const rolesList = [
    { name: 'OCL News', id: '1304110169604751362' },
    { name: 'OCL PvP', id: '1320486701184979014' },
    { name: 'OCL PvE', id: '1320483241911779338' },
    { name: 'OCLU News', id: '1304110177703825499' },
    { name: 'OCLU PvP', id: '1304110628625055795' },
    { name: 'OCLU PvE', id: '1320483411382767737' },
    { name: 'Scrimmage', id: '1320483318520877056' },
    { name: '2v2 HGs', id: '1320483320899043461' },
    { name: '5v5 HGs', id: '1304110180069412897' },
    { name: '10v10 HGs', id: '1304110182552305706' },
    { name: 'Crystal Arena/League', id: '1304110345757130802' },
    { name: 'Fame Farm', id: '1325908262402527262' },
    { name: 'Faction/Bandit', id: '1304111196034568284' },
    { name: 'Power Core/Vortex', id: '1329989946483671183' },
    { name: 'Ava Skip/Dungeon', id: '1320488019312115755' },
    { name: 'Outpost/Castle PvP', id: '1331726783665406004' },
    { name: 'Open World PvP', id: '1331726833510776953' },
    { name: 'Ratting ', id: '1331726930789269515' }
  ];


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
            description: `Select ${role.name}`,
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
      const previousRoles = member.roles.cache.filter(role => role.id !== guild.id)

      const rolesToAssign = interaction.values; 
      const selectedRoles = rolesToAssign.map(roleId => guild.roles.cache.get(roleId));

     
      const botMember = await guild.members.fetch(client.user.id); 
      if (!botMember) {
        console.error('Bot member is not available.');
        return; 
      }

      
      console.log(`Bot's highest role: ${botMember.roles.highest.name}`);
      console.log('Roles bot is trying to manage: ', selectedRoles.map(role => role.name).join(', '));

    
      selectedRoles.forEach(role => {
        if (botMember.roles.highest.comparePositionTo(role) < 0) {
          console.log(`Bot cannot assign the role ${role.name} because it is lower in the role hierarchy.`);
        }
      });

      const channelPermissions = channel.permissionsFor(botMember);
      console.log('Bot permissions in this channel:', channelPermissions.toArray().join(', '));

      const rolesToAdd = selectedRoles.filter(role => !previousRoles.has(role.id));

      const rolesToRemove = member.roles.cache
        .filter(role => !rolesToAssign.includes(role.id) && rolesList.some(r => r.id === role.id)); 

      let roleAddedNames = [];
      let roleRemovedNames = [];

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

      
      await interaction.followUp({
        content: `You have been assigned the roles: ${roleAddedNames.join(', ')}. You have removed the roles: ${roleRemovedNames.join(', ')}.`,
        ephemeral: true,
      });
    }
  });
};
