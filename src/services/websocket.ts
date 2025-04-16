export function createWebSocketConnection(apiKey: string): WebSocket {
  const url = `wss://streamer.cryptocompare.com/v2?api_key=${apiKey}`;
  return new WebSocket(url);
}

export function subscribeToTopic(socket: WebSocket, topic: string) {
  const request = {
    action: 'SubAdd',
    subs: [topic],
  };
  socket.send(JSON.stringify(request));
}
