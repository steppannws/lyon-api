// var Promise = require('es6-promise').Promise;
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('bluebird');
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

router.get('/strategies', (req, res) => {
  var r = res;
  var data = [];

  fs.readFile('data.json', 'utf8', (err, d) => {
    if(!err)
      r.json(JSON.parse(d))
  })

  
});
    
router.get('/stock/:id', (req, res) => {
  var r = res;
  var data = [];
    
  getStockData(req.params.id)
  .then((res) => {r.json(res)})
  .catch((err) =>{r.json({error: err});});

});

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

router.get('/etf/:id', (req, res) => {
  var r = res;
  var data = [];

  getETFData(req.params.id)
  .then((res) => {
    r.json(res);
  })
  .catch((err) => {r.json(err)});
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
// var cronJob = schedule.scheduleJob('0 0 0 * * *', function(){

});

function getAllData() {
  console.log('GETTING DATA');

  return;

  getETFData('SPY')
  .then((res) => {
    // console.log('SPY: ', res);
  })
  .catch((err) => {console.log(err)});

  return;
  // fetch('https://query2.finance.yahoo.com/v10/finance/quoteSummary/AAPL?formatted=true&crumb=pFqE0Ejwwqf&lang=en-US&modules=topHoldings%2CdefaultKeyStatistics%2CassetProfile%2Cask')
  fetch('https://query2.finance.yahoo.com/v10/finance/quoteSummary/AAPL?formatted=true&crumb=pFqE0Ejwwqf&lang=en-US&modules=topHoldings%2CdefaultKeyStatistics%2CassetProfile%2CfinancialData%2CincomeStatementHistory%2CbalanceSheetHistory') //%2C
  .then((res) => {
    console.log(res);
        return res.json();
    }).then((json) => {
    // data.push(json);
        // return r.json(json.quoteSummary.result[0].topHoldings.holdings);
        // console.log(json.quoteSummary.result[0].topHoldings.holdings);
        
        // console.log(json.quoteSummary.result[0].incomeStatementHistory);
        
        console.log(json.quoteSummary.result[0]);

        // fs.writeFile(dataFileName, JSON.stringify(json, null, 4));
        // var d = JSON.parse(json);

    // console.log('DATA', d.quoteSummary);
        // console.log(_.get(json, 'quoteSummary'));
        // return r.json(data);
    });

    setTimeout(readDataFromFile , 1000);
}

var getETFData = async((symbol) => {
  var data = {};
  var etf = await(
    fetch('http://query2.finance.yahoo.com/v10/finance/quoteSummary/'+symbol+'?formatted=true&crumb=pFqE0Ejwwqf&lang=en-US&modules=topHoldings%2CdefaultKeyStatistics%2CassetProfile%2CfinancialData%2CincomeStatementHistory%2CbalanceSheetHistory')
    .then((res) => {return res.json();})
    .then((json) => {
      return json.quoteSummary.result[0];
    })
  );

  var etfFinance = await(
    fetch('http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20(%22'+symbol+'%22)&format=json&env=http://datatables.org/alltables.env')
    .then((res) => {return res.json()})
    .then((json) => {return json.query.results.quote;})
  );

  // Top holdings
  var topHoldings = _.map(etf.topHoldings.holdings, (h) => {return {symbol:h.symbol, name: h.holdingName, percent: h.holdingPercent}});

  for(var holding of topHoldings) {

    /*
    // Industry
    var holdingData = await(
      fetch('https://query2.finance.yahoo.com/v10/finance/quoteSummary/'+holding.symbol+'?formatted=true&crumb=pFqE0Ejwwqf&lang=en-US&modules=topHoldings%2CdefaultKeyStatistics%2CassetProfile%2CfinancialData%2CincomeStatementHistory%2CbalanceSheetHistory')
      .then((res) => {return res.json()})
      .then((json) => {
        if(json.quoteSummary.result != null)
          return json.quoteSummary.result[0];
        else
          return {};
      })
    );

    if(holdingData.assetProfile != undefined)
      holding.industry = holdingData.assetProfile.industry;
    */

    var holdingData2 = await(
      fetch('http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20(%22'+holding.symbol+'%22)&format=json&env=http://datatables.org/alltables.env')
      .then((res) => {return res.json()})
      .then((json) => {return json.query.results.quote;})
    );
    holding.ask = holdingData2.Ask;
    holding.bid = holdingData2.Bid;

    // console.log(holdingData);
  }

  // var stockInfo = await(
  //   getStockData({stock: symbol}, 'quotes')
  //   .then((response) => {return response.json();})
  //   .then((json) => {return json.query.results.quote;})
  //   .catch((error) => {return error;})
  // );

  var sectorsIndustries = [];

  for(var industries in etf.topHoldings.sectorWeightings) {
    for(var industry in etf.topHoldings.sectorWeightings[industries]) {
      // console.log(etf.topHoldings.sectorWeightings[industries][industry].raw);
      sectorsIndustries.push({
        name: industry,
        raw: etf.topHoldings.sectorWeightings[industries][industry].raw,
        fmt: etf.topHoldings.sectorWeightings[industries][industry].fmt 
      });
    }
  }

  data.finance = {};
  data.profile = {};

  data.profile.name = etfFinance.Name;
  data.profile.symbol = etfFinance.Symbol;
  data.profile.summery = etf.assetProfile.longBusinessSummary;
  
  data.finance.ask = etfFinance.Ask;
  data.finance.bid = etfFinance.Bid;
  data.finance.category = etf.defaultKeyStatistics.category;
  data.finance.foundFamily = etf.defaultKeyStatistics.foundFamily;
  data.finance.legalType = etf.defaultKeyStatistics.legalType;
  data.finance.ytdReturn = etf.defaultKeyStatistics.ytdReturn;
  data.finance.totalAssets = etf.defaultKeyStatistics.totalAssets;
  data.finance.yield = etf.defaultKeyStatistics.yield;
  data.finance.fundInceptionDate = etf.defaultKeyStatistics.fundInceptionDate;
  data.finance.threeYearAverageReturn = etf.defaultKeyStatistics.threeYearAverageReturn;
  data.finance.fiveYearAverageReturn = etf.defaultKeyStatistics.fiveYearAverageReturn;

  data.sectorsIndustries = sectorsIndustries;
  data.topHoldings = topHoldings;

  return data;
});

