// var Promise = require('es6-promise').Promise;
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Promise = require('bluebird');
var _        = require('lodash');
var moment = require('moment');
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var fs       = require('fs');
var fetch      = require('node-fetch');
var schedule   = require('node-schedule');
var utf8 = require('utf8');
var EtfModel = require('./models/EtfModel');
var StockModel = require('./models/StockModel');

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

  fs.readFile('data.json', 'utf8', (err, d) => {
    if(!err)
      r.json(JSON.parse(d))
  })
});
    
router.get('/stock/:id', (req, res) => {
  var r = res;
    
  getStockData(req.params.id)
  .then((res) => { r.json(res) })
  .catch((err) => { r.json({error: err}); });

});

router.get('/etf/:id', (req, res) => {
  var r = res;

  getETFData(req.params.id)
  .then((res) => { r.json(res); })
  .catch((err) => { r.json('ERROR' + err) });
});

router.get('/stock13f/:symbol/:id', (req, res) => {
  var r = res;
  var stockData = {};
  var holdingsData = {};

  getStock13F(req.params.id, req.params.symbol)
  .then((res) => {r.json(res);})
  .catch((err) => { r.json({error: err}); });

  /*
  getStockData(req.params.symbol)
  .then((res) => {
    stockData = res;

    get13F(req.params.id)
    .then((res) => {
      var sectorsIndustries = [];

      sectorsIndustries = res.holdings.map((item) => {
        return {name: item.industry, raw: item.current_percent_of_portfolio, fmt: item.current_percent_of_portfolio};
      });

      stockData.sectorsIndustries = sectorsIndustries;

      r.json(stockData);

    })
    .catch((err) => { r.json({error: err}); });

  })
  .catch((err) => { r.json({error: err}); });
  */
});

router.get('/history/:id/:period', (req, res) => {
  var r = res;
  var date = {};

  switch(req.params.period) {
    case '1D':
      date.startDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
      break;
    case '5D':
      date.startDate = moment().subtract(5, 'days').format('YYYY-MM-DD');
      break;
    case '1W':
      date.startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
      break;
    case '1M':
      date.startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
      break;
    case '3M':
      date.startDate = moment().subtract(3, 'months').format('YYYY-MM-DD');
      break;
    case '6M':
      date.startDate = moment().subtract(6, 'months').format('YYYY-MM-DD');
      break;
    case '1Y':
      date.startDate = moment().subtract(12, 'months').format('YYYY-MM-DD');
      break;
    case '2Y':
      date.startDate = moment().subtract(2, 'years').format('YYYY-MM-DD');
      break;
    case '5Y':
      date.startDate = moment().subtract(5, 'years').format('YYYY-MM-DD');
      break;
  }

  date.endDate = moment().format('YYYY-MM-DD');

  getHistoricalData(req.params.id, date)
  .then((res) => {
    r.json(res);
  })
  .catch((err) => {r.json('ERROR' + err)});
});

