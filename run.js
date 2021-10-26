// Ext lib
const axios = require('axios');
const cheerio = require('cheerio');

const Youtube = require('simple-youtube-api');
const playdl = require('play-dl');
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
    NoSubscriberBehavior,
    getVoiceConnection
} = require('@discordjs/voice');

const {
    Client,
    VoiceChannel,
    Collection,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    Permissions,
    Intents,
    User,
} = require('discord.js');


const {
    token
} = require('./config.json');
const {
    time
} = require('console');
const {
    homedir
} = require('os');


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

var MusicData = {
    queue: [],
    isPlaying: false,
    QueueLock: false
};

var LastConnection;

const MusicPlayer = createAudioPlayer();

MusicPlayer.on('stateChange', (oldState, newState) => {
    console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
    if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
        processQueue();
    }
});

async function processQueue() {
    if (MusicData.QueueLock || MusicPlayer.state.status !== AudioPlayerStatus.Idle || MusicData.queue.length === 0) {
        return;
    }

    MusicData.QueueLock = true;

    const nextTrack = MusicData.queue.shift();

    try {
        let source = await playdl.stream(nextTrack.url);

        const resource = createAudioResource(source.stream, {
            inputType: source.type
        });

        MusicPlayer.play(resource);

        const nowplaying = new MessageEmbed()
            .setColor('#c4302b')
            .setTitle(`지금 재생중 - ${nextTrack.title}`)
            .setDescription(`${nextTrack.desc}`)
            .setImage(nextTrack.thumbnail)
            .setTimestamp()
            .setFooter('꼬미봇 플레이어 - 꼬미봇 by 아뀨');

        if (!isEmpty(MusicData.queue[0])) {
            nowplaying.addField('다음곡', MusicData.queue[0].title);
        }

        nextTrack.message.channel.send({
            embeds: [nowplaying]
        });

        MusicData.QueueLock = false;
    } catch (error) {
        console.log(error);
        MusicData.QueueLock = false;
        return processQueue();
    }
}
async function playMusic(connection, message) {
    const voicechannel = message.member.voice.channel;

    if (MusicPlayer.state.status !== AudioPlayerStatus.Playing) {
        if (MusicData.queue[0]) {
            const nextTrack = MusicData.queue.shift();

            let source = await playdl.stream(nextTrack.url);

            const resource = createAudioResource(source.stream, {
                inputType: source.type
            });

            MusicPlayer.play(resource);

            connection.subscribe(MusicPlayer);

            const nowplaying = new MessageEmbed()
                .setColor('#c4302b')
                .setTitle(`지금 재생중 - ${nextTrack.title}`)
                .setDescription(`${nextTrack.desc}`)
                .setImage(nextTrack.thumbnail)
                .setTimestamp()
                .setFooter('꼬미봇 플레이어 - 꼬미봇 by 아뀨');

            await message.channel.send({
                embeds: [nowplaying]
            });
        }
    } else if (voicechannel.id != message.guild.me.voice.channel.id) {
        const LastAdded = MusicData.queue[MusicData.queue.length - 1];

        MusicData.queue = [];

        MusicData.queue.push(LastAdded);

        const nextTrack = MusicData.queue.shift();

        let source = await playdl.stream(nextTrack.url);

        const resource = createAudioResource(source.stream, {
            inputType: source.type
        });

        MusicPlayer.play(resource);

        connection.subscribe(MusicPlayer);

        const nowplaying = new MessageEmbed()
            .setColor('#c4302b')
            .setTitle(`지금 재생중 - ${nextTrack.title}`)
            .setDescription(`${nextTrack.desc}`)
            .setImage(nextTrack.thumbnail)
            .setTimestamp()
            .setFooter('꼬미봇 플레이어 - 꼬미봇 by 아뀨');

        await message.channel.send({
            embeds: [nowplaying]
        });
    } else {
        const queueembed = new MessageEmbed()
            .setColor('#c4302b')
            .setTitle(`재생 예약됨 - ${MusicData.queue[MusicData.queue.length - 1].title}`)
            .setDescription(`${MusicData.queue[MusicData.queue.length - 1].desc}`)
            .setImage(MusicData.queue[MusicData.queue.length - 1].thumbnail)
            .setTimestamp()
            .setFooter('꼬미봇 플레이어 - 꼬미봇 by 아뀨');

        await message.channel.send({
            embeds: [queueembed]
        });
    }
}

