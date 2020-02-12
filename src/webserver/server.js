const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const stylus = require('stylus');
const cors = require('cors');

class Server {
 constructor(config) {
  this._config = config;
  this._app = express();
  this._isStarted = false;
  this._server = null;
  this._corsOptions = { origin: this._checkOrigin.bind(this) };
  this._whiteListExp = [];
  this._allowSameOrigin = false;
 }

 start() {

  if (this._isStarted === true) {
   return;
  }

  this._port = this._config.WebServer.port;

  this._whiteListExp.length = 0;

  this._allowSameOrigin = false;

  this._config.whiteList.forEach((item) => {
   if (this._allowSameOrigin === false) {
    this._allowSameOrigin = item.indexOf('localhost') > -1 || item.indexOf('::1') > -1 || item.indexOf('0.0.0.0') > -1 || item.indexOf('127.0.0.1') > -1;
   }
   this._whiteListExp.push(new RegExp(item, 'i'));
  });

  this._app.set('views', path.resolve(__dirname, '../../views'));
  this._app.set('view engine', 'jade');
  this._app.use(express.static(path.resolve(__dirname, '../../public')));

  this._app.all('*', cors(this._corsOptions), (req, res, next) => {
   next();
  });
  this._app.all('*', bodyParser.json({ type: 'application/json' }), (req, res, next) => {
   next();
  });

  this._app.use(stylus.middleware({
   src: path.resolve(__dirname, '../../stylesheets'),
   dest: path.resolve(__dirname, '../../public/stylesheets'),
  }));


  this._app.get('/', (req, res) => res.render('home', {}));

  this._app.get('/config', this._getConfig.bind(this));
  this._app.post('/config', this._setConfig.bind(this));

  this._server = this._app.listen(this._port, () => {
   console.log(`Services is running in : ${this._port}!`);
   this._isStarted = true;
  });
 }

 _checkOrigin(origin, callback) {

  let allow = this._whiteListExp.length === 0 ? true : false;

  if (origin !== undefined) {
   for (let i = 0; i < this._whiteListExp.length; i++) {
    allow = this._whiteListExp[i].test(origin);
    if (allow) {
     break;
    }
   }
  } else if (this._allowSameOrigin === true) {
   allow = true;
  }

  if (allow) {
   callback(null, true);
  } else {
   callback('You are not allowed to access this page, consult the administrator');
  }
 }

 _getConfig(req, res) {
  res.send(this._config);
  return true;
 }

 _setConfig(req, res) {
  const data = req.body;

  this._config.selectedChannel = data.selectedChannel;
  this._config.WebServer.port = data.WebServer.port;
  this._config.WebSocket.port = data.WebSocket.port;

  this._config.whiteList.length = 0;
  if (Array.isArray(data.whiteList)) {
   data.whiteList.forEach(item => {
    this._config.whiteList.push(item);
   });
  }

  switch (data.selectedChannel.toLowerCase()) {
   case 'tcp':
    {
     this._config.TCPParameters.port = parseInt(data.tcpPort, 10);
     this._config.TCPParameters.ipAddress = data.ipAddress;
     break;
    }
   default:
    {
     this._config.COMParameters.selectedPort = data.selectedPort;
     this._config.COMParameters.baudRate = parseInt(data.baudRate, 10);
     this._config.COMParameters.dataBits = parseInt(data.dataBits, 10);
     this._config.COMParameters.stopBits = parseInt(data.stopBits, 10);
     this._config.COMParameters.rtscts = data.rtscts;
     this._config.COMParameters.parity = data.parity;
     break;
    }
  }

  this._config.save();
  res.send('');
 }

 close() {
  if (this._server === null) {
   return;
  }
  this._server.close(() => { this._isStarted = false; });
 }

 isClosed() {
  return !this._isStarted;
 }
}

module.exports = Server;