// Ext lib
const axios = require('axios');
const cheerio = require('cheerio');
// Require the necessary discord.js classes
const fs = require('fs');

const {
    Client,
    Collection,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Intents
} = require('discord.js');

const {
    token
} = require('./config.json');

// Create a new client instance
const client = new Client({
    intents: [Intents.FLAGS.GUILDS]
});

// Load commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
}

// Bot login message
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === '파티세팅') {
        const party_embed = new MessageEmbed()
            .setTitle("파티 생성 도우미")
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setDescription("군단장 레이드 파티 간편 생성입니다.\n원하는 군단장을 선택하면 난이도를 고를 수 있습니다.")
            .setTimestamp()
            .setFooter("꼬미봇");

        const commandersA = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('valtan')
                .setLabel('발탄')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('biackiss')
                .setLabel('비아키스')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('saton')
                .setLabel('쿠크세이튼')
                .setStyle('PRIMARY')
            );

        const commandersB = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('abrelshud')
                .setLabel('아브렐슈드')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('illiakan')
                .setLabel('일리아칸')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('kamen')
                .setLabel('카멘')
                .setStyle('PRIMARY')
            );

        await interaction.reply({
            embeds: [party_embed],
            components: [commandersA, commandersB]
        });
    } else if (interaction.commandName === '유저') {
        const nickname = interaction.options.getString('input');
        const encodeNickName = encodeURI(nickname);
        const html = await axios.get(`https://lostark.game.onstove.com/Profile/Character/${encodeNickName}`);
        const $ = cheerio.load(html.data);
        const userName = $("span.profile-character-info__name").text();
        const level = $("span.profile-character-info__lv").text();
        const expedition = $("div.level-info__expedition > span").text();
        const itemlevel = $("div.level-info2__expedition > span").text();
        const job = $("img.profile-character-info__img").attr("alt");

        await interaction.reply(`${userName}의 원정대 레벨은 ${expedition}, 전투 레벨은 ${level}이고 직업은 ${job}, 아이템 레벨은 ${itemlevel}입니다.`);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId == 'valtan') {

        const valtan_embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle('군단장 발탄 파티 생성')
            .setDescription('군단장 발탄 레이드의 난이도를 선택해주세요.\n*본 메시지는 본인에게만 보입니다.*')
            .setTimestamp()
            .setFooter("꼬미봇");

        const difficulty = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('vnormal')
                .setLabel('노말')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('vhard')
                .setLabel('하드')
                .setStyle('DANGER'),
            );

        await interaction.reply({
            embeds: [valtan_embed],
            components: [difficulty],
            ephemeral: true
        });
    } else if (interaction.customId == 'biackiss') {

        const valtan_embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle('군단장 비아키스 파티 생성')
            .setDescription('군단장 비아키스 레이드의 난이도를 선택해주세요.\n*본 메시지는 본인에게만 보입니다.*')
            .setTimestamp()
            .setFooter("꼬미봇");

        const difficulty = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('bnormal')
                .setLabel('노말')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('bhard')
                .setLabel('하드')
                .setStyle('DANGER'),
            );

        await interaction.reply({
            embeds: [valtan_embed],
            components: [difficulty],
            ephemeral: true
        });
    } else if (interaction.customId == 'saton') {

        const valtan_embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle('군단장 쿠크세이튼 파티 생성')
            .setDescription('군단장 쿠크세이튼 레이드의 난이도를 선택해주세요.\n*본 메시지는 본인에게만 보입니다.*')
            .setTimestamp()
            .setFooter("꼬미봇");

        const difficulty = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('rehearsal')
                .setLabel('리허설')
                .setStyle('SECONDARY'),
                new MessageButton()
                .setCustomId('snormal')
                .setLabel('노말')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('shard')
                .setLabel('하드')
                .setStyle('DANGER'),
            );

        await interaction.reply({
            embeds: [valtan_embed],
            components: [difficulty],
            ephemeral: true
        });
    } else if (interaction.customId == 'abrelshud') {

        const valtan_embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle('군단장 아브렐슈드 파티 생성')
            .setDescription('군단장 아브렐슈드 레이드의 난이도를 선택해주세요.\n*본 메시지는 본인에게만 보입니다.*')
            .setTimestamp()
            .setFooter("꼬미봇");

        const difficulty = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('dejavu')
                .setLabel('데자뷰')
                .setStyle('SECONDARY'),
                new MessageButton()
                .setCustomId('anormal')
                .setLabel('노말')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('ahard')
                .setLabel('하드')
                .setStyle('DANGER'),
            );

        await interaction.reply({
            embeds: [valtan_embed],
            components: [difficulty],
            ephemeral: true
        });
    } else if (interaction.customId == 'illiakan') {

        const valtan_embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle('군단장 일리아칸 파티 생성')
            .setDescription('군단장 일리아칸 레이드의 난이도를 선택해주세요.\n*본 메시지는 본인에게만 보입니다.*')
            .setTimestamp()
            .setFooter("꼬미봇");

        const difficulty = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('inormal')
                .setLabel('노말')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('ihard')
                .setLabel('하드')
                .setStyle('DANGER'),
            );

        await interaction.reply({
            embeds: [valtan_embed],
            components: [difficulty],
            ephemeral: true
        });
    } else if (interaction.customId == 'kamen') {

        const valtan_embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle('군단장 카멘 파티 생성')
            .setDescription('군단장 카멘 레이드의 난이도를 선택해주세요.\n*본 메시지는 본인에게만 보입니다.*')
            .setTimestamp()
            .setFooter("꼬미봇");

        const difficulty = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('knormal')
                .setLabel('노말')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('khard')
                .setLabel('하드')
                .setStyle('DANGER'),
            );

        await interaction.reply({
            embeds: [valtan_embed],
            components: [difficulty],
            ephemeral: true
        });
    } else if (interaction.customId == 'attend') {

        const valtan_embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle('군단장 아브렐슈드 파티 생성')
            .setDescription('군단장 아브렐슈드 레이드의 난이도를 선택해주세요.\n*본 메시지는 본인에게만 보입니다.*')
            .setTimestamp()
            .setFooter("꼬미봇");

        const difficulty = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('dejavu')
                .setLabel('데자뷰')
                .setStyle('SECONDARY'),
                new MessageButton()
                .setCustomId('anormal')
                .setLabel('노말')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('ahard')
                .setLabel('하드')
                .setStyle('DANGER'),
            );

        await interaction.reply({
            embeds: [valtan_embed],
            components: [difficulty],
            ephemeral: true
        });
    } else if (interaction.customId == 'vnormal') {

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}가 발탄 노말 파티를 모집중!`)
            .setDescription(`군단장 발탄 노말 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇");

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216045615022160');
        channel.send({
            embeds: [embed]
        }).then(function (message) {
            message.react("<:nolja:881807287449169920>")
        });
    } else if (interaction.customId == 'vhard') {

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}가 발탄 하드 파티를 모집중!`)
            .setDescription(`군단장 발탄 하드 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇");

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216045615022160');
        channel.send({
            embeds: [embed]
        }).then(function (message) {
            message.react("<:nolja:881807287449169920>")
        });
    } else if (interaction.customId == 'bnormal') {

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}가 비아키스 노말 파티를 모집중!`)
            .setDescription(`군단장 비아키스 노말 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇");

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216179287515206');
        channel.send({
            embeds: [embed]
        }).then(function (message) {
            message.react("<:nolja:881807287449169920>")
        });
    } else if (interaction.customId == 'bhard') {

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}가 비아키스 하드 파티를 모집중!`)
            .setDescription(`군단장 비아키스 하드 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇");

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216179287515206');
        channel.send({
            embeds: [embed]
        }).then(function (message) {
            message.react("<:nolja:881807287449169920>")
        });
    } else if (interaction.customId == 'rehearsal') {

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}가 쿠크세이튼 리허설 파티 모집`)
            .setDescription(`군단장 쿠크세이튼 리허설 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇");

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216191409041408');
        channel.send({
            embeds: [embed]
        }).then(function (message) {
            message.react("<:nolja:881807287449169920>")
        });
    } else if (interaction.customId == 'snormal') {

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}가 쿠크세이튼 노말 파티를 모집중!`)
            .setDescription(`군단장 쿠크세이튼 노말 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇");

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216191409041408');
        channel.send({
            embeds: [embed]
        }).then(function (message) {
            message.react("<:nolja:881807287449169920>")
        });
    } else if (interaction.customId == 'shard') {

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}가 쿠크세이튼 하드 파티를 모집중!`)
            .setDescription(`군단장 쿠크세이튼 하드 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇");

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216191409041408');
        channel.send({
            embeds: [embed]
        }).then(function (message) {
            message.react("<:nolja:881807287449169920>")
        });
    } else if (interaction.customId == 'dejavu') {

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}가 아브렐슈드 데자뷰 파티 모집`)
            .setDescription(`군단장 아브렐슈드 데자뷰 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇");

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216205531267132');
        channel.send({
            embeds: [embed]
        }).then(function (message) {
            message.react("<:nolja:881807287449169920>")
        });
    } else if (interaction.customId == 'anormal') {

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}가 아브렐슈드 노말 파티를 모집중!`)
            .setDescription(`군단장 아브렐슈드 노말 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇");

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216205531267132');
        channel.send({
            embeds: [embed]
        }).then(function (message) {
            message.react("<:nolja:881807287449169920>")
        });
    } else if (interaction.customId == 'ahard') {

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}가 아브렐슈드 하드 파티를 모집중!`)
            .setDescription(`군단장 아브렐슈드 하드 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇");

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216205531267132');
        channel.send({
            embeds: [embed]
        }).then(function (message) {
            message.react("<:nolja:881807287449169920>")
        });
    } else if (interaction.customId == 'inormal') {

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}가 일리아칸 노말 파티를 모집중!`)
            .setDescription(`군단장 일리아칸 노말 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇");

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216529834840177');
        channel.send({
            embeds: [embed]
        }).then(function (message) {
            message.react("<:nolja:881807287449169920>")
        });
    } else if (interaction.customId == 'ihard') {

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}가 일리아칸 하드 파티를 모집중!`)
            .setDescription(`군단장 일리아칸 하드 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇");

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216529834840177');
        channel.send({
            embeds: [embed]
        }).then(function (message) {
            message.react("<:nolja:881807287449169920>")
        });
    } else if (interaction.customId == 'knormal') {

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}가 카멘 노말 파티를 모집중!`)
            .setDescription(`군단장 카멘 노말 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇");

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216544116465674');
        channel.send({
            embeds: [embed]
        }).then(function (message) {
            message.react("<:nolja:881807287449169920>")
        });
    } else if (interaction.customId == 'khard') {

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}가 카멘 하드 파티를 모집중!`)
            .setDescription(`군단장 카멘 하드 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇");

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216544116465674');
        channel.send({
            embeds: [embed]
        }).then(function (message) {
            message.react("<:nolja:881807287449169920>")
        });
    }
});

// Login to Discord with your client's token
client.login(token);