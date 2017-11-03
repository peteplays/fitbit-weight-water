module.exports = {
  baseUrl: process.env.BASE_URL || 'http://localhost:7777/',
  fitbitCallBackUrl: process.env.FITBIT_CALLBACK_URL || 'http://localhost:7777/callback',
  fitbitClientId: process.env.FITBIT_CLIENT_ID,
  fitbitClientSecret: process.env.FITBIT_CLIENT_SECRET
};