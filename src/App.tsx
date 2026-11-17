import { Route, Routes } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="min-h-screen flex items-center justify-center">
            <h1 className="text-3xl font-bold text-blue-600">
              HelpDeskNest
            </h1>
          </main>
        }
      />
    </Routes>
  )
}

export default App
