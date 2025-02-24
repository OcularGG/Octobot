module.exports = {
    start: () => {
        const newName = new Date().toISOString();
        setInterval(async () => {
            await channel.setName(newName);
        }, 60000); // 60000 milliseconds = 1 minute
    }
};