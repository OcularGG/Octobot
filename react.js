const TARGET_CHANNEL_ID = '1100847035013419114';

const TARGET_EMOJI = '<:Ocular:1324391933635727380>';

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.channel.id === TARGET_CHANNEL_ID) {
        try {
            await message.react(TARGET_EMOJI);
        }
    }
});