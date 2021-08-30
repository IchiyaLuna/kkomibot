const {
    SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('유저')
        .setDescription('전투정보실에서 유저를 검색합니다.')
        .addStringOption(option => option.setName('유저명').setDescription('검색할 유저명을 입력해주세요.'))
};