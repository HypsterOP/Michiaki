/* eslint-disable no-useless-constructor */
const Event = require("../../../structures/event");

module.exports = class GuildMemberUpdateEvent extends Event {
  constructor(...args) {
    super(...args);
  }

  async do(member, newmember) {
    if (member.nickname === newmember.nickname) {
      return;
    }

    const { nickname } = this.mongoose.models;
    let data = await nickname.findOne({
      guild: member.guild.id,
      user: member.user.id
    });
    log.success(
      "Mongoose Database",
      member.user.username + " new nickname was registered"
    );
    if (!data) {
      const collect = {};
      collect.guild = member.guild.id;
      collect.user = member.user.id;
      collect.past = member.nickname || member.user.username;
      collect.current = newmember.nickname || newmember.user.username;
      collect.list = [];
      collect.list.push({
        past: collect.past,
        current: collect.current,
        date: collect.date
      });
      data = new nickname(collect);
    } else {
      data.past = member.nickname || member.user.username;
      data.current = newmember.nickname || newmember.user.username;
      data.list.push({
        past: data.past,
        current: data.current,
        date: data.date
      });
    }

    data.save();
  }
};