router.get('/13f/:id', (req, res) => {
  var r = res;
  get13F(req.params.id)
  .then((res) => { r.json(res); })
  .catch((err) => { r.json('ERROR ' + err)});
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
  
  return;

  var data = {};

  fs.readFile('data.json', 'utf8', (err, d) => {
    if(!err) {
      data = JSON.parse(d);
      data.map((item) => {
        if(item.wid)
          console.log(item.wid);
      })
    }
  })
  // setTimeout(readDataFromFile , 1000);
}

var getETFData = async((symbol) => {
  var data = {};

  var etf = await(
    fetch('https://query2.finance.yahoo.com/v10/finance/quoteSummary/'+symbol+'?formatted=true&crumb=pFqE0Ejwwqf&lang=en-US&modules=topHoldings%2CdefaultKeyStatistics%2CassetProfile%2CfinancialData%2CincomeStatementHistory%2CbalanceSheetHistory')
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

    var holdingData2 = await(
      fetch('http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20(%22'+holding.symbol+'%22)&format=json&env=http://datatables.org/alltables.env')
      .then((res) => {return res.json()})
      .then((json) => {return json.query.results.quote;})
    );
    holding.ask = holdingData2.Ask;
    holding.bid = holdingData2.Bid;

    // console.log(holdingData);
  }

  var sectorsIndustries = [];

  for(var industries in etf.topHoldings.sectorWeightings) {
    for(var industry in etf.topHoldings.sectorWeightings[industries]) {
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
  data.profile.summery = utf8.decode(etf.assetProfile.longBusinessSummary.replace("\n ", "\n\n"));
  
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
    fetch('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20(%22'+id+'%22)&format=json&env=http://datatables.org/alltables.env')
    .then((res) => {return res.json()})
    .then((json) => {return json.query.results.quote;})
  );

  var stockFinance = await(
    fetch('https://query2.finance.yahoo.com/v10/finance/quoteSummary/'+id+'?f=y&formatted=true&crumb=n&lang=en-US&modules=topHoldings%2CdefaultKeyStatistics%2CassetProfile%2CfinancialData%2CincomeStatementHistory%2CbalanceSheetHistory')
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
  data.finance.yield = stockInfo.DividendYield;
  data.finance.marketCap = stockInfo.MarketCapitalization;
  data.finance.sharesOutstanding = stockFinance.defaultKeyStatistics.sharesOutstanding;
  data.finance.peRatio = stockInfo.PERatio;
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

  return data;
});

var get13F = async((id) => {
  var api_key = 'IzHSnnbUgHWxBgwNeEKg';
  var auth = 'Basic ' + new Buffer('web@lyon-is.com:Lyon280314').toString('base64');
  var url = 'https://whalewisdom.com/shell/command.json?args=';
  var options = {
    method: 'GET',
    headers: { 'Authorization': auth },
  };

  //349 - BERKSHIRE HATHAWAY INC

  var getId = await(
  //   fetch(url + JSON.stringify(command), options)
  //   .then((res) => {return res.json()})
  //   .then((json) => {return json})
  );

  var command = {
    "command": "holdings",
    "filer_ids": [id],
    "columns": [3,4,8,10,18,19,20],
    "sort": "current_ranking",
    "include_13d": 1
  };

  var whaleApi = await(
    fetch(url + JSON.stringify(command), options)
    .then((res) => {return res.json()})
    .then((json) => {return json.results[0].records[0]})
  );

  var totalPercent = 0;

  // for(var holding in whaleApi) {
    // if(whaleApi[holding].current_percent_of_portfolio != null)
    //   totalPercent += whaleApi[holding].current_percent_of_portfolio
      // console.log(whaleApi[holding]);
  // }

  // totalPercent = Math.round(totalPercent);

  return whaleApi;

});

var getStock13F = async((id, symbol) => {

  var data = {};
  var sectorsIndustries = [];

  var stockInfo = await(
    fetch('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20(%22'+symbol+'%22)&format=json&env=http://datatables.org/alltables.env')
    .then((res) => {return res.json()})
    .then((json) => {return json.query.results.quote;})
  );

  var stockFinance = await(
    fetch('https://query2.finance.yahoo.com/v10/finance/quoteSummary/'+symbol+'?f=y&formatted=true&crumb=n&lang=en-US&modules=topHoldings%2CdefaultKeyStatistics%2CassetProfile%2CfinancialData%2CincomeStatementHistory%2CbalanceSheetHistory')
    .then((res) => {return res.json();})
    .then((json) => {return json.quoteSummary.result[0];})
  );

  data.profile = {};
  data.finance = {};

  var get13fData = await(
    get13F(id)
    .then((res) => {return res})
    .catch((err) => { return err })
  );


   // Top holdings
  var topHoldings = _.map(get13fData.holdings, (h) => {return {symbol:h.stock_ticker, name: h.stock_name, percent: h.current_percent_of_portfolio}});
  sectorsIndustries = get13fData.holdings.map((item) => {
    return {name: item.industry, raw: item.current_percent_of_portfolio, fmt: item.current_percent_of_portfolio};
  });

  // console.log(get13fData.holdings);

  /*
      stock_name": "General Electric Co",
      "stock_ticker": "GE",
      "current_ranking": 33,
      "current_percent_of_portfolio": 0.2435,
      "sector": "INDUSTRIALS",
      "industry": "CONGLOMERATES",
      "percent_ownership": "0.1128604"
  */

  // for(var holding of topHoldings) {
  //   var holdingData2 = await(
  //     fetch('http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20IN%20(%22'+holding.symbol+'%22)&format=json&env=http://datatables.org/alltables.env')
  //     .then((res) => {return res.json()})
  //     .then((json) => {return json.query.results.quote;})
  //   );
  //   holding.ask = holdingData2.Ask;
  //   holding.bid = holdingData2.Bid;

  //   // console.log(holdingData);
  // }
  
  data.finance = {};
  data.profile = {};

  data.profile.name = stockInfo.Name;
  data.profile.symbol = stockInfo.Symbol;
  data.profile.summery = stockFinance['assetProfile'].longBusinessSummary;//utf8.decode(etf.assetProfile.longBusinessSummary.replace("\n ", "\n\n"));
  
  data.finance.ask = stockInfo.Ask;
  data.finance.bid = stockInfo.Bid;
  data.finance.yield = stockInfo.DividendYield;
  data.finance.marketCap = stockInfo.MarketCapitalization;
  data.finance.sharesOutstanding = stockFinance.defaultKeyStatistics.sharesOutstanding;
  data.finance.peRatio = stockInfo.PERatio;
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
  data.sectorsIndustries = sectorsIndustries;
  data.topHoldings = topHoldings;

  return data;
});

var getHistoricalData = async((id, date) => {
  var data = {};
  histData = [];

  var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22'+id+'%22%20and%20startDate%20%3D%20%22'+date.startDate+'%22%20and%20endDate%20%3D%20%22'+date.endDate+'%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';//&callback=';
  var historicalData = await(
    fetch(url)
    .then((res) => {return res.json()})
    .then((json) => {return json.query.results.quote;})
  );

  for(var i = 0; i < historicalData.length; i++) {
    var period = [];
    period.push(Number(historicalData[i].Open));
    period.push(Number(historicalData[i].Close));
    histData.push(period);
  }

  data.data = histData;

  return data;
});

var getHistoricalData2 = async((opts, type) => {
// function getStockFinanceData(opts, type) {
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
});



function readDataFromFile() {
  fs.readFile(dataFileName, 'utf8', (err, d) => {
    if(!err)
      data = JSON.parse(d);
  })
}

setTimeout(getAllData, 1000);

