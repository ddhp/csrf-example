const path = require('path');
const express = require('express');

const app = express();

app.use('/postform', (req, res) => {
  res.sendFile(path.join(__dirname, '/postform.html'));
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

// import app from './app';
const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  const host = server.address().address;
  const runningPort = server.address().port;

  console.log('express app listening at http://%s:%s', host, runningPort);
});
