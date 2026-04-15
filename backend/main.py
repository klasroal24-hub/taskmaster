from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware 
import sqlite3 
 
app = FastAPI() 
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]) 
 
conn = sqlite3.connect("tasks.db", check_same_thread=False) 
c = conn.cursor() 
c.execute("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT, completed INTEGER)") 
 
@app.get("/tasks") 
def get_tasks(): 
    c.execute("SELECT id, title, completed FROM tasks") 
    return [{"id": r[0], "title": r[1], "completed": bool(r[2])} for r in c.fetchall()] 
 
@app.post("/tasks") 
def add_task(task: dict): 
    c.execute("INSERT INTO tasks (title, completed) VALUES (?, ?)", (task["title"], int(task["completed"]))) 
    conn.commit() 
    return {"ok": True} 
 
@app.put("/tasks/{task_id}") 
def update_task(task_id: int, task: dict): 
    c.execute("UPDATE tasks SET title = ?, completed = ? WHERE id = ?", (task["title"], int(task["completed"]), task_id)) 
    conn.commit() 
    return {"ok": True} 
 
@app.delete("/tasks/{task_id}") 
def delete_task(task_id: int): 
    c.execute("DELETE FROM tasks WHERE id = ?", (task_id,)) 
    conn.commit() 
    return {"ok": True} 
