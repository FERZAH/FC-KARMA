const Discord = require("discord.js")
const client = (global.client = new Discord.Client({ 'intents': [32767, "GUILD_INVITES"] }));
const ayar = require("./settings.js")
const fs = require("fs");
const moment = require('moment');
moment.locale('tr');
const mongoose = require('mongoose');
mongoose.connect(ayar.bot.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true }).then(m => setTimeout(() => { console.log('Database bağlandı!') }, 3000)).catch(err => setTimeout(() => { console.log('Database bağlanamadı!!') }, 3000));
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

//Command Handler
let commandFiles = fs.readdirSync('./Commands/');
commandFiles.forEach(async (files, err) => {
  if (err) console.error(err);
  let Command = fs.readdirSync(`./Commands/${files}`);
  Command.forEach(file => {
    if (!file.endsWith('.js')) return;
    let props = require(`./Commands/${files}/${file}`);
    client.commands.set(props.config.name, props);
    props.config.aliases.forEach(alias => {
      client.aliases.set(alias, props.config.name);
    });
  });
});
console.log(`${client.commands.size} komut yüklendi.`);

//Event Handler
const eventFiles = fs.readdirSync('./Events');
eventFiles.forEach(files => {
  const prop = require(`./Events/${files}`)
  if (!prop.event) return
  client.on(prop.event.name, prop);
});
console.log(`${eventFiles.length} event yüklendi.`);

//Bot login
client.login(ayar.bot.botToken).catch(err => { console.log('Bota giriş yapılırken başarısız olundu!!') })


client.on("messageCreate", async message => {
  if (message.author.bot || !message.guild || !message.content.toLowerCase().startsWith(ayar.bot.botPrefix)) return;
  if (!ayar.bot.botOwner.includes(message.author.id) && message.author.id !== message.guild.ownerId) return;
  let args = message.content.split(' ').slice(1);
  let command = message.content.split(' ')[0].slice(ayar.bot.botPrefix.length);
  //let embed = new Discord.MessageEmbed().setColor("#00ffdd").setAuthor({name: message.author.tag, iconURL:  message.author.avatarURL({ dynamic: true, })}).setFooter({text: `FC was here!`}).setTimestamp();

  // Eval
  if (command === "eval" && ayar.bot.botOwner.includes(message.author.id)) {
    if (!args[0]) return message.channel.send({ content: `Kod belirtilmedi` });
    let code = args.join(' ');
    function clean(text) {
      if (typeof text !== 'string') text = require('util').inspect(text, { depth: 0 })
      text = text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
      return text;
    };
    try {
      var evaled = clean(await eval(code));
      if (evaled.match(new RegExp(`${client.token}`, 'g'))) evaled.replace(client.token, "Yasaklı komut");
      message.channel.send({
        content: `
        
        \`\`\`${evaled.replace(client.token, "Yasaklı komut")}\`\`\`
        `, code: "js", split: true
      });
    } catch (err) {
      message.channel.send({ content: `${err}`, code: 'js', split: true })
    }
  }
});

//Hoşgeldin mesajı ve rol verme
client.on("guildMemberAdd", async member => {
  if (!member) return;
  if (ayar.guild.tags.some(s => member.user.username.includes(s) || member.user.discriminator.includes(s) || member.user.tag.includes(s))) await member.roles.add(ayar.roles.tagRole).catch(e => { })
  let isMemberFake = (Date.now() - member.user.createdTimestamp) < 7 * 24 * 60 * 60 * 1000;

  if (isMemberFake) {
    let olusturma = `(\`${moment.duration(Date.now() - member.user.createdTimestamp).locale('tr').format('Y [yıl], M [Ay], D [Gün]')}\`)`
    await member.roles.set([ayar.roles.suspecious]).catch(e => { });
    await member.setNickname(ayar.guild.suspeciousName).catch(e => { });
    let channel = client.channels.cache.get(ayar.channels.registerChannel)


    if (channel) channel.send({
      content: `
${member}, Adlı kullanıcı sunucuya katıldı fakat hesabı yeni olduğu için şüpheli hesap rolünü verdim. ${olusturma}`
    });



  } else {
    member.roles.add(ayar.roles.unregisterRoles).catch(e => { });
    member.setNickname(ayar.guild.defaultName).catch(e => { });

    client.channels.cache.get(ayar.channels.registerChannel).send({
      content: `
:tada: Sunucumuz'a hoş geldin ${member}!
                
Hesabın ${moment(member.user.createdTimestamp).locale('tr').format('LLL')} tarihinde (${moment.duration(Date.now() - member.user.createdTimestamp).locale('tr').format('Y [yıl], M [Ay], D [Gün]')}) önce oluşturulmuş.

Sunucu kurallarımız ${client.channels.cache.get(ayar.channels.rulesChannel)} kanalında belirtilmiştir. Unutma sunucu içerisinde ki ceza işlemlerin kuralları okuduğunu varsayarak gerçekleştirilecek.

Sunucumuzun **${member.guild.memberCount}**. üyesi oldun! İyi eğlenceler :tada::tada::tada:`
    })

  }
});

