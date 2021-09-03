const axios = require('axios');
const cheerio = require('cheerio');

const {
    MessageEmbed,
} = require('discord.js');

function isEmpty(str) {

    if (typeof str == "undefined" || str == null || str == "")
        return true;
    else
        return false;
}

exports.Auth = async function (message) {
    const encodeNickName = encodeURI(message.content.substring(4, message.content.length));
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
        await message.member.roles.add('881208641640890378');
        await message.member.roles.remove('882140536075599872')
        await message.member.setNickname(userName);

        await message.channel.send({
            embeds: [userembed]
        });
    }
}

exports.User = async function (message) {
    const encodeNickName = encodeURI(message.content.substring(4, message.content.length));
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
}

exports.Mary = async function (message) {
    const html = await axios.get(`https://lostark.game.onstove.com/Shop#mari`);
    const $ = cheerio.load(html.data);

    var ItemNames = [];

    $("div.lui-tab__content > ul > li > div > span.item-name").each(function (i) {
        ItemNames[i] = $(this).text();
    });

    var ItemPrices = [];

    $("div.lui-tab__content > ul > li > div > div.area-amount > span.amount").each(function (i) {
        ItemPrices[i] = $(this).text();
    });

    const MaryEmbed = new MessageEmbed()
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
}