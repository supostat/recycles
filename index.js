const axios = require('axios');
const CronJob = require('cron').CronJob;
const fs = require('fs');
const moment = require('moment');

let date = new Date(2018, 9, 31, 02, 45, 00);
date.setSeconds(date.getSeconds() + 0);
const job = new CronJob(date, function () {
  checkQueryByDate('05/11/2018')
});

job.start();

const params = {
  grab_point: '3',
  title: 'Тогузаков Аскар Косымбекович',
  idnum: '850217301798',
  phone: '87764640088',
  vin: '1154277',
  grzn: 'F114FKM',
  m_model: 'ВАЗ 2101',
}

fs.writeFile(`start.txt`, date, (err) => {
  if (err) throw err;
});

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let checkTimeAttempts = 0;
const checkTimeAttemptsLimit = randomIntFromInterval(40, 50);

function checkQueryByDate(date) {
  axios.get(`https://auto.recycle.kz/ajax/hours_cert/3/${date}`).then(response => {
    const { content } = response.data;
    if (!content) {
      console.log('No content');
      fs.writeFile(`content_error_${moment().format('DD_MM_YYYY_hh_mm_ss_SSSS')}.txt`, JSON.stringify(response.data), (err) => {
        if (err) throw err;
      });
      checkTimeAttempts = checkTimeAttempts + 1;
      if (checkTimeAttempts < checkTimeAttemptsLimit) {
        setTimeout(() => {
          checkQueryByDate(date);
        }, randomIntFromInterval(28000, 32000));
      }
    } else {
      const re = new RegExp('value="(\\d*)"', 'g');
      let matches = [];
      let match;
      while (match = re.exec(content)) {
        matches.push(parseInt(match[1]));
      }
      if (matches[0] === 0) {
        console.log('No queries');
        fs.writeFile(`no_queries_${moment().format('DD_MM_YYYY_hh_mm_ss_SSSS')}.txt`, JSON.stringify(response.data), (err) => {
          if (err) throw err;
        });
        checkTimeAttempts = checkTimeAttempts + 1;
        if (checkTimeAttempts < checkTimeAttemptsLimit) {
          setTimeout(() => {
            checkQueryByDate(date);
          }, randomIntFromInterval(28000, 32000));
        }
      } else {
        fs.writeFile(`ok_queries_${moment().format('DD_MM_YYYY_hh_mm_ss_SSSS')}.txt`, JSON.stringify(response.data), (err) => {
          if (err) throw err;
        });
        getTimeByDate('05/11/2018');
        getTimeByDate('06/11/2018');
        getTimeByDate('07/11/2018');
      }
    }
  });
}

function submitTheQuery(date, time) {
  axios.post(`https://auto.recycle.kz/book_cert`, {
    ...params,
    date,
    time,
  }).then(response => {
    fs.writeFile(`ok_submit_${moment().format('DD_MM_YYYY_hh_mm_ss_SSSS')}.txt`, JSON.stringify(response.data), (err) => {
      if (err) throw err;
    });
  }).catch(error => {
    fs.writeFile(`error_submit_${moment().format('DD_MM_YYYY_hh_mm_ss_SSSS')}.txt`, error, (err) => {
      if (err) throw err;
    });
  })
}

let timeAttempts = 0;
const timeAttemptsLimit = randomIntFromInterval(53, 87);

function getTimeByDate(date) {
  axios.get(`https://auto.recycle.kz/ajax/hours_cert/3/${date}`).then(response => {
    const { content } = response.data;
    if (!content) {
      console.log('No content');
      fs.writeFile(`content_error_${moment().format('DD_MM_YYYY_hh_mm_ss_SSSS')}.txt`, JSON.stringify(response.data), (err) => {
        if (err) throw err;
      });
      timeAttempts = timeAttempts + 1;
      if (timeAttempts < timeAttemptsLimit) {
        setTimeout(() => {
          getTimeByDate(date);
        }, randomIntFromInterval(1000, 3000));
      }
    } else {
      const re = new RegExp('value="(\\d*)"', 'g');
      let matches = [];
      let match;
      while (match = re.exec(content)) {
        matches.push(parseInt(match[1]));
      }
      if (matches[0] === 0) {
        console.log('No queries');
        fs.writeFile(`no_queries_${moment().format('DD_MM_YYYY_hh_mm_ss_SSSS')}.txt`, JSON.stringify(response.data), (err) => {
          if (err) throw err;
        });
        timeAttempts = timeAttempts + 1;
        if (timeAttempts < timeAttemptsLimit) {
          setTimeout(() => {
            getTimeByDate(date);
          }, randomIntFromInterval(1000, 3000));
        }
      } else {
        fs.writeFile(`ok_queries_${moment().format('DD_MM_YYYY_hh_mm_ss_SSSS')}.txt`, JSON.stringify(response.data), (err) => {
          if (err) throw err;
        });
        const formattedDate = date.replace(/\//g, '.');
        const randomIndex = randomIntFromInterval(0, matches.length - 1)
        submitTheQuery(formattedDate, matches[randomIndex]);
      }
    }
  });
}
