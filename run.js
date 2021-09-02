// Ext lib
const axios = require('axios');
const cheerio = require('cheerio');
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const {
    youtubeAPI
} = require('./config.json');
const youtube = new Youtube(youtubeAPI);

// Require the necessary discord.js classes
const fs = require('fs');

const {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} = require('@discordjs/voice');

const {
    Client,
    VoiceChannel,
    Collection,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Permissions,
    Intents
} = require('discord.js');

const {
    token
} = require('./config.json');
const {
    filter
} = require('cheerio/lib/api/traversing');
const {
    resourceUsage
} = require('process');

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

function isEmpty(str) {

    if (typeof str == "undefined" || str == null || str == "")
        return true;
    else
        return false;
}

client.on('messageCreate', async message => {
    const content = message.content;
    const contentArr = content.split(" ");
    const command = contentArr[0];
    const parameter = contentArr[1];

    if (command === '!공지') {
        if (message.member.roles.cache.has('882486032841453678')) {
            let today = new Date();

            const alertembed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${today.getMonth() + 1}월 ${today.getDate()}일 꼬미봇 안내`)
                .setDescription(`${message.content.substring(3, message.content.length)}`)
                .setTimestamp()
                .setFooter('꼬미봇 공지 - 꼬미봇 by 아뀨');

            channel = client.channels.cache.get('882485876075167806');
            channel.send({
                embeds: [alertembed]
            });
        } else {
            await message.channel.send("관리자만 수행할 수 있습니다.");
        }
    } else if (command === '!인증') {
        const encodeNickName = encodeURI(parameter);
        const html = await axios.get(`https://lostark.game.onstove.com/Profile/Character/${encodeNickName}`);
        const $ = cheerio.load(html.data);

        const userName = $("span.profile-character-info__name").text();

        var server = $("span.profile-character-info__server").text();
        server = server.substring(1, server.length);

        const level = $("span.profile-character-info__lv").text();

        var TempArr = [];

        $("div.level-info__expedition > span").each(function (i) {
            TempArr[i] = $(this).text();
        });

        const expedition = TempArr[1];

        var TempArr = [];

        $("div.level-info2__expedition > span").each(function (i) {
            TempArr[i] = $(this).text();
        });

        var itemlevel = TempArr[1];

        var TempArr = [];

        $("div.game-info__guild > span").each(function (i) {
            TempArr[i] = $(this).text();
        });

        var guild = TempArr[1];

        const userembed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('인증 완료')
            .setAuthor('쪼꼬미 길드 인증 시스템')
            .setDescription(`\`\`캐릭터명\`\` : ${userName}\n\`\`서버명\`\` : ${server}\n\`\`길드\`\` : ${guild}`)
            .addField('레벨 정보', `\`\`아이템 레벨\`\` : ${itemlevel}\n\`\`원정대 레벨\`\` : ${expedition}\n\`\`전투 레벨\`\` : ${level}`, true)
            .setTimestamp()
            .setFooter('정보 조회 - 꼬미봇 by 아뀨');

        if (userName == "") {
            await message.channel.send("유저를 찾을 수 없습니다.");
        } else if (guild != "쪼꼬미" || server != "아브렐슈드") {
            await message.channel.send("쪼꼬미 길드에 가입된 캐릭터만 인증할 수 있습니다.");
        } else {
            message.member.roles.add('881208641640890378');
            message.member.roles.remove('882140536075599872')
            message.member.setNickname(userName);

            await message.channel.send({
                embeds: [userembed]
            });
        }
    } else if (command === '!유저') {
        const encodeNickName = encodeURI(parameter);
        const html = await axios.get(`https://lostark.game.onstove.com/Profile/Character/${encodeNickName}`);
        const $ = cheerio.load(html.data);
        const userName = $("span.profile-character-info__name").text();
        var server = $("span.profile-character-info__server").text();
        server = server.substring(1, server.length);
        const level = $("span.profile-character-info__lv").text();

        var TempArr = [];
        $("div.level-info__expedition > span").each(function (i) {
            TempArr[i] = $(this).text();
        });
        const expedition = TempArr[1];

        var TempArr = [];
        $("div.level-info2__expedition > span").each(function (i) {
            TempArr[i] = $(this).text();
        });
        var itemlevel = TempArr[1];

        var TempArr = [];
        $("div.game-info__guild > span").each(function (i) {
            TempArr[i] = $(this).text();
        });
        var guild = TempArr[1];

        var TempArr = [];
        $("div.game-info__title > span").each(function (i) {
            TempArr[i] = $(this).text();
        });
        var title = TempArr[1];

        const job = $("img.profile-character-info__img").attr("alt");
        const jobimg = $("img.profile-character-info__img").attr("src");

        var wisdom = [];

        $("div.game-info__wisdom > span").each(function (i) {
            if (isEmpty($(this).text())) {
                wisdom[i] = "-";
            } else {
                wisdom[i] = $(this).text();
            }
        })

        var basicability = [];

        $("div.profile-ability-basic > ul > li > span").each(function (i) {
            basicability[i] = $(this).text();
        });

        var battleablility = [];

        $("div.profile-ability-battle > ul > li > span").each(function (i) {
            battleablility[i] = $(this).text();
        });

        var engrave = [];

        $("div.profile-ability-engrave > div > div > ul > li > span").each(function (i) {
            engrave[i] = $(this).text();
        })

        var engraveinfo = "";

        for (const item of engrave) {
            const TempArr = item.split(" Lv.");
            engraveinfo += `\`\`${TempArr[0]}\`\` : ${TempArr[1]} 레벨\n`;
        }

        if (engraveinfo == "") {
            engraveinfo = "각인이 없습니다."
        }

        for (var i = 1; i < 8; i++) {
            if (isEmpty(battleablility[i])) {
                battleablility[i] = "-";
            }
            if (isEmpty(basicability[i])) {
                basicability[i] = "-";
            }
        }

        const userembed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('기본 정보')
            .setURL(`https://lostark.game.onstove.com/Profile/Character/${encodeNickName}`)
            .setAuthor(`${userName} - ${job}`, jobimg)
            .setDescription(`\`\`캐릭터명\`\` : ${userName}\n\`\`서버명\`\` : ${server}\n\`\`직업\`\` : ${job}\n\`\`길드\`\` : ${guild}\n\`\`칭호\`\` : ${title}`)
            .setThumbnail(jobimg)
            .addField('영지 정보', `\`\`영지 이름\`\` : ${wisdom[2]}\n\`\`영지 레벨\`\` : ${wisdom[1]}`, false)
            .addField('각인 정보', `${engraveinfo}`, false)
            .addField('레벨 정보', `\`\`아이템 레벨\`\` : ${itemlevel}\n\`\`원정대 레벨\`\` : ${expedition}\n\`\`전투 레벨\`\` : ${level}`, true)
            .addField('전투 특성', `\`\`치명\`\` : ${battleablility[1]}\n\`\`특화\`\` : ${battleablility[3]}\n\`\`신속\`\` : ${battleablility[7]}`, true)
            .addField('기본 특성', `\`\`공격력\`\` : ${basicability[1]}\n\`\`최대 생명력\`\` : ${basicability[3]}`, true)
            .setTimestamp()
            .setFooter('정보 조회 - 꼬미봇 by 아뀨');

        if (userName == "") {
            await message.channel.send("유저를 찾을 수 없습니다.");
        } else {
            await message.channel.send({
                embeds: [userembed]
            });
        }
    } else if (command === "!재생") {
        const voicechannel = message.member.voice.channel;

        if (!voicechannel) {
            return message.channel.send("우선 음성 채널에 참여해야 합니다.");
        }

        try {
            const searchkeyword = message.content.substring(3, message.content.length);

            var urls = [];
            var embedcontent = "";

            const videos = await youtube.searchVideos(searchkeyword, 5);

            if (videos.length < 5) return message.channel.send('충분한 노래를 검색하지 못했습니다.');

            for (let i = 0; i < videos.length; i++) {
                urls[i] = videos[i].url;
                embedcontent += `**${i + 1} :** ${videos[i].title}\n`;
            }

            const musicselectembed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`검색된 음악 리스트`)
                .setDescription(`${embedcontent}`)
                .addField('사용법', '원하는 노래의 \`\`숫자\`\`만 입력하세요. 취소는 아무거나 입력하세요.')
                .setTimestamp()
                .setFooter('꼬미봇 플레이어 - 꼬미봇 by 아뀨');

            const filter = m => m.author.id === message.author.id;

            message.channel.send({
                    embeds: [musicselectembed]
                })
                .then(sentMessage => {
                    message.channel.awaitMessages({
                            filter,
                            max: 1,
                            time: 10000,
                            errors: ['time']
                        })
                        .then(collected => {
                            answer = collected.first(1);
                            collected.each(message => message.delete());
                            sentMessage.delete();

                            selectnum = parseInt(answer);

                            if (selectnum >= 1 && selectnum <= 5) {

                                const connection = joinVoiceChannel({
                                    channelId: voicechannel.id,
                                    guildId: message.guild.id,
                                    adapterCreator: message.guild.voiceAdapterCreator
                                });

                                const stream = ytdl(urls[selectnum - 1], {
                                    filter: 'audioonly'
                                });

                                const resource = createAudioResource(stream, {
                                    inputType: StreamType.Arbitrary,
                                    inlineVolume: true
                                });

                                resource.volume.setVolume(0.5);

                                const player = createAudioPlayer();

                                player.play(resource);

                                connection.subscribe(player);

                                player.on(AudioPlayerStatus.Idle, () => connection.destroy());

                                const musicselectembed = new MessageEmbed()
                                    .setColor('#0099ff')
                                    .setTitle(`${videos[selectnum - 1].title}`)
                                    .setDescription(`${videos[selectnum - 1].description}`)
                                    .setTimestamp()
                                    .setFooter('꼬미봇 플레이어 - 꼬미봇 by 아뀨');

                                message.channel.send({
                                    embeds: [musicselectembed]
                                });
                            } else {
                                message.channel.send(`재생이 취소되었습니다.`);
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            message.channel.send("시간이 초과되었습니다.");
                        });
                });
        } catch (err) {
            console.log(err);
            return message.channel.send("노래를 불러오는 과정에서 오류가 발생했습니다.");
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