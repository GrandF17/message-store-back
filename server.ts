import express, { Request, Response } from 'express';
import WebSocket from 'ws';
import cors from 'cors';
import http from 'http';

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = process.env.API_PORT || 4000;
let messages: string[] = [];
const MAX_MESSAGES = 9;

/////////////////////////////////////
//////////// CORS POLICY ////////////

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],    // allow only localhost:3000
    methods: 'GET,POST',                // allow only GET/POST
    allowedHeaders: 'Content-Type'      // allow only this head
}));

////////////////////////////////////
//////////// GET | POST ////////////

app.post('/add_message', (req: Request, res: Response) => {
    const message: string = req.body.message.toString();

    if (!message) return res.status(400).json({ error: 'Message is required' });
    if (messages.length >= MAX_MESSAGES) messages.shift();

    messages.push(message);

    broadcast(JSON.stringify({ type: 'new_message', message }));
    res.status(201).json({ success: true });
    console.log("Recieved message:", message)
    console.log("messages now:", messages)
});

app.get('/messages', (req, res) => {
    res.json(messages);
});

app.get('/messages_amount', (req, res) => {
    res.json(MAX_MESSAGES);
});

////////////////////////////////////
///////// LISTEN CURR PORT /////////

const listener = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

////////////////////////////////////
//////////// WEB SOCKET ////////////

listener.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request);
    });
});

function broadcast(data: string) {
    console.log("Broadcast called!")
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            console.log("Broadcasted well: ", data)
            client.send(data);
        }
    });
}