var getStockData = async((id) => {

  var data = {};

  var stockInfo = await(
    fetch('http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20(%22'+id+'%22)&format=json&env=http://datatables.org/alltables.env')
    .then((res) => {return res.json()})
    .then((json) => {return json.query.results.quote;})
  );

  var stockFinance = await(
    fetch('https://query2.finance.yahoo.com/v10/finance/quoteSummary/'+id+'?formatted=true&crumb=pFqE0Ejwwqf&lang=en-US&modules=topHoldings%2CdefaultKeyStatistics%2CassetProfile%2CfinancialData%2CincomeStatementHistory%2CbalanceSheetHistory')
    .then((res) => {return res.json();})
    .then((json) => {return json.quoteSummary.result[0];})
  );

  data.profile = {};
  data.finance = {};

  data.profile.name = stockInfo.Name;
  data.profile.symbol = stockInfo.Symbol;
  data.profile.industry = stockFinance['assetProfile'].industry;
  data.profile.sector = stockFinance['assetProfile'].sector;
  data.profile.summery = stockFinance['assetProfile'].longBusinessSummary;

  data.finance.ask = stockInfo.Ask;
  data.finance.bid = stockInfo.Bid;
  data.finance.sharesOutstanding = stockFinance.defaultKeyStatistics.sharesOutstanding;
  data.finance.pegRatio = stockFinance.defaultKeyStatistics.pegRatio;
  data.finance.enterpriseValue = stockFinance.defaultKeyStatistics.enterpriseValue;
  data.finance.forwardPE = stockFinance.defaultKeyStatistics.forwardPE;


  data.finance.totalCash = stockFinance.financialData.totalCash;
  data.finance.totalRevenue = stockFinance.financialData.totalRevenue;
  data.finance.revenueGrowth = stockFinance.financialData.revenueGrowth;
  data.finance.currentPrice = stockFinance.financialData.currentPrice;
  data.finance.targetHighPrice = stockFinance.financialData.targetHighPrice;
  data.finance.targetLowPrice = stockFinance.financialData.targetLowPrice;
  data.finance.returnOnAssets = stockFinance.financialData.returnOnAssets;

  // delete stockFinance['balanceSheetHistory'];
  // delete stockFinance['assetProfile'];
  // delete stockFinance['defaultKeyStatistics'];
  // delete stockFinance['incomeStatementHistory'];
  // delete stockFinance['financialData'];

  // return stockFinance.defaultKeyStatistics;
  return data;
});


function readDataFromFile() {
  fs.readFile(dataFileName, 'utf8', (err, d) => {
    if(!err)
      data = JSON.parse(d);
  })
}

// setTimeout(getAllData, 1000);

// var getStockData = async((opts, type) => {
function getStockFinanceData(opts, type) {
  var defs = {
    baseURL: 'http://query.yahooapis.com/v1/public/yql?q=',
    query: {
      quotes: 'select * from yahoo.finance.quotes where symbol in ("{stock}")',
      historicaldata: 'select * from yahoo.finance.historicaldata where symbol = "{stock}" and startDate = "{startDate}" and endDate = "{endDate}"',
    },
    suffixURL: {
      quotes: '&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys',
      historicaldata: '&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys',
    }
  };

  opts = opts || {};

  if (!opts.stock) {
    console.log('No stock defined');
    return;
  }

  if (opts.stock instanceof Array) {
    opts.stock = opts.stock.join("', '");
  }

  console.log(opts.stock);

  var query = defs.query[type]
    .replace('{stock}', opts.stock)
    .replace('{startDate}', opts.startDate)
    .replace('{endDate}', opts.endDate);

    var url = defs.baseURL + query + (defs.suffixURL[type] || '');
  console.log('URLURL',url);
  return fetch(url);
};

