import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { WebSocketServer } from 'ws';
import { all, get, run } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend from ../static so the app runs on the same origin
const staticDir = path.resolve(__dirname, '..', 'static');
app.use(express.static(staticDir));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcast(event){
  const msg = JSON.stringify(event);
  wss.clients.forEach(client => {
    if(client.readyState === 1){
      try{ client.send(msg); }catch{}
    }
  });
}

// --- Auth ---
app.post('/api/login', (req, res)=>{
  const { username, password } = req.body || {};
  if(!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  const user = get('SELECT * FROM users WHERE username = ?', [username]);
  if(user && user.password === password){
    const { id, role, displayName, avatar } = user;
    return res.json({ id, username, role, displayName, avatar });
  }
  return res.status(401).json({ error: 'Invalid username or password' });
});

// --- Members ---
app.get('/api/members', (req, res)=>{
  const rows = all('SELECT * FROM members ORDER BY name');
  res.json(rows);
});

// --- Suggestions ---
app.get('/api/suggestions', (req, res)=>{
  const rows = all('SELECT * FROM suggestions ORDER BY submittedAt DESC');
  res.json(rows);
});

app.post('/api/suggestions', (req, res)=>{
  const s = req.body || {};
  if(!s.id){ s.id = `suggestion_${Date.now()}`; }
  if(!s.submittedAt){ s.submittedAt = new Date().toISOString(); }
  try{
    run('INSERT INTO suggestions (id,animeName,genre,synopsis,reason,missionRank,submittedBy,submittedAt) VALUES (?,?,?,?,?,?,?,?)', [
      s.id, s.animeName, s.genre, s.synopsis, s.reason, s.missionRank, s.submittedBy, s.submittedAt
    ]);
    broadcast({ type:'db_changed', resource:'suggestions' });
    res.status(201).json({ ok:true, id: s.id });
  }catch(err){ console.error(err); res.status(400).json({ error: 'Failed to create suggestion' }); }
});

app.delete('/api/suggestions/:id', (req, res)=>{
  try{ run('DELETE FROM suggestions WHERE id = ?', [req.params.id]); broadcast({ type:'db_changed', resource:'suggestions' }); res.json({ ok:true }); }
  catch(err){ console.error(err); res.status(400).json({ error: 'Failed to delete suggestion' }); }
});

// --- Users (admin) ---
app.get('/api/users', (req, res)=>{
  const rows = all('SELECT * FROM users ORDER BY displayName');
  res.json(rows);
});

app.post('/api/users', (req, res)=>{
  const u = req.body || {};
  if(!u.id){ u.id = `user_${u.username}`; }
  try{
    run('INSERT INTO users (id,username,password,role,displayName,avatar) VALUES (?,?,?,?,?,?)', [
      u.id, u.username, u.password, u.role, u.displayName, u.avatar || (u.displayName||'U').charAt(0).toUpperCase()
    ]);
    broadcast({ type:'db_changed', resource:'users' });
    res.status(201).json({ ok:true, id: u.id });
  }catch(err){ console.error(err); res.status(400).json({ error: 'Failed to add user' }); }
});

app.delete('/api/users/:id', (req, res)=>{
  try{ run('DELETE FROM users WHERE id = ?', [req.params.id]); broadcast({ type:'db_changed', resource:'users' }); res.json({ ok:true }); }
  catch(err){ console.error(err); res.status(400).json({ error: 'Failed to delete user' }); }
});

// --- Meetings ---
app.get('/api/meetings', (req, res)=>{
  const rows = all('SELECT * FROM meetings ORDER BY date ASC, time ASC');
  res.json(rows);
});

app.post('/api/meetings', (req, res)=>{
  const m = req.body || {};
  if(!m.id){ m.id = `meeting_${Date.now()}`; }
  if(!m.createdAt){ m.createdAt = new Date().toISOString(); }
  try{
    run('INSERT INTO meetings (id,date,time,duration,topic,focus,createdBy,createdAt) VALUES (?,?,?,?,?,?,?,?)', [
      m.id, m.date, m.time, m.duration, m.topic, m.focus, m.createdBy, m.createdAt
    ]);
    broadcast({ type:'db_changed', resource:'meetings' });
    res.status(201).json({ ok:true, id: m.id });
  }catch(err){ console.error(err); res.status(400).json({ error: 'Failed to schedule meeting' }); }
});

app.delete('/api/meetings/:id', (req, res)=>{
  try{ run('DELETE FROM meetings WHERE id = ?', [req.params.id]); broadcast({ type:'db_changed', resource:'meetings' }); res.json({ ok:true }); }
  catch(err){ console.error(err); res.status(400).json({ error: 'Failed to delete meeting' }); }
});

// --- WebSocket ---
wss.on('connection', (socket)=>{
  socket.send(JSON.stringify({ type:'hello', message:'connected' }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>{
  console.log(`Server running on http://localhost:${PORT}`);
});
