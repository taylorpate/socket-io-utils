/*
*
*	SocketConnection - socket.io wrapper for rapid event dispatch & handling
*
*	https://github.com/taylorpate/socket-io-utils
*
*/

var TouchEvent = {
	SWIPE:'swipe-event',
	ROTATE:'rotate-event',
	DRAG:'drag-event'
};
var SocketEvent = {
	CONNECTED:'socket-connected'
}

function SocketConnection(ip, port, sid)
{
	var sc = {};
		sc.DataEvent = 'movesquare';
		sc.SessionID = sid;
		sc.EventDict = {};
		sc.socket = io.connect('http://' + ip + ':' + port );
		sc.socket.on('connect', function()
		{
			console.log('Successful Socket Connection: ' + ip + ':' + port);
			sc.dispatchEvent(SocketEvent.CONNECTED, sc.SessionID);
		});
		sc.socket.on(sc.DataEvent, function(data)
		{
			if(data.sid == sc.SessionID)
			{
				sc.runCallBack(data.id, data.payload);
			}
		});	
		sc.socket.on('disconnect', function() 
		{
			console.log('Socket Disconnected');
		});
		
		sc.addEventListener = function(event_id, callback_function)
		{
			if (!sc.EventDict.hasOwnProperty(event_id))
			{ 
				sc.EventDict[event_id] = [];
			}
			sc.EventDict[event_id].push(callback_function);

			console.log('Added new action: ' + event_id);
		}
		
		sc.removeEventListener = function(event_id, callback_function)
		{
			if (sc.EventDict.hasOwnProperty(event_id))
			{ 
				var newED = {}
				for(var i=0; i<sc.EventDict[event_id].length; i++)
				{
					if(sc.EventDict[event_id][i] == callback_function)
					{
						sc.EventDict[event_id].splice(i, 1);
						console.log('Removed event: ' + event_id);
						break;
					}
				}
			}
			else
			{
				console.log('Error: Cannot remove event listener that does not exist - ' + event_id);
			}
		}
		
		sc.dispatchEvent = function(event_id, event_payload)
		{
			console.log('dispatching event: ' + event_id);
			if(event_id == SocketEvent.CONNECTED)
			{
				if(sc.EventDict.hasOwnProperty(SocketEvent.CONNECTED))
				{
					sc.runCallBack(event_id, event_payload);
				}
			}
			else
			{	
				var data = {
					id: event_id,
					payload: event_payload,
					sid: sc.SessionID
				};
				sc.socket.emit('devicemove', data);
			}
		}
		
		sc.runCallBack = function(event_id, data)
		{
			if(sc.EventDict.hasOwnProperty(event_id))
			{
				for(var i=0; i<sc.EventDict[event_id].length; i++)
				{
					sc.EventDict[event_id][i](data);
					break;
				}
			}
		}
		
		sc.genID = function()
		{
			var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			for( var i=0; i < 8; i++ )
				text += possible.charAt(Math.floor(Math.random() * possible.length));

			sc.SessionID = text;
			console.log("Session ID set: " + sc.SessionID);
		}
		
		if(!sc.SessionID)
		{
			sc.genID();
		}
		
	return sc;
}