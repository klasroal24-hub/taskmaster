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

  // 1. Загрузка задач из localStorage (БЕЗ БЭКЕНДА, ЧТОБЫ НЕ ТОРМОЗИЛО)
  useEffect(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // 2. Сохранение задач в localStorage при каждом изменении
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Анимация Кеши (оригинальная от Дипсика)
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
        from = { x, y };
        to = { x: Math.random() * (window.innerWidth - 280), y: Math.random() * (window.innerHeight - 180) };
        frame = requestAnimationFrame(step);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  // ПОФИКШЕННАЯ ФУНКЦИЯ ДОБАВЛЕНИЯ (Теперь точно работает)
  const addTask = () => {
    if (!newTask.trim()) {
      setParrotMessage('⚠️ Пустую задачу не добавишь. Напиши что-то.');
      return;
    }
    
    const now = new Date();
    const krasTime = now.toLocaleString('ru-RU', { timeZone: 'Asia/Krasnoyarsk' });
    
    const task = { 
      id: Date.now(), 
      title: newTask, 
      completed: false, 
      createdAt: krasTime 
    };

    setTasks([...tasks, task]); // Обновляем список задач
    setNewTask(''); // Очищаем поле ввода
    setParrotMessage(`✅ Задача "${task.title}" добавлена!`);
    
    setTimeout(() => setParrotMessage('💡 Жми ✅ когда сделаешь, 🗑️ если не нужно'), 4500);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    const task = tasks.find(t => t.id === id);
    setParrotMessage(!task.completed ? `🎉 Отлично! Выполнено.` : `↩️ Вернули задачу.`);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    setParrotMessage(`🗑️ Задача удалена.`);
  };

  const saveNote = () => {
    if (!note.trim()) {
      setParrotMessage('📝 Заметка пустая.');
      return;
    }
    setSavedNotes([...savedNotes, { text: note, date: new Date().toLocaleString('ru-RU') }]);
    setNote('');
    setParrotMessage('📌 Заметка сохранена!');
  };

  const updateTimer = () => {
    if (!timerTarget) {
      setTimeLeft(null);
      return;
    }
    const target = new Date(timerTarget);
    const diff = target - new Date();
    if (diff <= 0) {
      setTimeLeft('🔔 СОБЫТИЕ НАСТУПИЛО!');
      return;
    }
    const days = Math.floor(diff / (1000 * 3600 * 24));
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    setTimeLeft(`${days}д ${hours}ч ${minutes}м ${seconds}с`);
  };

  useEffect(() => {
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [timerTarget]);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
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
                    <button onClick={() => toggleTask(task.id)}>{task.completed ? '↩️ вернуть' : '✅ готово'}</button>
                    <button onClick={() => deleteTask(task.id)}>🗑️ удалить</button>
                  </div>
                </li>
              ))}
              {filteredTasks.length === 0 && <div className="empty-message">✨ ЗАДАЧ ПОКА НЕТ. ДОБАВЬ ПЕРВУЮ!</div>}
            </ul>
          </div>

          <div className="right-panel">
            <div className="timer-panel">
              <h3>⏱ таймер событий</h3>
              <input type="datetime-local" value={timerTarget} onChange={e => setTimerTarget(e.target.value)} />
              {timeLeft && <div className="timer-display">{timeLeft}</div>}
            </div>

            {showNotes && (
              <div className="notes-panel">
                <h3>📝 быстрые заметки</h3>
                <textarea placeholder="напиши что-то..." value={note} onChange={e => setNote(e.target.value)} />
                <button onClick={saveNote}>💾 сохранить заметку</button>
                <div className="notes-list">
                  {savedNotes.slice().reverse().map((n, i) => (
                    <div key={i} className="note-item"><div>{n.text}</div><small>{n.date}</small></div>
                  ))}
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