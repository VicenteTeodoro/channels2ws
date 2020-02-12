var comContainer = document.getElementById('comContainer');
var tcpContainer = document.getElementById('tcpContainer');
var wsContainer = document.getElementById('wsContainer');
var testContainer = document.getElementById('testContainer');
var tabs = document.getElementsByTagName('li');

var selChannel = document.getElementById('selChannel');
var lblChannel = document.getElementById('lblChannel');
var comPort = document.getElementById('comPort');
var baudRate = document.getElementById('baudRate');
var dataBits = document.getElementById('dataBits');
var parity = document.getElementById('parity');
var stopBits = document.getElementById('stopBits');
var flowControl = document.getElementById('flowControl');
var ipAddress = document.getElementById('ipAddress');
var tcpPort = document.getElementById('tcpPort');
var configPort = document.getElementById('configPort');
var wsPort = document.getElementById('wsPort');
var whiteList = document.getElementById('whiteList');
var testDisplay = document.getElementById('testDisplay');

var update = document.getElementById('update');
var testActions = document.getElementById('testActions');

var wsClient = new WsClient(treatWsClientMessages);

function getXhr() {
 return new XMLHttpRequest();
}

function init() {
 var xhr = getXhr();
 var data = null;
 xhr.onreadystatechange = function() {
  if (xhr.readyState !== 4) {
   return;
  }
  if (xhr.status !== 200) {
   console.log('Error trying to reach the service!!!');
  }
  data = JSON.parse(xhr.responseText);

  data.COMParameters.COMPorts.forEach(port => {
   var opt = document.createElement('option');
   opt.value = port;
   opt.text = port;
   comPort.appendChild(opt);
  });
  comPort.value = data.COMParameters.selectedPort;

  data.channels.forEach(channel => {
   var opt = document.createElement('option');
   opt.value = channel;
   opt.text = channel;
   selChannel.appendChild(opt);
  });
  selChannel.value = data.selectedChannel;

  baudRate.value = data.COMParameters.baudRate;
  dataBits.value = data.COMParameters.dataBits;
  parity.value = data.COMParameters.parity;
  stopBits.value = data.COMParameters.stopBits;
  if (data.COMParameters.rtscts === false) {
   flowControl.value = 0;
  } else {
   flowControl.value = 1;
  }

  ipAddress.value = data.TCPParameters.ipAddress;
  tcpPort.value = data.TCPParameters.port;

  configPort.value = data.WebServer.port;
  wsPort.value = data.WebSocket.port;
  whiteList.value = '';
  data.whiteList.forEach(item => {
   if (whiteList.value === '')
    whiteList.value = item;
   else
    whiteList.value += '\n' + item;
  });

  selChannel.addEventListener('change', onSelChannelChange);
  onSelChannelChange();
 }
 xhr.open('GET', '/config');
 xhr.send();
}
onSelChannelChange = function() {
 switch (selChannel[selChannel.selectedIndex].value) {
  case "TCP":
   {
    comContainer.style.display = 'none';
    tcpContainer.style.display = 'inline-grid';
    break;
   }
  case "Serial":
   {
    tcpContainer.style.display = 'none';
    comContainer.style.display = 'inline-grid';
    break;
   }
 }

}
update.addEventListener('click', function() {
 var data = {
  selectedChannel: selChannel[selChannel.selectedIndex].value,
  whiteList: whiteList.value.split('\n'),
  WebServer: { port: configPort.value },
  WebSocket: {
   port: wsPort.value,
  }
 };

 wsClientAction(null, true);

 switch (data.selectedChannel.toLowerCase()) {
  case 'tcp':
   {
    data.tcpPort = tcpPort.value;
    data.ipAddress = ipAddress.value;
    break;
   }
  case 'serial':
   {
    data.selectedPort = comPort[comPort.selectedIndex].value;
    data.baudRate = baudRate.value;
    data.dataBits = dataBits.value;
    data.stopBits = stopBits.value;
    data.rtscts = flowControl.value == 0 ? false : true;
    data.parity = parity.value.toLowerCase();
    break;
   }
 }
 var xhr = getXhr();
 xhr.onreadystatechange = function() {}
 xhr.open('POST', '/config');
 xhr.setRequestHeader('Content-Type', 'application/json');
 xhr.send(JSON.stringify(data));
});

function tabSelect() {

 for (var i = 0; i < tabs.length; i++) {
  tabs[i].classList.remove('selected');
 }

 this.classList.add('selected');

 if (this.getAttribute('id') === 'tabServer') {
  comContainer.style.display = 'none';
  tcpContainer.style.display = 'none';
  wsContainer.style.display = 'inline-grid';
  testContainer.style.display = 'none';
  selChannel.style.display = 'none';
  lblChannel.style.display = 'none';
  update.style.display = '';
 } else if (this.getAttribute('id') === 'tabTest') {
  comContainer.style.display = 'none';
  tcpContainer.style.display = 'none';
  wsContainer.style.display = 'none';
  selChannel.style.display = 'none';
  lblChannel.style.display = 'none';
  wsContainer.style.display = 'none';
  testContainer.style.display = 'inline-grid';
  update.style.display = 'none';
 } else {
  selChannel.style.display = '';
  lblChannel.style.display = '';
  wsContainer.style.display = 'none';
  testContainer.style.display = 'none';
  update.style.display = '';
  onSelChannelChange();
 }

}
for (var i = 0; i < tabs.length; i++) {
 tabs[i].addEventListener('click', tabSelect);
}

testActions.addEventListener('click', wsClientAction);

function wsClientAction(ev, forceDisconnect) {

 if (testActions.innerHTML.toLowerCase() === 'connect' && forceDisconnect !== true) {
  testActions.innerHTML = 'Disconnect';
  wsClient.connect('ws://localhost:' + parseInt(wsPort.value, 10));
 } else {
  testActions.innerHTML = 'Connect';
  wsClient.disconnect(forceDisconnect);
 }

}

function treatWsClientMessages(data) {
 var msg = typeof data === 'string' ? JSON.parse(data) : data;
 testDisplay.value = 'msg: ' + msg.msg + '\n';
 testDisplay.value += 'status: ' + msg.status + '\n';
 testDisplay.value += 'computerName: ' + msg.computerName + '\n';
 testDisplay.value += 'data: ' + JSON.stringify(msg.data) + '\n';
}

setTimeout(init, 100);