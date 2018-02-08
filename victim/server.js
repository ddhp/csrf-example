const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser('cookie-parser-secret'));

app.use(session({
  secret: ['my-secret-key'],
  resave: false,
  saveUninitialized: false,
}));

// app.use(cookieSession({
//   name: 'session',
//   keys: ['my-secret-key'],
//  
//   // Cookie Options
//   maxAge: 24 * 60 * 60 * 1000 // 24 hours
// }));

app.use((req, res, next) => {
  const { session } = req;
  console.log(session);
  next();
});

app.use((req, res, next) => {
  console.log(`called ${req.method} ${req.path}`);
  next();
});

app.get('/api/vulnerable', (req, res) => {
  const { session } = req;
  if (session.randomId) {
    return res.status(200).json(`${req.path} authorized with ${session.randomId}`);
  } else {
    return res.status(401).json('user not found');
  }
});

app.post('/api/vulnerable', (req, res) => {
  const { session } = req;
  if (session.randomId) {
    console.log(`request to ${req.path} is authorized`);
    return res.status(200).json(`${req.path} authorized with ${session.randomId}`);
  } else {
    return res.status(401).json('user not found');
  }
});

function setHeaders (req, res, next) {
  const cookie = req.get('Cookie');
  console.log(`cookie in req ${cookie}`);
  res.set({
    // 'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Origin': 'http://csrf-attacker.local',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'X-XSRF-TOKEN, X-SOMETHING-ELSE',
  });
  next();
}

app.post('/api/protected', setHeaders, (req, res) => {
  const { session, cookies } = req;
  const xsrftokenFromCookie = cookies.xsrftoken;
  const xsrftokenFromHeader = req.get('X-XSRF-TOKEN');
  // check double submit cookie
  if (!session.randomId) {
    return res.status(401).json('user not found');
  } else if (!xsrftokenFromCookie || !xsrftokenFromHeader || xsrftokenFromCookie !== xsrftokenFromHeader) {
    return res.status(400).json('invalid request');
  } else {
    return res.status(200).json(`${req.path} authorized with ${session.randomId}`);
  }
});

/** 
 *
 * this api demostrate that user login through this
 * and it would set a unique data in session
 * and server app decide if it's the same user
 * by checking this unique data
 *
 */
app.get('/api/set-session', (req, res) => {
  const { session } = req;
  session.randomId = Math.random();
  res.status(200).json('done');
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

// import app from './app';
const port = process.env.PORT || 5100;

const server = app.listen(port, () => {
  const host = server.address().address;
  const runningPort = server.address().port;

  console.log('express app listening at http://%s:%s', host, runningPort);
});
