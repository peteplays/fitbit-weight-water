const express = require('express');
const bodyParser = require('body-parser');
const FitbitApiClient = require('fitbit-node');
const moment = require('moment-timezone');
const fs = require('fs');
const config = require('./config');

const app = express();
app.use(bodyParser.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST');

  next();
});

const port = process.env.PORT || 7777;
const tokenFile = 'token.json';

const client = new FitbitApiClient(config.fitbitClientId, config.fitbitClientSecret);

const readToken = (fileName, cb) => {
  fs.readFile(fileName, { encoding: 'utf8', flag: 'r' }, (err, data) => {
    if (err) return cb(err);

    return cb(null, JSON.parse(data));
  });
};

const writeToken = (fileName, token) => {
  // console.log('persisting new token:', JSON.stringify(token));
  fs.writeFile(fileName, JSON.stringify(token));
  return JSON.stringify(token);
};

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/fb', (req, res) => {
  res.redirect(client.getAuthorizeUrl('profile weight nutrition', config.fitbitCallBackUrl));
});

// TODO
// app.get('/fb-refresh', (req, res) => {
//   readToken(tokenFile, (err, token) => {
//     if (err) console.log(err);

//     const accessToken = token.access_token;
//     const refreshToken = token.refresh_token;
//     const expiresIn = token.expires_in;
//     const results = client.refreshAccessToken(accessToken, refreshToken, expiresIn);

//     // writeToken(tokenFile, results);
//     console.log(results);

//     res.send('cool');
//   });
// });

app.get('/callback', (req, res) => {
  client.getAccessToken(req.query.code, config.fitbitCallBackUrl)
    .then((result) => {
      writeToken(tokenFile, result);
      client.get('/profile.json', result.access_token)
        .then((results) => {
          res.send(results[0]);
        });
    }).catch((err) => {
      res.send(err);
    });
});

app.get('/water', (req, res) => {
  if (!req.query.amount) res.send('Amount is required');

  const date = moment().tz('America/New_York').format('YYYY-MM-DD');
  const waterAmount = req.query.amount;
  const waterUnit = req.query.unit || 'fl%20oz'; // default is oz

  readToken(tokenFile, (err, token) => {
    if (err) console.log(err);

    const accessToken = token.access_token;
    client.post(`/foods/log/water.json?date=${date}&amount=${waterAmount}&unit=${waterUnit}`, accessToken)
      .then((waterResults) => {
        res.send(waterResults[0]);
      }).catch((err2) => {
        res.send(err2);
      });
  });
});

app.get('/weight', (req, res) => {
  if (!req.query.weight) res.send('Weight is required');
  if (!req.query.fat) res.send('Fat is required');

  const date = moment().tz('America/New_York').format('YYYY-MM-DD');
  const time = moment().tz('America/New_York').format('HH:mm:ss');
  const weight = req.query.weight;
  const fat = req.query.fat;

  readToken(tokenFile, (err, token) => {
    if (err) console.log(err);

    const accessToken = token.access_token;
    client.post(`/body/log/weight.json?weight=${weight}&date=${date}&time=${time}`, accessToken, null, null, { 'Accept-Language': 'en_US' })
      .then((weightResults) => {
        client.post(`/body/log/fat.json?fat=${fat}&date=${date}&time=${time}`, accessToken)
          .then((bodyFatResults) => {
            const allResults = [
              weightResults[0],
              bodyFatResults[0],
            ];

            res.send(allResults);
          });
      }).catch((err2) => {
        res.send(err2);
      });
  });
});

app.listen(port);
