from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
from datetime import datetime

app = FastAPI()

# Разрешаем запросы с любых источников
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение к БД
conn = sqlite3.connect("tasks.db", check_same_thread=False)
c = conn.cursor()
c.execute("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT, completed INTEGER, createdAt TEXT)")

class Task(BaseModel):
    title: str
    completed: bool = False
    createdAt: Optional[str] = None

@app.get("/tasks")
def get_tasks():
    c.execute("SELECT id, title, completed, createdAt FROM tasks")
    return [{"id": r[0], "title": r[1], "completed": bool(r[2]), "createdAt": r[3]} for r in c.fetchall()]

@app.post("/tasks")
def add_task(task: Task):
    c.execute("INSERT INTO tasks (title, completed, createdAt) VALUES (?, ?, ?)", 
              (task.title, int(task.completed), task.createdAt or datetime.now().isoformat()))
    conn.commit()
    return {"ok": True}

@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: Task):
    c.execute("UPDATE tasks SET title = ?, completed = ?, createdAt = ? WHERE id = ?", 
              (task.title, int(task.completed), task.createdAt, task_id))
    conn.commit()
    return {"ok": True}

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    c.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    return {"ok": True}