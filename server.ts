import express, { Request, Response } from 'express';
import { broadcast } from '@/utils/broadcast';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.API_PORT || 4000;
let messages: string[] = [];
const MAX_MESSAGES = 9;

/////////////////////////////////////
//////////// CORS POLICY ////////////

app.use(cors({
    origin: 'http://localhost:3000', // allow only localhost:3000
    methods: 'GET,POST', // allow only GET/POST
    allowedHeaders: 'Content-Type' // allow only this head
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
});

app.get('/messages', (req, res) => {
    res.json(messages);
});

////////////////////////////////////
///////// LISTEN CURR PORT /////////

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});