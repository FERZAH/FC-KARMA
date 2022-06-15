const Discord = require("discord.js")
const { Database, Logger } = require("../../helpers/functions");
const ayar = require('../../settings.js')
module.exports.run = async (client, message, args, embed) => {
    if (ayar.roles.muteStaff.some(s => !message.member.roles.cache.has(s)) && !message.member.permissions.has("ADMINISTRATOR")) return message.channel.send({ embeds: [embed.setDescription(`${message.author}, Bu komutu kullanmak için yeterli yetkiye sahip değilsin!`)] }).sil(7);
    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.channel.send({ embeds: [embed.setDescription(`Hatalı kullanım örnek: \`${this.config.usage}\``)] }).sil(7);
    if (!member.voice.channel) return message.channel.send({ embeds: [embed.setDescription(`${member}, Adlı kullanıcı bir ses kanalında değil!`)] }).sil(7);
    let chn = member.voice.channel;
    await member.voice.kick().then(m => {
        message.channel.send({ embeds: [embed.setDescription(`${member}, Adlı kullanıcının ${chn} kanalından bağlantısı kesildi!`)] }).sil(7);
    }).catch(e => { })
};
exports.config = {
    name: "kes",
    usage: `${ayar.bot.botPrefix}kes [@Cross/ID]`,
    guildOnly: true,
    aliases: [],
    cooldown: 3000
};