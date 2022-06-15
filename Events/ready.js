const Discord = require("discord.js");
const ayar = require('../settings.js');
const modsData = require('../Models/Mods');
const { Kontrol } = require('../helpers/functions');
const client = global.client;
module.exports = async () => {
    let guild = client.guilds.cache.get(ayar.guild.guildID);
    if (!guild) return;
    let data = await modsData.findOne({ guildID: ayar.guild.guildID })
    if (!data) await new modsData({ guildID: ayar.guild.guildID, tagMode: false, nameMode: false }).save();
    console.log('' + client.user.tag + ' ismiyle giriş yapıldı!')
    client.user.setActivity("FC was here!");
    client.user.setStatus('dnd');
    setInterval(async () => {
        Kontrol.mute(guild)
        Kontrol.vmute(guild)
        Kontrol.yasaklıtag(guild)
    }, 7000)
};

module.exports.event = {
    name: "ready"
}