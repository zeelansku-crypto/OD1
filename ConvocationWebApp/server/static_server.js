const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.static(path.join(__dirname, '../client')));

app.listen(3000, () => {
    console.log('Frontend served at http://localhost:3000');
});
