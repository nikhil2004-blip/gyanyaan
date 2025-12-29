const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS for frontend requests
app.use(cors());

// Serve static files from the assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
    res.send('ISRO Sim Backend Operational');
});

app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
