const net = require('net');

class TCP {
 constructor(listeners, parameters) {
  this._port = parameters.port;
  this._ipAddress = parameters.ipAddress;
  this._socket = null;
  this._listeners = listeners;
  this._errorListeners = [];
  this._isClosed = true;
 }

 addErrorListener(callback) {

  if (typeof callback !== 'function') {
   return;
  }

  this._errorListeners.push(callback);
 }

 start() {
  if (this._socket !== null) {
   this.close();
  }

  this._socket = new net.Socket();

  this._socket.connect({
   port: this._port,
   host: this._ipAddress,
  });

  this._socket.on('data', this._onData.bind(this));
  this._socket.on('connect', this._onConnected.bind(this));

  this._socket.on('end', this._onEnd.bind(this));
  this._socket.on('close', this._onClose.bind(this));
  this._socket.on('error', this._onError.bind(this));
 }

 _onConnected() {

  this._isClosed = false;

  if (Array.isArray(this._listeners)) {
   this._listeners.forEach((listener) => {
    listener.sendStatus('Connected', 0);
   });
  } else {
   this._listeners.sendStatus('Connected', 0);
  }

 }

 _onData(data) {
  const sdata = data.toString();
  if (Array.isArray(this._listeners) === true) {
   this._listeners.forEach((listener) => {
    listener.send(sdata);
   });
  } else {
   this._listeners.send(sdata);
  }
 }

 _onClose() {
  this._socket = null;
  this._isClosed = true;
 }

 close(status) {
  if (status) {
   console.log(status);
   this._onClose();
   return;
  }
  if (this._socket === null) {
   this._isClosed = true;
   return;
  }
  if (this._isClosed === false) {
   this._socket.end();
  }
 }

 isClosed() {
  return this._isClosed;
 }

 _onError(err) {

  if (Array.isArray(this._listeners)) {
   this._listeners.forEach((listener) => {
    listener.sendStatus(err.message, -1);
   });
  } else {
   this._listeners.sendStatus(err.message, -1);
  }

  this.close();
  this._errorListeners.forEach((listener) => {
   listener.call();
  });

 }

 _onEnd(err) {
  let msg = 'TCP Connection closed.';

  if (Array.isArray(this._listeners)) {
   this._listeners.forEach((listener) => {
    listener.sendStatus(msg, -1);
   });
  } else {
   this._listeners.sendStatus(msg, -1);
  }

  this._onClose();

  this._errorListeners.forEach((listener) => {
   listener.call();
  });

 }
}

module.exports = TCP;