import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [timerTarget, setTimerTarget] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [parrotMessage, setParrotMessage] = useState('🦜 Привет! Я Кеша. Добавляй задачи!');
  const [parrotPosition, setParrotPosition] = useState({ x: 20, y: 20 });
  const [showNotes, setShowNotes] = useState(false);
  const [note, setNote] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);

  // Загрузка задач из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Сохранение задач в localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Загрузка заметок
  useEffect(() => {
    const saved = localStorage.getItem('notes');
    if (saved) setSavedNotes(JSON.parse(saved));
  }, []);

  // Сохранение заметок
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(savedNotes));
  }, [savedNotes]);

  // ДОБАВЛЕНИЕ ЗАДАЧИ (исправлено)
  const addTask = () => {
    if (newTask.trim() === '') {
      setParrotMessage('⚠️ Напиши задачу!');
      return;
    }
    const newTaskObj = {
      id: Date.now(),
      title: newTask,
      completed: false,
      createdAt: new Date().toLocaleString('ru-RU')
    };
    setTasks(prevTasks => [...prevTasks, newTaskObj]);
    setNewTask('');
    setParrotMessage(`✅ Задача "${newTask}" добавлена!`);
  };

  // Переключение статуса
  const toggleTask = (id) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  // Удаление задачи
  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Сохранение заметки
  const saveNote = () => {
    if (note.trim() === '') return;
    setSavedNotes([...savedNotes, { text: note, date: new Date().toLocaleString('ru-RU') }]);
    setNote('');
    setParrotMessage('📌 Заметка сохранена!');
  };

  // Таймер
  const updateTimer = () => {
    if (!timerTarget) {
      setTimeLeft(null);
      return;
    }
    const target = new Date(timerTarget);
    if (isNaN(target.getTime())) {
      setTimeLeft('❌ неверная дата');
      return;
    }
    const diff = target - new Date();
    if (diff <= 0) {
      setTimeLeft('🔔 СОБЫТИЕ НАСТУПИЛО!');
      return;
    }
    const days = Math.floor(diff / (1000 * 3600 * 24));
    const hours = Math.floor((diff % (86400000)) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    setTimeLeft(`${days}д ${hours}ч ${minutes}м ${seconds}с`);
  };

  useEffect(() => {
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [timerTarget]);

  // Анимация Кеши
  useEffect(() => {
    let frame;
    let start = null;
    const duration = 7000;
    let from = { ...parrotPosition };
    let to = { x: Math.random() * (window.innerWidth - 280), y: Math.random() * (window.innerHeight - 180) };
    const step = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      const x = from.x + (to.x - from.x) * ease;
      const y = from.y + (to.y - from.y) * ease;
      setParrotPosition({ x, y });
      if (t < 1) {
        frame = requestAnimationFrame(step);
      } else {
        start = null;
        from = { ...parrotPosition };
        to = { x: Math.random() * (window.innerWidth - 280), y: Math.random() * (window.innerHeight - 180) };
        frame = requestAnimationFrame(step);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="app">
      <div className="animated-bg"></div>
      <div className="container">
        <div className="header">
          <div className="logo">🧠 TaskMaster</div>
          <div className="subtitle">с Кешей любое дело спорится</div>
        </div>

        <div className="add-task">
          <input 
            type="text" 
            placeholder="новая задача" 
            value={newTask} 
            onChange={e => setNewTask(e.target.value)} 
            onKeyPress={e => e.key === 'Enter' && addTask()} 
          />
          <button onClick={addTask}>➕ добавить задачу</button>
        </div>

        <div className="filters">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>все</button>
          <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>активные</button>
          <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>выполненные</button>
          <button className={showNotes ? 'active' : ''} onClick={() => setShowNotes(!showNotes)}>📝 заметки</button>
        </div>

        <div className="two-columns">
          <div className="tasks-column">
            <ul className="task-list">
              {filteredTasks.map(task => (
                <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="task-info">
                    <span className="task-title">{task.title}</span>
                    <span className="task-date">{task.createdAt}</span>
                  </div>
                  <div className="task-actions">
                    <button onClick={() => toggleTask(task.id)}>{task.completed ? '↩️' : '✅'}</button>
                    <button onClick={() => deleteTask(task.id)}>🗑️</button>
                  </div>
                </li>
              ))}
              {filteredTasks.length === 0 && <div className="empty-message">✨ задач пока нет. Добавь первую!</div>}
            </ul>
          </div>

          <div className="right-panel">
            <div className="timer-panel">
              <h3>⏱ таймер событий</h3>
              <input type="datetime-local" value={timerTarget} onChange={e => setTimerTarget(e.target.value)} />
              {timeLeft && <div className="timer-display">{timeLeft}</div>}
              <p className="timer-hint">выбери дату и время → Кеша покажет, сколько осталось</p>
            </div>

            {showNotes && (
              <div className="notes-panel">
                <h3>📝 быстрые заметки</h3>
                <textarea placeholder="напиши что-нибудь важное..." value={note} onChange={e => setNote(e.target.value)} />
                <button onClick={saveNote}>💾 сохранить заметку</button>
                <div className="notes-list">
                  {savedNotes.slice().reverse().map((n, i) => (
                    <div key={i} className="note-item"><div>{n.text}</div><small>{n.date}</small></div>
                  ))}
                  {savedNotes.length === 0 && <div className="empty-notes">нет заметок</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="parrot" style={{ position: 'fixed', left: parrotPosition.x, bottom: parrotPosition.y }}>
        <div className="parrot-icon">🦜</div>
        <div className="parrot-bubble"><p>{parrotMessage}</p></div>
      </div>
    </div>
  );
}

export default App;