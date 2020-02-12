const WebSocket = require('ws');
const Message = require('./message');

class Server {
  constructor(config) {
    this._whiteListExp = [];
    this._ws = null;
    this._currentStatus = null;
    this._config = config;
    setInterval(this._ping.bind(this), 10000);
  }

  start() { 

    if (this._ws !== null) {
      return;
    }

    this._whiteListExp.length = 0;

    this._config.whiteList.forEach((item) => { 
      this._whiteListExp.push(new RegExp(item, 'i'));
    }); 

    this._ws = new WebSocket.Server({ port: this._config.WebSocket.port });
    this._ws.on('connection', this._onNewConnection.bind(this));
    this._currentStatus = new Message(null, 1, 'Waiting for connection');
  }

  close() { 

    if ( this._ws === null) {
      return;
    } 

    this._ws.clients.forEach((client) => {
      client.terminate();
    });

    this._ws.close(() => {
      this._ws = null;
    });

  }

  _onNewConnection(ws, req) {
    let allow = this._whiteListExp.length === 0 ? true : false;

    // This might happens when websocket 
    // is not fully closed yet
    if(this._ws === null) {
      ws.terminate();
    } 

    for (let i = 0; i < this._whiteListExp.length; i++) {
      allow = this._whiteListExp[i].test(req.headers.origin);
      if(allow){
        break;
      }
    }

    if (allow) {
      ws.isAlive = true;
      ws.on('pong', () => { ws.isAlive = true; });
      this.sendStatus(this._currentStatus.msg, this._currentStatus.status, ws); 
    } else {
      ws.terminate();
    }

  } 

  _ping() { 

    if (this._ws === null) {
      return;
    }

    this._ws.clients.forEach((client) => { 
      if (client.isAlive === false) {
        client.terminate();
        return;
      }
      client.isAlive = false;
      client.ping(() =>{});
    });
  }

  sendStatus(message = '', code = 0, client = null) {
    this._currentStatus = new Message(null, code, message);
    if (client !== null) {
      client.send(JSON.stringify(this._currentStatus));
    } else {
      if (this._ws !== null) {
        this._ws.clients.forEach((client) => {
          client.send(JSON.stringify(this._currentStatus));
        });
      }
    }
  }

  send(data) {
    const msg = new Message(data);
    this._ws.clients.forEach((client) => {
      client.send(JSON.stringify(msg));
    });
  }

  isClosed() { 
    this._ws === null;
  }
}

module.exports = Server;
