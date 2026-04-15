import React, { useState } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');

  const addTask = () => {
    if (input.trim()) {
      setTasks([...tasks, { id: Date.now(), text: input }]);
      setInput('');
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="App">
      <h1>TaskMaster</h1>
      
      <div className="input-container">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Что нужно сделать?"
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
        />
        <button onClick={addTask}>Добавить</button>
      </div>

      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <span>{task.text}</span>
            <button className="delete-btn" onClick={() => deleteTask(task.id)}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;