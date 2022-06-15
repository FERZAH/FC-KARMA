const banData = require('../models/kalkmazban.js');
module.exports = async member => {

    let data = await banData.findOne({ guildID: member.guild.id });
    if (data && data.Members.includes(member.id)) {
        await member.ban({ reason: "FC Kalkmaz Ban" }).catch(e => { });
    }
};


module.exports.event = {
    name: "guildMemberAdd"
}