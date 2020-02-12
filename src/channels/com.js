const SerialPort = require('serialport');

class COM {
  constructor(listeners, parameters) {
    this._port = null;
    this._isClosed = true;
    this._parameters = parameters;
    this._listeners = listeners;
    this._errorListeners = [];
  }

  addErrorListener(callback) {

    if (typeof callback !== 'function') {
      return;
    }

    this._errorListeners.push(callback);
  }

  _onData() {
    let data = null;
    if (this._port === null) {
      return;
    }
    data = this._port.read().toString();
    if (Array.isArray(this._listeners)) {
      this._listeners.forEach((listener) => {
        listener.send(data);
      });
    } else {
      this._listeners.send(data);
    }
  }

  start() {

    if (this._port !== null) {
      this.close();
    }

    this._port = new SerialPort(this._parameters.selectedPort, this._parameters);
    this._port.on('readable', this._onData.bind(this));
    this._port.on('close', this._onClose.bind(this));
    this._port.on('error', this._onError.bind(this));
    this._port.on('open', this._onOpen.bind(this));
  }

  _onOpen() {

    this._isClosed = false;

    if (Array.isArray(this._listeners)) {
      this._listeners.forEach((listener) => {
        listener.sendStatus('Connected', 0);
      });
    } else {
      this._listeners.sendStatus('Connected', 0);
    }

  }

  _onClose() {
    this._isClosed = true;
    this._port = null;
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

  close() {

    if (this._port === null || this._port.isOpen === false) {
      return;
    }

    this._port.close(); 

  }

  isClosed() {
    return this._isClosed;
  }
}
module.exports = COM;
