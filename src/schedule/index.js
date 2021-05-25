const schedule = require('node-schedule');
const getContactFromCRM = require('./../job/GetContact')



const job = schedule.scheduleJob('0 0 3 * * *', function(fireDate){
    getContactFromCRM()
});


module.exports = job