import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
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

export default SocketHandler;
  
  