//Gece 00 da limit data sıfırlama
let limit = require('./models/limit.js');
setInterval(async () => {
  moment.locale('tr')
  var nowDate = moment().format("HH:mm:ss")
  if (nowDate === "00:00:00") {
    limit.deleteOne({ guildID: ayar.guild.guildID }).catch(e => { })
  }
}, 500)

//Tag alana rol
client.on('userUpdate', async (old, nev) => {
  let guild = await (client.guilds.cache.get(ayar.guild.guildID))
  let uye = guild.members.cache.get(old.id)

  let embed = new Discord.MessageEmbed().setColor('RANDOM').setFooter({ text: 'FC was here.' }).setTimestamp()
  let tagrol = guild.roles.cache.get(ayar.roles.tagRole);
  let log = guild.channels.cache.get(ayar.channels.tagLog)
  if (old.username != nev.username || old.tag != nev.tag || old.discriminator != nev.discriminator) {

    if (ayar.guild.tags.some(tag => nev.tag.toLowerCase().includes(tag))) {
      if (!uye.roles.cache.has(tagrol.id)) {
        uye.roles.add(tagrol.id).catch(e => { });
        uye.setNickname(uye.displayName.replace(ayar.guild.defaultTag, ayar.guild.tag)).catch(e => { });
        if (log) log.send({ embeds: [embed.setDescription(`${uye}, Adlı kullanıcı tagımızı alarak ailemize katıldı!`)] })
      } else {
        uye.setNickname(uye.displayName.replace(ayar.guild.defaultTag, ayar.guild.tag)).catch(e => { });
      }

    } else {
      if (!uye.roles.cache.has(tagrol.id)) {
        uye.setNickname(uye.displayName.replace(ayar.guild.tag, ayar.guild.defaultTag)).catch(e => { });
      } else {
        uye.roles.remove(uye.roles.cache.filter(s => s.position >= tagrol.position)).catch(e => { });
        uye.setNickname(uye.displayName.replace(ayar.guild.tag, ayar.guild.defaultTag)).catch(e => { });
        if (log) log.send({ embeds: [embed.setDescription(`${uye}, Adlı kullanıcı tagımızı bırakarak ailemizden ayrıldı!`)] })

      }
    }
  }
});

//Yasaklı tag kontrol
const tagData = require('./models/yasaklıtag.js');
client.on('userUpdate', async (old, nev) => {
  let guild = await (client.guilds.cache.get(ayar.guild.guildID))
  let uye = guild.members.cache.get(old.id)
  let data = await tagData.find({ guildID: uye.guild.id }, async (err, data) => {
    if (!data || !data.length) return;
    if (data) {
      let taglar = data.map(s => s.Tag)
      if (taglar.some(tag => nev.tag.toLowerCase().includes(tag))) {
        await uye.roles.set([ayar.roles.yasaklıTag])
        await uye.setNickname('Yasaklı | Tag')
        await guild.channels.cache.get(ayar.channels.yasaklıtagLog).send({ embeds: [new Discord.MessageEmbed().setDescription(`${uye} Adlı kullanıcı sunucumuzun yasaklı tagında bulunduğu için yasaklı tag rolünü verdim`)] })
      } else if (uye.roles.cache.has(ayar.roles.yasaklıTag)) {
        await uye.roles.set(ayar.roles.unregisterRoles)
        await uye.setNickname('• İsim | Yaş')
        await guild.channels.cache.get(ayar.channels.yasaklıtagLog).send({ embeds: [new Discord.MessageEmbed().setDescription(`${uye} Adlı kullanıcı sunucumuzun yasaklı tagını kaldırdıgı için yasaklı tag rolünü aldım`)] })

      }
    }
  })
});

