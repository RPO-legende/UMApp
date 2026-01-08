import { useEffect, useState } from 'react';
import './App.css';

interface Faculty {
  faculty_id: number;
  name: string;
}

function App() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchFaculties = async () => {
    try {
      const response = await fetch('/api/faculties');
      const data = await response.json();
      setFaculties(data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacultyName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/faculties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newFacultyName }),
      });

      if (response.ok) {
        setNewFacultyName('');
        await fetchFaculties();
      }
    } catch (error) {
      console.error('Error adding faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Faculty Management</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Add New Faculty</h2>
        <form onSubmit={handleAddFaculty} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newFacultyName}
            onChange={(e) => setNewFacultyName(e.target.value)}
            placeholder="Faculty name"
            style={{ flex: 1, padding: '8px', fontSize: '16px' }}
            disabled={loading}
          />
          <button 
            type="submit" 
            style={{ padding: '8px 20px', fontSize: '16px' }}
            disabled={loading || !newFacultyName.trim()}
          >
            {loading ? 'Adding...' : 'Add Faculty'}
          </button>
        </form>
      </div>

      <div>
        <h2>Faculties ({faculties.length})</h2>
        {faculties.length === 0 ? (
          <p style={{ color: '#666' }}>No faculties yet. Add one above!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {faculties.map((faculty) => (
              <li 
                key={faculty.faculty_id}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span><strong>#{faculty.faculty_id}</strong> - {faculty.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
