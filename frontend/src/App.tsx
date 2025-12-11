import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/hello')
      .then(r => r.json())
      .then(d => setMsg(d.msg));
  }, []);

  return (
    <div>
      <h1>React frontend</h1>
      <p>API says: {msg}</p>
    </div>
  );
}

export default App;
