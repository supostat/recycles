const axios = require('axios');
const CronJob = require('cron').CronJob;
const fs = require('fs');
const moment = require('moment');

let attempts = 0;

const interval = setInterval(() => {
  attempts = attempts + 1;
  if (attempts > 10) {
    clearInterval(interval);
  }
  fs.writeFile(moment().format('DD_MM_YYYY_hh_mm_ss_SSSS'), 'start', (err) => {
    if (err) throw err;
  });
}, 2000)

