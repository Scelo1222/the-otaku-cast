import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'server', 'data');
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'otaku_cast.db');

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  displayName TEXT NOT NULL,
  avatar TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS suggestions (
  id TEXT PRIMARY KEY,
  animeName TEXT NOT NULL,
  genre TEXT NOT NULL,
  synopsis TEXT NOT NULL,
  reason TEXT NOT NULL,
  missionRank TEXT NOT NULL,
  submittedBy TEXT NOT NULL,
  submittedAt TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  duration INTEGER NOT NULL,
  topic TEXT NOT NULL,
  focus TEXT NOT NULL,
  createdBy TEXT NOT NULL,
  createdAt TEXT NOT NULL
);
`);

function seed(){
  const countUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if(countUsers === 0){
    db.prepare('INSERT INTO users (id,username,password,role,displayName,avatar) VALUES (?,?,?,?,?,?)')
      .run('user_admin','admin','admin123','admin','Constantine','C');
    db.prepare('INSERT INTO users (id,username,password,role,displayName,avatar) VALUES (?,?,?,?,?,?)')
      .run('user_twg','thewalkingghost','member123','admin','TheWalkingGhost','T');
  }
  const countMembers = db.prepare('SELECT COUNT(*) as c FROM members').get().c;
  if(countMembers === 0){
    const stmt = db.prepare('INSERT INTO members (id,name,role,status) VALUES (?,?,?,?)');
    stmt.run('member_1','Constantine','Administrator','present');
    stmt.run('member_2','TheWalkingGhost','Administrator','present');
    stmt.run('member_3','Sombra','Member','present');
    stmt.run('member_4','FatalDemon7 (Fatal)','Member','present');
    stmt.run('member_5','M.','Member','absent');
    stmt.run('member_6','SheWolf','Member','absent');
  }
  const countMeet = db.prepare('SELECT COUNT(*) as c FROM meetings').get().c;
  if(countMeet === 0){
    db.prepare('INSERT INTO meetings (id,date,time,duration,topic,focus,createdBy,createdAt) VALUES (?,?,?,?,?,?,?,?)')
      .run('meeting_1','2025-10-11','19:30',60,'Suggestion Box Event','Low-ranking missions initiation','System', new Date().toISOString());
  }
}

seed();

export function all(sql, params = []){ return db.prepare(sql).all(params); }
export function get(sql, params = []){ return db.prepare(sql).get(params); }
export function run(sql, params = []){ return db.prepare(sql).run(params); }
