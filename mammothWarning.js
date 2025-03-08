const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = (client) => {
    const targetHour = 10; 
    const targetMinute = 30;
    const OcularGeneralID = '1097537635205009560'; 

    function createMammothEmbed() {
        const imageAttachment = new AttachmentBuilder(path.join(__dirname, 'assets', 'mammoth.png'));

        const embed = new EmbedBuilder()
            .setColor('#d88834')
            .setThumbnail('attachment://mammoth.png') // This references the attached file
            .setTitle('🤠 __**WANTED: LOW-DOWN, NO-GOOD SCAMMERS**__ 🐘')
            .setDescription(
                `Now lemme be clear as a desert sky at high noon: **__Litefootz ain’t never gonna whisper you askin’ for your mammoth, your silver, or any other shiny trinkets.__** Same goes for Darkfootz and the rest of OCULAR’s officers. If some smooth talker claims to be one of us and starts askin’ for handouts, do yourself a favor—__**check with us on Discord first**__, preferably in voice comms. I’m always ‘round, so it won’t take long.

                **RULE O’ THE WILD WEST (AND ALBION):**
                🔸 If it smells fishier than a swamp in July, it’s probably a scam.
                🔸 Ain’t no legitimate OCULAR member gonna beg, borrow, or steal from ya.
                🔸 When in doubt, check it out—before you find yourself down a mammoth and up a creek.
                
                Stay sharp, stay safe, and don’t let no rustler make off with your hard-earned goods. These lands belong to OCULAR—let’s keep ‘em that way. 🤠
                
                If you need to message the real Litefootz, just click on his name here: **@thelitefootgg**`
            )
            .setTimestamp();

        return { embed, imageAttachment };
    }

    function checkTimeAndSendEmbed() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        if (currentHour === targetHour && currentMinute === targetMinute) {
            client.channels.fetch(OcularGeneralID)
                .then(channel => {
                    if (channel) {
                        const { embed, imageAttachment } = createMammothEmbed();
                        channel.send({ embeds: [embed], files: [imageAttachment] });
                    } else {
                        console.error('Channel not found.');
                    }
                })
                .catch(console.error);
        }
    }

    setInterval(checkTimeAndSendEmbed, 60000);
};
