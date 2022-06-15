const Discord = require("discord.js");
const snipe = require('../models/snipe');
const ayar = require('../settings.js');
module.exports = async (message) => {
    if (!message.guild) return;
    let yasaklı = ['discord.gg', '.gg', 'https://discord.gg/'];
    if (message.author.bot || message.content.startsWith(ayar.bot.botPrefix)) return;
    if (yasaklı.some(s => message.content.toLowerCase().includes(s))) return;
    let data = new snipe({
        guildID: message.guild.id,
        userID: message.author.id,
        mesaj: message.content,
        zaman: Date.now()
    });
    data.save();
};

module.exports.event = {
    name: "messageDelete"
}