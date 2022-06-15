const Discord = require("discord.js")
const { Database, Logger } = require("../../helpers/functions");
const ayar = require('../../settings.js')
module.exports.run = async (client, message, args, embed) => {
    if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send({ embeds: [embed.setDescription(`${message.author}, Bu komutu kullanmak için yeterli yetkiye sahip değilsin!`)] }).sil(7);
    await message.channel.send({ embeds: [embed.setDescription(`**${message.guild.members.cache.filter(s => s.roles.cache.size <= 1).size}** Adet kullanıcıya kayıtsız rolü verildi.`)] }).sil(7);
    message.guild.members.cache.filter(s => s.roles.cache.size <= 1).forEach(s => s.roles.add(ayar.roles.unregisterRoles).catch(e => { }))
};
exports.config = {
    name: "rolsüzver",
    usage: `${ayar.bot.botPrefix}rolsüzver`,
    guildOnly: true,
    aliases: [],
    cooldown: 3000
};