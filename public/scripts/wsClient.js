function WsClient(_callback) {
 var _socket = null;
 this.connect = function(wsHost) {
  if (_socket !== null) {
   _callback({
    status: -3,
    msg: 'Cannot connect with another websocket when is already connected!!!',
    data: null,
   });
   return;
  }

  _socket = new WebSocket(wsHost);

  _socket.onmessage = function(event) {
   _callback(event.data);
  };

  _socket.onclose = function(event) {
   _callback({
    status: event.code,
    msg: event.reason,
    data: {
     wasClean: event.wasClean
    }
   });
   _socket = null;
  };

  _socket.onerror = function(error) {
   _callback({
    status: -2,
    msg: error.message,
    data: null
   });
  };

 }

 this.disconnect = function(avoidMsg) {
  if (_socket === null) {
   if (avoidMsg !== true) {
    _callback({
     status: -3,
     msg: 'Cannot disconnect wihout having connected before!!!',
     data: null,
    });
   }
   return;
  }
  _socket.close();
 }
}