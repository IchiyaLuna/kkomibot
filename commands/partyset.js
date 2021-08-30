const {
    SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('파티세팅')
        .setDescription('파티 도우미 세팅')
};