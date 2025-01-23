// logRoleHierarchy.js
module.exports = async (client) => {
    try {
      console.log('Attempting to fetch guild...');
  
      const guild = await client.guilds.fetch('1097537634756214957'); // Replace with your actual guild ID
      console.log(`Guild fetched: ${guild.name}`);
  
      // Fetch all roles and sort by position
      const roles = guild.roles.cache.sort((a, b) => b.position - a.position);
  
      console.log('Role Hierarchy:');
      roles.forEach(role => {
        console.log(`${role.name} (ID: ${role.id}): Position ${role.position}`);
      });
    } catch (error) {
      console.error('Error logging role hierarchy:', error);
    }
  };
  