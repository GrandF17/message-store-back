import WebSocket from 'ws';
const wss = new WebSocket.Server({ noServer: true });

// setup of WebSocket
export function broadcast(data: string) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}