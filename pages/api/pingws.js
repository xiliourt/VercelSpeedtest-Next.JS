import '@vercel/edge'
export const runtime = 'edge'; 
import { Server } from 'socket.io';

export default function handler(req, res) {
	const headers = {
		'Cache-Control': 's-maxage=3600',
		'Content-Type': 'text/plain',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET',
		'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
	};

	// If it's not a websocket connection (it's just waking up the server)
	if (!res.socket) { return new Response('OK', {status: 200, headers: headers}); }
	else if (!res.socket.server.io) {
		const io = new Server(res.socket.server);
		res.socket.server.io = io;
		io.on('connection', (socket) => {
	    	socket.on('ping', (message) => {
				socket.emit('pong', message);
			});
		socket.on('disconnect', () => {res.end()});
		});
	}
}
  
  
