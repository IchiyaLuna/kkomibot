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
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
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

client.on('messageCreate', async message => {
    const content = message.content;
    const contentArr = content.split(" ");
    const command = contentArr[0];
    const nickname = contentArr[1];
    if (command === '!유저') {
        const encodeNickName = encodeURI(nickname);
        const html = await axios.get(`https://lostark.game.onstove.com/Profile/Character/${encodeNickName}`);
        const $ = cheerio.load(html.data);
        const userName = $("span.profile-character-info__name").text();
        var server = $("span.profile-character-info__server").text();
        server = server.substring(1, server.length);
        const level = $("span.profile-character-info__lv").text();
        var expedition = $("div.level-info__expedition > span").text();
        expedition = expedition.substring(6, expedition.length);
        var itemlevel = $("div.level-info2__expedition > span").text();
        itemlevel = itemlevel.substring(9, itemlevel.length);
        var title = $("div.game-info__title").text();
        title = title.substring(2, itemlevel.length);
        var guild = $("div.game-info__guild").text();
        guild = guild.substring(2, itemlevel.length);
        const job = $("img.profile-character-info__img").attr("alt");
        const jobimg = $("img.profile-character-info__img").attr("src");

        const userembed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('기본 정보')
            .setURL(`https://lostark.game.onstove.com/Profile/Character/${encodeNickName}`)
            .setAuthor(userName, jobimg)
            .setDescription(`\`\`캐릭터명\`\` : ${userName}\n\`\`서버명\`\` : ${server}\n\`\`직업\`\` : ${job}\n\`\`길드\`\` : ${guild}\n\`\`칭호\`\` : ${title}\n`)
            .setThumbnail(jobimg)
            .addField('레벨 정보', `\`\`아이템 레벨\`\` : ${itemlevel}\n\`\`원정대 레벨\`\` : ${expedition}\n\`\`전투 레벨\`\` : ${level}\n`, true)
            .setTimestamp()
            .setFooter('꼬미봇 by 아뀨');

        if (userName == "") {
            await message.channel.send("유저를 찾을 수 없습니다.");
        } else {
            await message.channel.send({
                embeds: [userembed]
            });
        }
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