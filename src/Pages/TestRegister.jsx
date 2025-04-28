import { useState } from 'react'

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    
    const userData = { name, email };
    console.log("Sending data to server:", userData);
    
    try {
      // your existing fetch code
      const response = await fetch('http://localhost:5000/register', {
        method: "post",
        body: JSON.stringify({ name, email }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setMessage("Data saved successfully");
        setEmail("");
        setName("");
      } else {
        setError(result.message || "Failed to register user");
      }
    } catch (err) {
      setError("Error connecting to server: " + err.message);
    }
  }

  return (
    <>
      <h1>This is React WebApp</h1>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleOnSubmit}>
        <input 
          type="text" 
          placeholder="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <input 
          type="email" 
          placeholder="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export default App;