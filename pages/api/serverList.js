export default function handler(req, res) {
  const SERVERS = process.env.SERVERS_JSON;
  res.status(200).json({ SERVERS });
}
