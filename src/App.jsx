import { useState } from 'react'
import './App.css'
import RegisterForm from './components/RegisterForm'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="card">
        <h1>Task Hub Application</h1>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>

      {/* Форма регистрации */}
      <RegisterForm />
    </>
  )
}

export default App