let SERVERS = [];

const serversJson = process.env.SERVERS_JSON;

if (serversJson) {
  try {
    SERVERS = JSON.parse(serversJson); 
  } catch (error) { 
      const SERVERS = [{ name: 'Azure (Free AppService)', pingUrl: 'http://127.0.0.1:3000/api/ping', downloadUrl: 'http://127.0.0.1:3000/api/download', uploadUrl: 'http://127.0.0.1:3000/api/upload', maxUpload: '27262976' } ];
  }
} else {
      const SERVERS = [{ name: 'Azure (Free AppService)', pingUrl: 'http://127.0.0.1:3000/api/ping', downloadUrl: 'http://127.0.0.1:3000/api/download', uploadUrl: 'http://127.0.0.1:3000/api/upload', maxUpload: '27262976' } ];
}

module.exports = SERVERS;
