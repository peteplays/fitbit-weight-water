# fitbit-weight-water #

This project will get a fitbit access token and let the user add `weight and body fat percent` or add `amount of water and units(optional)` drank.

The user must set up a fitbit developer account and have a `CLIENT_ID` and `CLIENT_SECRET`.

## Local Development ##
running `node index.js` will serve app

or

- `npm i pm2 -g` installs pm2 as a global package

- `npm run start-dev` will start pm2, the app, and watch for changes.  The default port in the project is port `7777`.

  - `pm2 logs` will let you view logs.

- `npm run stop-dev` will delete the app from the pm2 server.

## Config File Setup ##
The user must setup create a `config.js` file containing the following.
- `fitbitCallBackUrl`
- `fitbitClientId`
- `fitbitClientSecret`

There is a `config.js` file that can be used once updated and file name changed.

## Usage ##
### _View profile and get access token_ ###
call `http://localhost:7777/fb`

this will write the a _token_ to `token.json`

### _Add weight and body fat percent_ ###
call `http://localhost:7777/weight?weight=165&fat=11.7`
- `weight: [weight]` weight to enter
- `fat: [fat]` fat percent to enter

Currently this is set to enter weight in pounds.

To change the units change `'Accept-Language': 'en_US'` (see fitbit dev docs for more info).

### _Add water_ ###

call `http://localhost:7777/water?amount=1&unit=cup`
- `amount: [amount]` amount of water
- `unit: [unit]` unit of water (optional)

Unit is set to fluid ounces if no units are passed in. `cup` is supported (see fitbit dev docs for more info).

If the correct options are not passed in a message is returned `Missing required field`


## _Shout out to [fitbit-node](https://github.com/lukasolson/fitbit-node) for making this super easy_ ##

### Comments and suggestions are welcome! ###



