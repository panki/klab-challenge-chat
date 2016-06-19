
codeTest = {
	config: {
		server: window.location.hostname + ':' + window.location.port
	},
	nickName: 'person' + Math.floor(Math.random() * 1000),
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
	jQuery('#connect').on('click', connect);
  jQuery('#serverUrl').val(codeTest.config.server);
  jQuery('#nickname').val(codeTest.nickName);
  jQuery('#channel').val(codeTest.channel);

  connect();
};

function connect() {
  console.log(codeTest);
  if (codeTest.client !== null) {
      // Actually this code does nothing,
      // socket will not be closed and destroyed
      delete codeTest.client;
    }
  codeTest.config.server = jQuery('#serverUrl').val();
  codeTest.client = setupSocket();
}

function joinChannel() {
	var channel = jQuery('#channel').val();
	jQuery('#messages').empty();codeTest.channel = channel;
	send2server('join', { channel: channel });
	return codeTest.channel;
};


function setNick() {
	var nick = jQuery('#nickname').val();
	codeTest.nickName = nick;
	send2server('nick', { nick: nick });
	return codeTest.nickName;
};


function sendMsg(text) {
	var data = {
		author: codeTest.nickName,
		channel: codeTest.channel,
		text: text
	};
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
	var msgString = '<span>{' + data.channel + '@' + timestamp.toLocaleTimeString() + '} [' + (data.author == codeTest.nickName ? 'YOU' : data.author) + '] ' + data.text + '</span><br/>';
  var container = jQuery('#messages');
	container.append(msgString);
  container.scrollTop(container.prop("scrollHeight"));
};


function setupSocket() {
	try {
		var testSocket = new Socket(codeTest.config.server, { autoReconnect: true });
		testSocket.on('reconnect', function(msg, e) {
      jQuery('#wsstatus').text(Date.now() + ' connection open (reconnected)');
			console.log('[reconnected]');
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
