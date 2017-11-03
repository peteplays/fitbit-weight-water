const express = require('express');
const bodyParser = require('body-parser');
const FitbitApiClient = require('fitbit-node');
const moment = require('moment-timezone');
const config = require('./config');

const app = express();
app.use(bodyParser.json({ limit: '5mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST');

  next();
});

const baseUrl = config.baseUrl;
const port = process.env.PORT || 7777;

const client = new FitbitApiClient(config.fitbitClientId, config.fitbitClientSecret);
let option;
let weight;
let fat;
let waterAmount;
let waterUnit;

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/', (req, res) => {
  console.log(req.body);
  console.log(req.body.result.parameters.weight[0]);
  console.log(req.body.result.parameters.bodyFat[0]);
  weight = req.body.result.parameters.weight[0];
  fat = req.body.result.parameters.bodyFat[0];
  // console.log(res.getHeaderNames());
  // res.removeHeader('x-powered-by');
  // console.log(res.getHeaderNames());
  // res.end();
  // res.redirect(`${baseUrl}fb?opt=weight&weight=${weight}&fat=${fat}`);
  res.redirect(client.getAuthorizeUrl('weight nutrition', config.fitbitCallBackUrl));
  // res.send(`${req.body.result.parameters.weight[0]} ${req.body.result.parameters.bodyFat[0]}`);
});

app.get('/fb', (req, res) => {
  console.log('FB!!!!!!!!!', config.fitbitCallBackUrl, req.query.opt, req.query.weight, req.query.fat);
  // if ((req.query.opt === 'weight' && req.query.weight && req.query.fat) || (req.query.opt === 'water' && req.query.amount)) {
  //   option = req.query.opt;
  // } else {
  //   res.send('Missing required field');
  // }

  // weight = req.query.weight || null;
  // fat = req.query.fat || null;
  // waterAmount = req.query.amount || null;
  // waterUnit = req.query.unit || null;

  res.redirect(client.getAuthorizeUrl('weight nutrition', config.fitbitCallBackUrl));
});


app.get('/callback', (req, res) => {
  console.log('CB!!!!!!');
  client.getAccessToken(req.query.code, config.fitbitCallBackUrl)
    .then((result) => {
      const date = moment().tz("America/New_York").format('YYYY-MM-DD');
      const time = moment().tz("America/New_York").format('HH:mm:ss');

      if (option === 'weight') {
        client.post(`/body/log/weight.json?weight=${weight}&date=${date}&time=${time}`, result.access_token, null, null, { 'Accept-Language': 'en_US' })
          .then((r1) => {
            client.post(`/body/log/fat.json?fat=${fat}&date=${date}&time=${time}`, result.access_token)
              .then((r2) => {
                const allResults = [
                  r1[0],
                  r2[0]
                ];
                res.send(allResults);
              });
          });
      } else if (option === 'water') {
        if (!waterUnit) waterUnit = 'fl%20oz';
        client.post(`/foods/log/water.json?date=${date}&amount=${waterAmount}&unit=${waterUnit}`, result.access_token)
          .then((r3) => {
            res.send(r3[0]);
          });
      }

  }).catch((error) => {
    res.send(error);
  });
});

app.listen(port);