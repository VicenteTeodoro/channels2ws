class Message {
  constructor(data = null, status = 0, msg = '') {
    this.computerName = process.env['COMPUTERNAME'];
    this.msg = msg;
    this.status = status;
    this.data = data;
  }
}

module.exports = Message;
