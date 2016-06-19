
codeTest = {
	config: {
		server: '127.0.0.1:8080'
	},
	nickName: 'person1',
	channel: 'defaultChannel',
	client: null
};

jQuery(document).ready(init);


function init() {
	jQuery('#sendMsg').on('click', function() {
			sendMsg(jQuery('#message').val());
  });
	jQuery('#setNick').on('click', setNick);
	jQuery('#joinChannel').on('click', joinChannel);
	jQuery('#connect').on('click', function(e) {
    if (typeof codeTest.client !== null) {
      delete codeTest.client;
    }
    codeTest.config.server = jQuery('#serverUrl').val();
    codeTest.client = setupSocket();
  });
	drawMessage({ author:'system', channel: codeTest.channel, text: 'welcome to the test', timestamp: new Date() });
};


function joinChannel() {
	var channel = jQuery('#channel').val();
	jQuery('#messages').empty();codeTest.channel = channel;
	drawMessage({ author:'system', channel: codeTest.channel, text: 'welcome to a new channel (' + channel + '), ' + codeTest.nickName, timestamp: new Date() });
	send2server('join', { channel: channel });
	return codeTest.channel;
};


function setNick() {
	var nick = jQuery('#nickname').val();
	codeTest.nickName = nick;
	drawMessage({ author:'system', channel: codeTest.channel, text: 'greetings, ' + nick + '!', timestamp: new Date() });
	send2server('nick', { nick: nick });
	return codeTest.nickName;
};


function sendMsg(text) {
	var data = {
		author: codeTest.nickName,
		channel: codeTest.channel,
		text: text
	};
	drawMessage({ author:'YOU', channel: data.channel, text: data.text, timestamp: new Date() });
	return send2server('msg', data);
};


function send2server(command, data) {
	return codeTest.client.send(
		{
			command:command,
			data: data
		}
	);
};


function handleMessageFromServer(msg) {
	if (typeof msg.command !== 'undefined' && typeof msg.data !== 'undefined') {
		if (msg.command === 'msg') {
			drawMessage(msg.data);
		}
	}
};


function drawMessage(data) {
  console.log(data)
  var timestamp = data.timestamp ? ( typeof data.timestamp == 'string' ? new Date(data.timestamp) : data.timestamp ) : new Date();
	var msgString = '<span>{' + data.channel + '@' + timestamp.toLocaleTimeString() + '} [' + data.author + '] ' + data.text + '</span><br/>';
	jQuery('#messages').append(msgString);
};


function setupSocket() {
	try {
		var testSocket = new Socket(codeTest.config.server, { autoReconnect: true });
		testSocket.on('reconnect', function(msg, e) {
			console.log('reconnected');
      setNick()
      joinChannel()
		});
		testSocket.on('close', function(e) {
			console.log('[close]');
			jQuery('#wsstatus').text(Date.now() + ' connection closed');
		});
		testSocket.on('error', function(e) {
			console.log('[error]');
			jQuery('#wsstatus').text(Date.now() + ' connection error');
		});
		testSocket.on('open', function(e) {
			jQuery('#wsstatus').text(Date.now() + ' connection open');
			console.log('[open]');
      setNick()
      joinChannel()
		});
    testSocket.on('message', function(msg) {
				console.log('[message]', msg);
				handleMessageFromServer(msg);
			});
		jQuery('#wsstatus').text(Date.now() + ' connecting to [' + codeTest.config.server + ']');
	} catch(err) {
		jQuery('#wsstatus').text(Date.now() + ' connection failed: ' + err);
	}
	return testSocket;
};
