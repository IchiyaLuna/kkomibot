const Youtube = require('simple-youtube-api');
const playdl = require('play-dl');
const {
    youtubeAPI
} = require('./config.json');
const youtube = new Youtube(youtubeAPI);

const {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} = require('@discordjs/voice');

const {
    MessageEmbed,
} = require('discord.js');

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
        this.processQueue();
    }
});

exports.processQueue = async function () {
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
            .setColor('#0099ff')
            .setTitle(`지금 재생중 - ${nextTrack.title}`)
            .setDescription(`${nextTrack.desc}`)
            .setImage(nextTrack.thumbnail)
            .setTimestamp()
            .setFooter('꼬미봇 플레이어 - 꼬미봇 by 아뀨');

        if (MusicData.queue[0]) {
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
                .setColor('#0099ff')
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
            .setColor('#0099ff')
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
            .setColor('#0099ff')
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

exports.Play = async function (message) {
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
                    .then(async collected => {
                        answer = collected.first(1);
                        collected.each(message => message.delete());
                        sentMessage.delete();

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

                            playMusic(connection, message);
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

exports.Leave = async function (message) {
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
}

exports.Next = async function (message) {
    const voicechannel = message.member.voice.channel;

    if (!voicechannel) {
        return message.channel.send("우선 음성 채널에 참여해야 합니다.");
    }

    if (voicechannel.id == message.guild.me.voice.channel.id) {
        await MusicPlayer.stop();
    } else {
        return message.channel.send("봇과 같은 음성 채널에 있어야 합니다.");
    }
}