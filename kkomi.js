const {
    MessageEmbed,
} = require('discord.js');

exports.Alert = async function (message) {
    if (message.member.roles.cache.has('882486032841453678')) {
        let today = new Date();

        const alertembed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${today.getMonth() + 1}월 ${today.getDate()}일 꼬미봇 안내`)
            .setDescription(`${message.content.substring(4, message.content.length)}`)
            .setTimestamp()
            .setFooter('꼬미봇 공지 - 꼬미봇 by 아뀨');

        channel = client.channels.cache.get('882485876075167806');
        channel.send({
            embeds: [alertembed]
        });
    } else {
        await message.channel.send("관리자만 수행할 수 있습니다.");
    }
}