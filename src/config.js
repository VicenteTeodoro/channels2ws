const path = require('path');
const fs = require('fs');
const SerialPort = require('serialport');
let fileName = '';
if (process.env.DEBUG === undefined) {
 fileName = path.resolve(process.execPath, '../config.json');
} else {
 fileName = path.resolve(__dirname, '../config.json');
}
const onChangeCallbacks = [];
let config = null;

try {
 config = JSON.parse(fs.readFileSync(fileName));
} catch (error) {
 if (fs.existsSync(fileName) === false) {
  console.log('The config.json file not found. It will use the default configuration.');
 } else {
  console.log(error);
 }
}

if (config == null) {
 config = {
  channels: ['Serial', 'TCP'],
  selectedChannel: 'Serial',
  whiteList: ['localhost'],
  COMParameters: {
   selectedPort: 'COM99',
   baudRate: 9600,
   dataBits: 8,
   stopBits: 1,
   parity: 'none',
   rtscts: false,
   COMPorts: ['COM98', 'COM99'],
  },
  TCPParameters: {
   port: 1234,
   ipAddress: '127.0.0.1',
  },
  WebServer: {
   port: 3000,
  },
  WebSocket: {
   port: 8085,
  },
 };
} else {

 if (!config.channels || config.channels.length <= 0) {
  config.channels = ['Serial', 'TCP'];
 }

 if (!config.selectedChannel) {
  config.selectedChannel = 'Serial';
 }

 if (!config.COMParameters) {
  config.COMParameters = {};
 }

 if (!config.COMParameters.selectedPort) {
  config.COMParameters.selectedPort = 'COM99';
 }

 if (config.COMParameters.baudRate === undefined) {
  config.COMParameters.baudRate = 9600;
 }

 if (config.COMParameters.dataBits === undefined) {
  config.COMParameters.dataBits = 8;
 }

 if (config.COMParameters.stopBits === undefined) {
  config.COMParameters.stopBits = 1;
 }

 if (config.COMParameters.parity === undefined) {
  config.COMParameters.parity = 'none';
 }

 if (config.COMParameters.rtscts === undefined) {
  config.COMParameters.rtscts = false;
 }

 if (!config.COMParameters.COMPorts) {
  config.COMParameters.COMPorts = ['COM98', 'COM99'];
 }

 if (!config.WebServer) {
  config.WebServer = {};
 }

 if (!config.WebServer.port) {
  config.WebServer.port = 3000;
 }

 if (!config.WebSocket) {
  config.WebSocket = {};
 }

 if (!config.WebSocket.port) {
  config.WebSocket.port = 8085;
 }

 if (!config.whiteList) {
  config.whiteList = [];
 }
}
console.log(`Configuration: ${JSON.stringify(config)}`);

config.save = function(avoidEvent) {
 const save = config.save;
 const addOnChange = config.addOnChange;
 delete config.save;
 delete config.addOnChange;
 fs.writeFileSync(fileName, JSON.stringify(config));
 config.save = save;
 config.addOnChange = addOnChange;
 onChangeCallbacks.forEach((callbacks) => {
  if (typeof callbacks === 'function' && avoidEvent !== true) {
   callbacks();
  }
 });
};

config.addOnChange = function(callback) {
 onChangeCallbacks.push(callback);
};

SerialPort.list().then((ports) => {
 if (ports.length > 0) {
  config.COMParameters.COMPorts.length = 0;
  ports.forEach((port) => {
   config.COMParameters.COMPorts.push(port.path);
  });
 } else {
  console.warn('COM ports not found the listed COM ports might not reflect the reality!!!');
 }
 if (config.COMParameters.COMPorts.find((item) => item === 'COM98') === undefined) {
  config.COMParameters.COMPorts.push('COM98');
 }
 if (config.COMParameters.COMPorts.find((item) => item === 'COM99') === undefined) {
  config.COMParameters.COMPorts.push('COM99');
 }
});

config.save(true);

module.exports = config;