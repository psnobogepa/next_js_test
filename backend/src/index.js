'use strict';

const cronTasks = require('./cron/tasks');

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    cronTasks.init(strapi);
  },
};

