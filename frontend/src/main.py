from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware 
import sqlite3 
 
app = FastAPI() 
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]) 
 
conn = sqlite3.connect("tasks.db", check_same_thread=False) 
c = conn.cursor() 
c.execute("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT, completed INTEGER)") 
