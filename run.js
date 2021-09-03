// Ext lib
const fs = require('fs');

// Require the necessary discord.js classes
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

// Require Modules
const KKOMI = require('./kkomi.js');

const Lostark = require('./lostark.js');

const Music = require('./music.js');

// Create a new client instance
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
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
    client.user.setActivity('쪼꼬미들의 목소리를', {
        type: 'LISTENING'
    });
});

function checkBatchimEnding(word) {
    if (typeof word !== 'string') return null;

    var lastLetter = word[word.length - 1];
    var uni = lastLetter.charCodeAt(0);

    if (uni < 44032 || uni > 55203) return null;

    return (uni - 44032) % 28 != 0;
}

client.on('messageCreate', async message => {
    const content = message.content;
    const contentArr = content.split(" ");
    const command = contentArr[0];

    if (command === '!공지') {
        KKOMI.Alert(message);
    } else if (command === '!인증') {
        Lostark.Auth(message);
    } else if (command === '!유저') {
        Lostark.User(message);
    } else if (command === "!재생") {
        Music.Play(message);
    } else if (command === "!나가") {
        Music.Leave(message);
    } else if (command === "!다음") {
        Music.Next(message);
    }
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
            .setFooter("꼬미봇 by 아뀨");

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
            .setFooter("꼬미봇 by 아뀨");

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
            .setFooter("꼬미봇 by 아뀨");

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
            .setFooter("꼬미봇 by 아뀨");

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
            .setFooter("꼬미봇 by 아뀨");

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
            .setFooter("꼬미봇 by 아뀨");

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
            .setFooter("꼬미봇 by 아뀨");

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
            .setFooter("꼬미봇 by 아뀨");

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

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 발탄 노말 파티를 모집중!`)
            .setDescription(`군단장 발탄 노말 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

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

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 발탄 하드 파티를 모집중!`)
            .setDescription(`군단장 발탄 하드 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

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

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 비아키스 노말 파티를 모집중!`)
            .setDescription(`군단장 비아키스 노말 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

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

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 비아키스 하드 파티를 모집중!`)
            .setDescription(`군단장 비아키스 하드 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

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

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 쿠크세이튼 리허설 파티 모집`)
            .setDescription(`군단장 쿠크세이튼 리허설 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

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

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 쿠크세이튼 노말 파티를 모집중!`)
            .setDescription(`군단장 쿠크세이튼 노말 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

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

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 쿠크세이튼 하드 파티를 모집중!`)
            .setDescription(`군단장 쿠크세이튼 하드 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

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

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 아브렐슈드 데자뷰 파티 모집`)
            .setDescription(`군단장 아브렐슈드 데자뷰 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

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

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 아브렐슈드 노말 파티를 모집중!`)
            .setDescription(`군단장 아브렐슈드 노말 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

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

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 아브렐슈드 하드 파티를 모집중!`)
            .setDescription(`군단장 아브렐슈드 하드 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

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

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 일리아칸 노말 파티를 모집중!`)
            .setDescription(`군단장 일리아칸 노말 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

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

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 일리아칸 하드 파티를 모집중!`)
            .setDescription(`군단장 일리아칸 하드 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

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

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 카멘 노말 파티를 모집중!`)
            .setDescription(`군단장 카멘 노말 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

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

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 카멘 하드 파티를 모집중!`)
            .setDescription(`군단장 카멘 하드 레이드 파티입니다.\n채팅이나 놀자에요를 통해 참여 의사를 알려주세요!`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

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