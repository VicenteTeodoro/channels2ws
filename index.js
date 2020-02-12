const service = require('os-service');
let index = 0;

process.argv.forEach((arg, i) => {
 if (arg.indexOf('--add') > -1 || arg.indexOf('--run') > -1 || arg.indexOf('--remove') > -1) {
  index = i;
 }
});


if (process.argv[index] == '--add') {
 service.add('channel2ws', { programArgs: ['--run'] }, function(error) {
  if (error)
   console.trace(error);
 });
} else if (process.argv[index] == '--remove') {
 service.remove('channel2ws', function(error) {
  if (error)
   console.trace(error);
 });
} else if (process.argv[index] == '--run') {
 service.run(function() {
  service.stop(0);
 });

 app();
} else {
 app();
}

function app() {

 const WebServer = require('./src/webserver');
 const WebSocket = require('./src/websocket');
 const Channels = require('./src/channels');

 const config = require('./src/config');
 const websocket = new WebSocket(config);
 const com = new Channels.COM(websocket, config.COMParameters);
 const tcp = new Channels.TCP(websocket, config.TCPParameters);
 const webserver = new WebServer(config);

 config.addOnChange(() => {
  let interval = null;

  com.close();
  tcp.close();
  websocket.close();
  webserver.close();

  interval = setInterval(() => {
   if (com.isClosed() === false || tcp.isClosed() === false || websocket.isClosed() === false || webserver.isClosed() === false) {

    if (com.isClosed() === false) {
     com.close();
    }

    if (tcp.isClosed() === false) {
     tcp.close();
    }

    if (websocket.isClosed() === false) {
     websocket.close();
    }

    if (webserver.isClosed() === false) {
     webserver.close();
    }

    return;
   }
   clearInterval(interval);
   Start();
  }, 2000);
 });

 function Start() {

  websocket.start();
  webserver.start();

  switch (config.selectedChannel.toLowerCase()) {
   case 'tcp':
    {
     tcp.start();
     break;
    }
   case 'serial':
    {
     com.start();
     break;
    }
  }
 }

 function onChannelError() {
  setTimeout(Start, 1000);
 }

 com.addErrorListener(onChannelError);
 tcp.addErrorListener(onChannelError);

 Start();
}