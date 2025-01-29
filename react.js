client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.channel.id === 1100847035013419114) {
        try {
            await message.react(<:Ocular:1324391933635727380>);
        }
    }
});
