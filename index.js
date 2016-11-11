var _        = require('lodash');
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var fs       = require('fs');
var fetch      = require('node-fetch');
var schedule   = require('node-schedule');

var dataFileName = 'd.json';
var data = [];

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/test', (req, res) => {
    res.json(data);
});

router.get('/data', (req, res) => {
  var r = res;
  var data = [];
  // fetch('http://ondemand.websol.barchart.com/getETFDetails.json?symbols=SPY&categories=Equity&subCategories=Global')
  // fetch('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22%22)&format=json&bypass=true&diagnostics=false&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=')
  
});


// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Running server on port ' + port);

// Excecute cron job every day at 00 hs.
var cronJob = schedule.scheduleJob('0 0 0 * * *', function(){

});

function getAllData() {
  console.log('GETTING DATA');

  fetch('https://query2.finance.yahoo.com/v10/finance/quoteSummary/SPY?formatted=true&crumb=pFqE0Ejwwqf&lang=en-US&modules=topHoldings%2CdefaultKeyStatistics%2CassetProfile')
  .then((res) => {
    console.log(res);
        return res.json();
    }).then((json) => {
    // data.push(json);
        // return r.json(json.quoteSummary.result[0].topHoldings.holdings);
        console.log(json.quoteSummary.result[0].topHoldings.holdings);
        

        // fs.writeFile(dataFileName, JSON.stringify(json, null, 4));
        // var d = JSON.parse(json);

    // console.log('DATA', d.quoteSummary);
        // console.log(_.get(json, 'quoteSummary'));
        // return r.json(data);
    });

    setTimeout(readDataFromFile , 1000);
}

function readDataFromFile() {
  fs.readFile(dataFileName, 'utf8', (err, d) => {
    if(!err)
      data = JSON.parse(d);
  })
}

setTimeout(getAllData, 1000);

