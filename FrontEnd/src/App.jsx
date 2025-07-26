import './App.css'
import axios from 'axios'
import { useEffect } from 'react'
import { useState } from 'react'

function App() {
  const [data, setData] = useState(null)
  useEffect(() => {
    axios
      .get("/api/v1/links/getUserLinks")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [])
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to the App</h1>
        {data ? (
          <div>
            <h2>User Data:</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        ) : (
          <p>Loading user data...</p>
        )}
      </header>
    </div>
  )
}

export default App
