import '@vercel/edge'
export const runtime = 'edge'; 
import { Server } from 'socket.io';

export default function handler(req, res) {
	if (!res.socket.server.io) {
	const io = new Server(res.socket.server);
	res.socket.server.io = io;
		io.on('connection', (socket) => {
        socket.on('ping', (message) => {
			socket.emit('pong', message);
		});
		socket.on('disconnect', () => {res.end()});
	});
}
  
  