async function UserSearch(encodeNickName) {
    const html = await axios.get(`https://lostark.game.onstove.com/Profile/Character/${encodeNickName}`);
    const $ = cheerio.load(html.data);
    const username = $("span.profile-character-info__name").text();
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

    for (let i = 0; i < 8; i++) {
        basicability[i] = "-";
    }

    $("div.profile-ability-basic > ul > li > span").each(function (i) {
        if (isEmpty($(this).text())) {
            basicability[i] = "-";
        } else if ($(this).text() == "undefined") {
            basicability[i] = "-";
        } else {
            basicability[i] = $(this).text();
        }
    });

    var battleablility = [];

    for (let i = 0; i < 8; i++) {
        battleablility[i] = "-";
    }

    $("div.profile-ability-battle > ul > li > span").each(function (i) {
        if (isEmpty($(this).text())) {
            battleablility[i] = "-";
        } else if ($(this).text() == "undefined") {
            battleablility[i] = "-";
        } else {
            battleablility[i] = $(this).text();
        }
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

    const UserData = {
        server: server,
        username: username,
        title: title,
        guild: guild,
        itemlevel: itemlevel,
        level: level,
        expedition: expedition,
        job: job,
        jobimg: jobimg,
        wisdom: wisdom,
        basicability: basicability,
        battleablility: battleablility,
        engraveinfo: engraveinfo
    };

    return UserData;
}

async function MariShop() {
    const html = await axios.get(`https://lostark.game.onstove.com/Shop#mari`);
    const $ = cheerio.load(html.data);

    let today = new Date();

    let hours = today.getHours(); // 시
    let minutes = today.getMinutes();

    if (hours < 6) {
        hours = 6 - hours;
        if (minutes > 0) {
            hours -= 1;
            minutes = 60 - minutes;
        }
    } else if (hours < 12) {
        hours = 12 - hours;
        if (minutes > 0) {
            hours -= 1;
            minutes = 60 - minutes;
        }
    } else if (hours < 18) {
        hours = 18 - hours;
        if (minutes > 0) {
            hours -= 1;
            minutes = 60 - minutes;
        }
    } else if (hours < 24) {
        hours = 24 - hours;
        if (minutes > 0) {
            hours -= 1;
            minutes = 60 - minutes;
        }
    }

    var TimeLeft = "**새 상품 입고까지 ";

    if (hours != 0) {
        TimeLeft += `${hours}시간 `;
    }

    TimeLeft += `${minutes}분 남았습니다**`;

    var ItemNameList = [];

    $("ul.list-items > li > div > span").each(function (i) {
        ItemNameList[i] = $(this).text();
    });

    var ItemPriceList = [];

    $("ul.list-items > li > div > div.area-amount > span").each(function (i) {
        ItemPriceList[i] = $(this).text();
    });

    var GrowItems = "";

    for (let i = 0; i < 6; i++) {
        GrowItems += `**${ItemNameList[i]}** - <:crystal:886884143198265345> **${ItemPriceList[i]}**\n`;
    }

    var FightLivingItems = "";

    for (let i = 18; i < 24; i++) {
        FightLivingItems += `**${ItemNameList[i]}** - <:crystal:886884143198265345> **${ItemPriceList[i]}**\n`;
    }

    const MaryEmbed = new MessageEmbed()
        .setColor('#6A5ACD')
        .setTitle(`마리의 비밀 상점`)
        .setDescription(TimeLeft)
        .addField(`성장 추천 상품`, GrowItems, false)
        .addField(`전투 & 생활 추천 상품`, FightLivingItems, false)
        .setTimestamp()
        .setFooter('꼬미봇 로아샵 뷰어 - 꼬미봇 by 아뀨');

    return MaryEmbed;
}

async function DailyContent() {
    let today = new Date();

    let hours = today.getHours(); // 시
    let minutes = today.getMinutes();

    var CurMin = hours * 60 + minutes;

    const html = await axios.get('https://lostark.inven.co.kr/');
    const $ = cheerio.load(html.data);

    var ContentNameList = [];

    $('div.hotbossPart > ul > li > div.txtBox > p.npcname').each(function (i) {
        ContentNameList[i] = $(this).text();
        console.log(`${ContentNameList[i]}`);
    });

    var ContentTimeList = [];
    var ContentLeftList = [];
    var ContentHourList = [];
    var ContentMinList = [];

    $('div.hotbossPart > ul > li > div.txtBox > p.gentime').each(function (i) {
        ContentTimeList[i] = $(this).attr("data-datetime");
        ContentHourList[i] = parseInt(ContentTimeList[i].split(' ')[1].split(':')[0]);
        ContentMinList[i] = parseInt(ContentTimeList[i].split(' ')[1].split(':')[1]);
        ContentLeftList[i] = ContentHourList[i] * 60 + ContentMinList[i];
        console.log(`${ContentTimeList[i]} / ${hours}:${minutes} /${ContentLeftList[i] - CurMin}`);
    });

    const ContentEmbed = new MessageEmbed()
        .setColor('#6A5ACD')
        .setTitle(`일일 컨텐츠 타이머`)
        .setDescription('모험섬, 카오스게이트, 필드보스 등 곧 시작하는 일일 컨텐츠를 알려드립니다.')
        .setTimestamp()
        .setFooter('꼬미봇 컨텐츠 타이머 - 꼬미봇 by 아뀨');

    for (let i = 0; i < 6; i++) {
        if (ContentHourList[i] == 0) {
            ContentHourList[i] = '00';
        }

        if (ContentMinList[i] == 0) {
            ContentMinList[i] = '00';
        }
        if (ContentLeftList[i] - CurMin > 0) {
            ContentEmbed.addField(`**${ContentNameList[i]}**`, `**${ContentHourList[i]}:${ContentMinList[i]}** (시작까지 ${ContentLeftList[i] - CurMin}분 남음)`);
        } else if (ContentLeftList[i] - CurMin) {
            ContentEmbed.addField(`**${ContentNameList[i]}**`, `**${ContentHourList[i]}:${ContentMinList[i]}** (진행중!)`);
        } else {
            ContentEmbed.addField(`**${ContentNameList[i]}**`, `**${ContentHourList[i]}:${ContentMinList[i]}** (시작까지 ${24 * 60 - CurMin}분 남음)`);
        }
    }

    return ContentEmbed;
}

async function RaidInfo(RaidName) {

    const gold = "<:gold:902442377250238524>"

    var raidcode;
    var raidname;

    if (RaidName.includes("아르고스")) raidcode = 0;
    else if (RaidName.includes("발탄")) raidcode = 1;
    else if (RaidName.includes("비아")) raidcode = 2;
    else if (RaidName.includes("쿠크")) raidcode = 3;
    else if (RaidName.includes("아브렐")) raidcode = 4;
    else raidcode = -1;

    if (raidcode == -1) {
        const RaidEmbed = new MessageEmbed()
            .setColor('#6A5ACD')
            .setTitle(`레이드를 찾을 수 없습니다.`)
            .setDescription(`입력하신 레이드명 ${RaidName}으로 레이드를 찾을 수 없었어요.`)
            .setTimestamp()
            .setFooter('꼬미봇 레이드 사전 - 꼬미봇 by 아뀨');

        return RaidEmbed;
    }

    switch (raidcode) {
        case 0:
            raidname = "아르고스";
            break;
        case 1:
            raidname = "발탄";
            break;
        case 2:
            raidname = "비아키스";
            break;
        case 3:
            raidname = "쿠크세이튼";
            break;
        case 4:
            raidname = "아브렐슈드";
            break;
        default:
            raidname = "오류";
            break;
    }

    const RaidEmbed = new MessageEmbed()
        .setColor('#6A5ACD')
        .setTitle(`[${raidname} 레이드] 정보`)
        .setDescription('어비스 레이드, 군단장 레이드 등의 보상을 알려드립니다.')
        .setTimestamp()
        .setFooter('꼬미봇 레이드 사전 - 꼬미봇 by 아뀨');

    switch (raidcode) {
        case 0:
            RaidEmbed.addField('**입장 (권장) 레벨**', '1370 / 1385 / 1400 (__1475 이상 보상 획득 불가__)');

            RaidEmbed.addField('**[노말] 난이도**', "1 페이즈 개수 / 2 페이즈 개수 / 3 페이즈 개수");

            RaidEmbed.addField("클리어 골드", `1,500 ${gold} / 800 ${gold} / 1,000 ${gold} (**총 3,300** ${gold})`);

            RaidEmbed.addField("아르고스의 어금니", "6개 / 2개 / 1개", true);
            RaidEmbed.addField("아르고스의 발톱", "16개 / 5개 / 2개", true);
            RaidEmbed.addField("아르고스의 선혈", "0~1개 / 1개 / 2개", true);
            RaidEmbed.addField("아르고스의 힘줄", "0~1개 / 1개 / 2개", true);

            RaidEmbed.addField("전설(3T) 장신구", "1개 / 1개 / 1개", true);
            RaidEmbed.addField("전설(3T) 어빌리티 스톤", "1개 / 1개 / 1개", true);

            RaidEmbed.addField("기대 보상 (확률)", "전설 장비(2T), 영웅~전설 각인서, 영웅~전설 카드");
            RaidEmbed.addField("더보기 보상", "파괴석 결정, 수호석 결정, 아르고스의 선혈 & 힘줄, 전설(3T) 장신구 & 돌, 전체 카드팩");
            break;
        case 1:
            raidname = "발탄";
            break;
        case 2:
            raidname = "비아키스";
            break;
        case 3:
            raidname = "쿠크세이튼";
            break;
        case 4:
            raidname = "아브렐슈드";
            break;
        default:
            raidname = "오류";
            break;
    }

    return RaidEmbed;
}

async function AbilityStone(Values) {
    var PlusAStr = "";
    var PlusBStr = "";
    var MinusStr = "";

    for (let i = 0; i < 10; i++) {
        if (Values.PlusA[i] === 1) {
            PlusAStr += "<:plus:884256058720256020> ";
        } else if (Values.PlusA[i] === 0) {
            PlusAStr += "<:not:884256058607030312> ";
        } else {
            PlusAStr += ":heavy_multiplication_x: ";
        }

        if (Values.PlusB[i] === 1) {
            PlusBStr += "<:plus:884256058720256020> ";
        } else if (Values.PlusB[i] === 0) {
            PlusBStr += "<:not:884256058607030312> ";
        } else {
            PlusBStr += ":heavy_multiplication_x: ";
        }

        if (Values.Minus[i] === 1) {
            MinusStr += "<:minus:884256058745442404> ";
        } else if (Values.Minus[i] === 0) {
            MinusStr += "<:not:884256058607030312> ";
        } else {
            MinusStr += ":heavy_multiplication_x: ";
        }
    }

    const StoneEmbed = new MessageEmbed()
        .setColor('#464964')
        .setTitle(`꼬미봇 어빌리티 스톤 세공 시뮬레이터 (베타!)`)
        .setDescription(`오늘의 운을 무료 돌로 시험해봅시다`)
        .setThumbnail('https://cdn-lostark.game.onstove.com/EFUI_IconAtlas/Ability/Ability_22.png')
        .addField('성공 확률', `**${Values.CurPercent}%**`, false)
        .addField(`증가 능력 1 <:plus:884256058720256020> x **${Values.CurASucc}**`, PlusAStr, false)
        .addField(`증가 능력 2 <:plus:884256058720256020> x **${Values.CurBSucc}**`, PlusBStr, false)
        .addField('균열 확률', `**${Values.CurPercent}%**`, false)
        .addField(`감소 능력 <:minus:884256058745442404> x **${Values.CurMSucc}**`, MinusStr, false)
        .setTimestamp()
        .setFooter('꼬미봇 세공기 - 꼬미봇 by 아뀨');

    return StoneEmbed;
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (isEmpty(client[interaction.message.id])) return;

    const buttonId = interaction.customId;

    if (buttonId != "PlusA" && buttonId != "PlusB" && buttonId != "Minus" && buttonId != "Delete") return;

    if (client[interaction.message.id].UserId != interaction.member.id) {
        return await interaction.reply({
            content: "본인의 돌만 깎아주세요!",
            ephemeral: true
        });
    }

    if (client[interaction.message.id]) {
        let message = interaction.message;
        let isSuccess = 0;
        let Values = client[interaction.message.id];

        if (Math.random() < Values.CurPercent / 100) {
            isSuccess = 1;
            if (Values.CurPercent > 25) {
                client[interaction.message.id].CurPercent -= 10;
            }
        } else {
            if (Values.CurPercent < 75) {
                client[interaction.message.id].CurPercent += 10;
            }
        }

        if (interaction.customId === "PlusA") {
            Values.PlusA[Values.CurATry] = isSuccess;
            Values.CurATry++;
            if (isSuccess === 1) {
                client[interaction.message.id].CurASucc++;
            }
            if (Values.CurATry === 10) {
                message.components[0].components[0].setDisabled(true);
                console.log(message.components[0].components[0].disabled);
            }
        } else if (interaction.customId === "PlusB") {
            Values.PlusB[Values.CurBTry] = isSuccess;
            Values.CurBTry++;
            if (isSuccess === 1) {
                client[interaction.message.id].CurBSucc++;
            }
            if (Values.CurBTry === 10) {
                message.components[0].components[1].setDisabled(true);
            }
        } else if (interaction.customId === "Minus") {
            Values.Minus[Values.CurMTry] = isSuccess;
            Values.CurMTry++;
            if (isSuccess === 1) {
                client[interaction.message.id].CurMSucc++;
            }
            if (Values.CurMTry === 10) {
                message.components[0].components[2].setDisabled(true);
            }
        } else if (interaction.customId === "Delete") {
            await interaction.message.delete();
            const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";
            return await interaction.channel.send(`${interaction.member.displayName}${adj} 화가 나서 돌을 버렸습니다.`)
        }

        const embed = await AbilityStone(Values);

        if (Values.CurATry === 10 && Values.CurBTry === 10 && Values.CurMTry === 10) {
            await interaction.update({
                embeds: [embed],
                components: [message.components[0]]
            });

            const ResultEmbed = new MessageEmbed()
                .setColor('#464964')
                .setTitle(`${interaction.member.displayName}의 세공 결과`)
                .setDescription('완성한 나의 돌은??')
                .addField(`증가 능력 1`, `<:plus:884256058720256020> x **${Values.CurASucc}**`, true)
                .addField(`증가 능력 2`, `<:plus:884256058720256020> x **${Values.CurBSucc}**`, true)
                .addField(`감소 능력`, `<:minus:884256058745442404> x **${Values.CurMSucc}**`, true)
                .addField('최종 결과', `무려 **${Values.CurASucc}${Values.CurBSucc}${Values.CurMSucc}** 돌을 깎았습니다!`)
                .setTimestamp()
                .setFooter('꼬미봇 세공기 - 꼬미봇 by 아뀨');

            await interaction.channel.send({
                embeds: [ResultEmbed],
                components: []
            });
        } else {
            await interaction.update({
                embeds: [embed],
                components: [message.components[0]]
            });
        }
    } else {
        await interaction.update("오류!");
    }
});

client.on('messageCreate', async message => {
    const content = message.content;
    const contentArr = content.split(" ");
    const command = contentArr[0];

    if (command === '!돌') {
        var Values = {
            UserId: message.member.id,
            PlusA: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            PlusB: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            Minus: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            CurPercent: 75,
            CurATry: 0,
            CurBTry: 0,
            CurMTry: 0,
            CurASucc: 0,
            CurBSucc: 0,
            CurMSucc: 0
        };

        const buttons = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('PlusA')
                .setLabel('증가 능력 1')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('PlusB')
                .setLabel('증가 능력 2')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('Minus')
                .setLabel('감소 능력')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('Delete')
                .setLabel('돌 버리기')
                .setStyle('SECONDARY')
            );

        var loading = await message.reply("세공 시뮬레이터 로딩중...");

        const embed = await AbilityStone(Values);

        loading.delete();

        var reply = await message.reply({
            embeds: [embed],
            components: [buttons]
        });

        client[reply.id] = Values;
    } else if (command === '!공지') {
        if (message.member.roles.cache.has('882486032841453678')) {
            let today = new Date();

            const alertembed = new MessageEmbed()
                .setColor('#ffd700')
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
    } else if (command === '!채팅') {
        if (message.member.roles.cache.has('882486032841453678')) {
            channel = client.channels.cache.get('881207628263456817');
            channel.send(message.content.substring(4, message.content.length));
        } else {
            await message.channel.send("관리자만 수행할 수 있습니다.");
        }
    } else if (command === '!인증') {
        const Keyword = message.content.substring(4, message.content.length);
        const encodeNickName = encodeURI(Keyword);
        const UserData = await UserSearch(encodeNickName);

        const userembed = new MessageEmbed()
            .setColor('#ffd700')
            .setTitle('인증 완료')
            .setAuthor('쪼꼬미 길드 인증 시스템')
            .setDescription(`\`\`캐릭터명\`\` : ${UserData.username}\n\`\`서버명\`\` : ${UserData.server}\n\`\`길드\`\` : ${UserData.guild}`)
            .addField('레벨 정보', `\`\`아이템 레벨\`\` : ${UserData.itemlevel}\n\`\`원정대 레벨\`\` : ${UserData.expedition}\n\`\`전투 레벨\`\` : ${UserData.level}`, true)
            .setTimestamp()
            .setFooter('정보 조회 - 꼬미봇 by 아뀨');

        if (UserData.username == "") {
            await message.channel.send("유저를 찾을 수 없습니다.");
        } else if (UserData.guild != "쪼꼬미" || UserData.server != "아브렐슈드") {
            await message.channel.send("쪼꼬미 길드에 가입된 캐릭터만 인증할 수 있습니다.");
        } else {
            await message.member.roles.add('881208641640890378');
            await message.member.roles.remove('882140536075599872')
            await message.member.setNickname(UserData.username);

            await message.channel.send({
                embeds: [userembed]
            });
        }
    } else if (command === '!유저') {
        const Keyword = message.content.substring(4, message.content.length);
        const encodeNickName = encodeURI(Keyword);
        const UserData = await UserSearch(encodeNickName);

        const userembed = new MessageEmbed()
            .setColor('#ffd700')
            .setTitle('기본 정보')
            .setURL(`https://lostark.game.onstove.com/Profile/Character/${encodeNickName}`)
            .setAuthor(`${UserData.username} - ${UserData.server}`, UserData.jobimg)
            .setDescription(`\`\`캐릭터명\`\` : ${UserData.username}\n\`\`서버명\`\` : ${UserData.server}\n\`\`직업\`\` : ${UserData.job}\n\`\`길드\`\` : ${UserData.guild}\n\`\`칭호\`\` : ${UserData.title}`)
            .setThumbnail(UserData.jobimg)
            .addField('영지 정보', `\`\`영지 이름\`\` : ${UserData.wisdom[2]}\n\`\`영지 레벨\`\` : ${UserData.wisdom[1]}`, false)
            .addField('각인 정보', `${UserData.engraveinfo}`, false)
            .addField('레벨 정보', `\`\`아이템 레벨\`\` : ${UserData.itemlevel}\n\`\`원정대 레벨\`\` : ${UserData.expedition}\n\`\`전투 레벨\`\` : ${UserData.level}`, true)
            .addField('전투 특성', `\`\`치명\`\` : ${UserData.battleablility[1]}\n\`\`특화\`\` : ${UserData.battleablility[3]}\n\`\`신속\`\` : ${UserData.battleablility[7]}`, true)
            .addField('기본 특성', `\`\`공격력\`\` : ${UserData.basicability[1]}\n\`\`최대 생명력\`\` : ${UserData.basicability[3]}`, true)
            .setTimestamp()
            .setFooter('정보 조회 - 꼬미봇 by 아뀨');

        if (UserData.username == "") {
            await message.channel.send("유저를 찾을 수 없습니다.");
        } else {
            await message.channel.send({
                embeds: [userembed]
            });
        }
    } else if (command === "!마리") {
        const embed = await MariShop();

        await message.channel.send({
            embeds: [embed]
        });
    } else if (command === "!일일") {
        const embed = await DailyContent();

        await message.channel.send({
            embeds: [embed]
        });
    } else if (command === "!정보") {
        const raidname = message.content.substring(4, message.content.length);
        const embed = await RaidInfo(raidname);

        await message.channel.send({
            embeds: [embed]
        });
    } else if (command === "!재생") {
        const voicechannel = message.member.voice.channel;

        if (!voicechannel) {
            return message.channel.send("우선 음성 채널에 참여해야 합니다.");
        }

        try {
            const searchkeyword = message.content.substring(4, message.content.length);

            var urls = [];
            var embedcontent = "";

            const videos = await youtube.searchVideos(searchkeyword, 5);

            if (videos.length < 5) return message.channel.send('충분한 노래를 검색하지 못했습니다.');

            for (let i = 0; i < videos.length; i++) {
                urls[i] = videos[i].url;
                embedcontent += `**${i + 1} :** ${videos[i].title}\n`;
            }

            const musicselectembed = new MessageEmbed()
                .setColor('#c4302b')
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
                            time: 20000,
                            errors: ['time']
                        })
                        .then(async collected => {
                            answer = collected.first(1);
                            collected.each(message => message.delete());

                            selectnum = parseInt(answer);

                            if (selectnum >= 1 && selectnum <= 5) {

                                const index = selectnum - 1;
                                const url = urls[index];
                                const title = videos[index].title;
                                const desc = videos[index].description;
                                const thumbnail = videos[index].thumbnails.high.url;

                                const songdata = {
                                    url,
                                    title,
                                    desc,
                                    thumbnail,
                                    message,
                                    voicechannel
                                }

                                MusicData.queue.push(songdata);

                                const connection = joinVoiceChannel({
                                    channelId: voicechannel.id,
                                    guildId: message.guild.id,
                                    adapterCreator: message.guild.voiceAdapterCreator
                                });

                                LastConnection = connection;

                                sentMessage.delete();

                                playMusic(connection, message);
                            } else {
                                sentMessage.delete();
                                message.channel.send(`재생이 취소되었습니다.`);
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            sentMessage.delete();
                            message.channel.send("시간이 초과되었습니다.");
                        });
                });
        } catch (err) {
            console.log(err);
            return message.channel.send("노래를 불러오는 과정에서 오류가 발생했습니다.");
        }
    } else if (command === "!나가") {
        const voicechannel = message.member.voice.channel;

        if (!voicechannel) {
            return message.channel.send("우선 음성 채널에 참여해야 합니다.");
        }
        if (LastConnection) {
            if (voicechannel.id == message.guild.me.voice.channel.id) {
                await LastConnection.destroy();
                await message.channel.send("꼬미봇 플레이어를 종료합니다.");
            } else {
                return message.channel.send("봇과 같은 음성 채널에 있어야 합니다.");
            }
        }
    } else if (command === "!다음") {
        const voicechannel = message.member.voice.channel;

        if (!voicechannel) {
            return message.channel.send("우선 음성 채널에 참여해야 합니다.");
        }

        if (voicechannel.id == message.guild.me.voice.channel.id) {
            await MusicPlayer.stop();
        } else {
            return message.channel.send("봇과 같은 음성 채널에 있어야 합니다.");
        }
    } else if (command === "!목록") {
        var queuestr = "";

        if (!isEmpty(MusicData.queue[0])) {
            for (let i = 0; i < MusicData.queue.length; i++) {
                queuestr += `**${i + 1} : ${MusicData.queue[i].title}**\n`;
            }

            const queueembed = new MessageEmbed()
                .setColor('#c4302b')
                .setTitle(`예약된 음악 리스트`)
                .setDescription(`${queuestr}`)
                .setTimestamp()
                .setFooter('꼬미봇 플레이어 - 꼬미봇 by 아뀨');

            await message.channel.send({
                embeds: [queueembed]
            });
        } else {
            await message.channel.send("예약된 노래가 없습니다.");
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

        if (typeof client[interaction.message.id] == 'undefined') return;

        if (client[interaction.message.id].attendlist.includes(interaction.member.displayName)) {
            var newembed = interaction.message.embeds[0];
            return await interaction.update({
                embeds: [newembed]
            });
        }

        client[interaction.message.id].attendlist.push(interaction.member.displayName);

        var fieldcontent = "";

        for (let i = 0; i < client[interaction.message.id].attendlist.length; i++) {
            fieldcontent += `**${i + 1} : ${client[interaction.message.id].attendlist[i]}**\n`;
        }

        var newembed = interaction.message.embeds[0];

        newembed.fields[0].value = fieldcontent;

        await interaction.update({
            embeds: [newembed]
        });
    } else if (interaction.customId == 'cancel') {

        if (typeof client[interaction.message.id] == 'undefined') return;

        if (!client[interaction.message.id].attendlist.includes(interaction.member.displayName)) {
            var newembed = interaction.message.embeds[0];
            return await interaction.update({
                embeds: [newembed]
            });
        }

        const index = client[interaction.message.id].attendlist.indexOf(interaction.member.displayName);

        client[interaction.message.id].attendlist.splice(index, 1);

        var fieldcontent = "";

        for (let i = 0; i < client[interaction.message.id].attendlist.length; i++) {
            fieldcontent += `**${i + 1} : ${client[interaction.message.id].attendlist[i]}**\n`;
        }

        if (isEmpty(fieldcontent)) {
            fieldcontent = `**참여 인원이 없습니다**`
        }

        var newembed = interaction.message.embeds[0];

        newembed.fields[0].value = fieldcontent;

        await interaction.update({
            embeds: [newembed]
        });
    } else if (interaction.customId == 'stop') {

        if (typeof client[interaction.message.id] == 'undefined') return;

        if (interaction.member.id != client[interaction.message.id].authorid) {
            return await interaction.reply({
                content: "파티장만 모집을 취소할 수 있습니다",
                ephemeral: true
            });
        } else {
            const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

            const embed = new MessageEmbed()
                .setAuthor("꼬미봇")
                .setColor("#e368cf")
                .setTitle(`${interaction.member.displayName}${adj} 파티 모집을 취소했습니다.`)
                .setDescription(`파티 모집이 취소되었습니다.`)
                .setTimestamp()
                .setFooter("꼬미봇 by 아뀨");

            await interaction.update({
                embeds: [embed],
                components: []
            });
        }
    } else if (interaction.customId == 'vnormal') {

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 발탄 노말 파티를 모집중!`)
            .setDescription(`군단장 발탄 노말 레이드 파티입니다.\n아래 버튼을 눌러 참여 의사를 알려주세요!`)
            .addField('참여 인원', `**1 : ${interaction.member.displayName}**`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

        const attendcomp = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('attend')
                .setLabel('참여')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('cancel')
                .setLabel('참여 취소')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('stop')
                .setLabel('모집 취소')
                .setStyle('SECONDARY'),
            );

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216045615022160');

        await channel.send({
            embeds: [embed],
            components: [attendcomp]
        }).then(function (message) {
            const partyrecruit = message.id;
            client[partyrecruit] = {
                authorid: interaction.member.id,
                attendlist: [interaction.member.displayName]
            };
        });
    } else if (interaction.customId == 'vhard') {

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 발탄 하드 파티를 모집중!`)
            .setDescription(`군단장 발탄 하드 레이드 파티입니다.\n아래 버튼을 눌러 참여 의사를 알려주세요!`)
            .addField('참여 인원', `**1 : ${interaction.member.displayName}**`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

        const attendcomp = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('attend')
                .setLabel('참여')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('cancel')
                .setLabel('참여 취소')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('stop')
                .setLabel('모집 취소')
                .setStyle('SECONDARY'),
            );

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216045615022160');

        await channel.send({
            embeds: [embed],
            components: [attendcomp]
        }).then(function (message) {
            const partyrecruit = message.id;
            client[partyrecruit] = {
                authorid: interaction.member.id,
                attendlist: [interaction.member.displayName]
            };
        });
    } else if (interaction.customId == 'bnormal') {

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 비아키스 노말 파티를 모집중!`)
            .setDescription(`군단장 비아키스 노말 레이드 파티입니다.\n아래 버튼을 눌러 참여 의사를 알려주세요!`)
            .addField('참여 인원', `**1 : ${interaction.member.displayName}**`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

        const attendcomp = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('attend')
                .setLabel('참여')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('cancel')
                .setLabel('참여 취소')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('stop')
                .setLabel('모집 취소')
                .setStyle('SECONDARY'),
            );

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216179287515206');

        await channel.send({
            embeds: [embed],
            components: [attendcomp]
        }).then(function (message) {
            const partyrecruit = message.id;
            client[partyrecruit] = {
                authorid: interaction.member.id,
                attendlist: [interaction.member.displayName]
            };
        });
    } else if (interaction.customId == 'bhard') {

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 비아키스 하드 파티를 모집중!`)
            .setDescription(`군단장 비아키스 하드 레이드 파티입니다.\n아래 버튼을 눌러 참여 의사를 알려주세요!`)
            .addField('참여 인원', `**1 : ${interaction.member.displayName}**`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

        const attendcomp = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('attend')
                .setLabel('참여')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('cancel')
                .setLabel('참여 취소')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('stop')
                .setLabel('모집 취소')
                .setStyle('SECONDARY'),
            );

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216179287515206');

        await channel.send({
            embeds: [embed],
            components: [attendcomp]
        }).then(function (message) {
            const partyrecruit = message.id;
            client[partyrecruit] = {
                authorid: interaction.member.id,
                attendlist: [interaction.member.displayName]
            };
        });
    } else if (interaction.customId == 'rehearsal') {

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 쿠크세이튼 리허설 파티 모집`)
            .setDescription(`군단장 쿠크세이튼 리허설 레이드 파티입니다.\n아래 버튼을 눌러 참여 의사를 알려주세요!`)
            .addField('참여 인원', `**1 : ${interaction.member.displayName}**`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

        const attendcomp = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('attend')
                .setLabel('참여')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('cancel')
                .setLabel('참여 취소')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('stop')
                .setLabel('모집 취소')
                .setStyle('SECONDARY'),
            );

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216191409041408');

        await channel.send({
            embeds: [embed],
            components: [attendcomp]
        }).then(function (message) {
            const partyrecruit = message.id;
            client[partyrecruit] = {
                authorid: interaction.member.id,
                attendlist: [interaction.member.displayName]
            };
        });
    } else if (interaction.customId == 'snormal') {

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 쿠크세이튼 노말 파티를 모집중!`)
            .setDescription(`군단장 쿠크세이튼 노말 레이드 파티입니다.\n아래 버튼을 눌러 참여 의사를 알려주세요!`)
            .addField('참여 인원', `**1 : ${interaction.member.displayName}**`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

        const attendcomp = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('attend')
                .setLabel('참여')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('cancel')
                .setLabel('참여 취소')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('stop')
                .setLabel('모집 취소')
                .setStyle('SECONDARY'),
            );

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216191409041408');

        await channel.send({
            embeds: [embed],
            components: [attendcomp]
        }).then(function (message) {
            const partyrecruit = message.id;
            client[partyrecruit] = {
                authorid: interaction.member.id,
                attendlist: [interaction.member.displayName]
            };
        });
    } else if (interaction.customId == 'shard') {

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 쿠크세이튼 하드 파티를 모집중!`)
            .setDescription(`군단장 쿠크세이튼 하드 레이드 파티입니다.\n아래 버튼을 눌러 참여 의사를 알려주세요!`)
            .addField('참여 인원', `**1 : ${interaction.member.displayName}**`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

        const attendcomp = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('attend')
                .setLabel('참여')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('cancel')
                .setLabel('참여 취소')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('stop')
                .setLabel('모집 취소')
                .setStyle('SECONDARY'),
            );

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216191409041408');

        await channel.send({
            embeds: [embed],
            components: [attendcomp]
        }).then(function (message) {
            const partyrecruit = message.id;
            client[partyrecruit] = {
                authorid: interaction.member.id,
                attendlist: [interaction.member.displayName]
            };
        });
    } else if (interaction.customId == 'dejavu') {

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 아브렐슈드 데자뷰 파티 모집`)
            .setDescription(`군단장 아브렐슈드 데자뷰 레이드 파티입니다.\n아래 버튼을 눌러 참여 의사를 알려주세요!`)
            .addField('참여 인원', `**1 : ${interaction.member.displayName}**`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

        const attendcomp = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('attend')
                .setLabel('참여')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('cancel')
                .setLabel('참여 취소')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('stop')
                .setLabel('모집 취소')
                .setStyle('SECONDARY'),
            );

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216205531267132');

        await channel.send({
            embeds: [embed],
            components: [attendcomp]
        }).then(function (message) {
            const partyrecruit = message.id;
            client[partyrecruit] = {
                authorid: interaction.member.id,
                attendlist: [interaction.member.displayName]
            };
        });
    } else if (interaction.customId == 'anormal') {

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 아브렐슈드 노말 파티를 모집중!`)
            .setDescription(`군단장 아브렐슈드 노말 레이드 파티입니다.\n아래 버튼을 눌러 참여 의사를 알려주세요!`)
            .addField('참여 인원', `**1 : ${interaction.member.displayName}**`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

        const attendcomp = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('attend')
                .setLabel('참여')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('cancel')
                .setLabel('참여 취소')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('stop')
                .setLabel('모집 취소')
                .setStyle('SECONDARY'),
            );

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216205531267132');

        await channel.send({
            embeds: [embed],
            components: [attendcomp]
        }).then(function (message) {
            const partyrecruit = message.id;
            client[partyrecruit] = {
                authorid: interaction.member.id,
                attendlist: [interaction.member.displayName]
            };
        });
    } else if (interaction.customId == 'ahard') {

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 아브렐슈드 하드 파티를 모집중!`)
            .setDescription(`군단장 아브렐슈드 하드 레이드 파티입니다.\n아래 버튼을 눌러 참여 의사를 알려주세요!`)
            .addField('참여 인원', `**1 : ${interaction.member.displayName}**`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

        const attendcomp = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('attend')
                .setLabel('참여')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('cancel')
                .setLabel('참여 취소')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('stop')
                .setLabel('모집 취소')
                .setStyle('SECONDARY'),
            );

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216205531267132');

        await channel.send({
            embeds: [embed],
            components: [attendcomp]
        }).then(function (message) {
            const partyrecruit = message.id;
            client[partyrecruit] = {
                authorid: interaction.member.id,
                attendlist: [interaction.member.displayName]
            };
        });
    } else if (interaction.customId == 'inormal') {

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 일리아칸 노말 파티를 모집중!`)
            .setDescription(`군단장 일리아칸 노말 레이드 파티입니다.\n아래 버튼을 눌러 참여 의사를 알려주세요!`)
            .addField('참여 인원', `**1 : ${interaction.member.displayName}**`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

        const attendcomp = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('attend')
                .setLabel('참여')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('cancel')
                .setLabel('참여 취소')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('stop')
                .setLabel('모집 취소')
                .setStyle('SECONDARY'),
            );

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216529834840177');

        await channel.send({
            embeds: [embed],
            components: [attendcomp]
        }).then(function (message) {
            const partyrecruit = message.id;
            client[partyrecruit] = {
                authorid: interaction.member.id,
                attendlist: [interaction.member.displayName]
            };
        });
    } else if (interaction.customId == 'ihard') {

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 일리아칸 하드 파티를 모집중!`)
            .setDescription(`군단장 일리아칸 하드 레이드 파티입니다.\n아래 버튼을 눌러 참여 의사를 알려주세요!`)
            .addField('참여 인원', `**1 : ${interaction.member.displayName}**`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

        const attendcomp = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('attend')
                .setLabel('참여')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('cancel')
                .setLabel('참여 취소')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('stop')
                .setLabel('모집 취소')
                .setStyle('SECONDARY'),
            );

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216529834840177');

        await channel.send({
            embeds: [embed],
            components: [attendcomp]
        }).then(function (message) {
            const partyrecruit = message.id;
            client[partyrecruit] = {
                authorid: interaction.member.id,
                attendlist: [interaction.member.displayName]
            };
        });
    } else if (interaction.customId == 'knormal') {

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 카멘 노말 파티를 모집중!`)
            .setDescription(`군단장 카멘 노말 레이드 파티입니다.\n아래 버튼을 눌러 참여 의사를 알려주세요!`)
            .addField('참여 인원', `**1 : ${interaction.member.displayName}**`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

        const attendcomp = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('attend')
                .setLabel('참여')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('cancel')
                .setLabel('참여 취소')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('stop')
                .setLabel('모집 취소')
                .setStyle('SECONDARY'),
            );

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216544116465674');

        await channel.send({
            embeds: [embed],
            components: [attendcomp]
        }).then(function (message) {
            const partyrecruit = message.id;
            client[partyrecruit] = {
                authorid: interaction.member.id,
                attendlist: [interaction.member.displayName]
            };
        });
    } else if (interaction.customId == 'khard') {

        const adj = checkBatchimEnding(interaction.member.displayName) ? "이" : "가";

        const embed = new MessageEmbed()
            .setAuthor("꼬미봇")
            .setColor("#e368cf")
            .setTitle(`${interaction.member.displayName}${adj} 카멘 하드 파티를 모집중!`)
            .setDescription(`군단장 카멘 하드 레이드 파티입니다.\n아래 버튼을 눌러 참여 의사를 알려주세요!`)
            .addField('참여 인원', `**1 : ${interaction.member.displayName}**`)
            .setTimestamp()
            .setFooter("꼬미봇 by 아뀨");

        const attendcomp = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('attend')
                .setLabel('참여')
                .setStyle('PRIMARY'),
                new MessageButton()
                .setCustomId('cancel')
                .setLabel('참여 취소')
                .setStyle('DANGER'),
                new MessageButton()
                .setCustomId('stop')
                .setLabel('모집 취소')
                .setStyle('SECONDARY'),
            );

        interaction.update({
            content: "파티 생성이 완료되었습니다.",
            embeds: [],
            components: []
        });

        channel = client.channels.cache.get('881216544116465674');

        await channel.send({
            embeds: [embed],
            components: [attendcomp]
        }).then(function (message) {
            const partyrecruit = message.id;
            client[partyrecruit] = {
                authorid: interaction.member.id,
                attendlist: [interaction.member.displayName]
            };
        });
    }
});

// Login to Discord with your client's token
client.login(token);