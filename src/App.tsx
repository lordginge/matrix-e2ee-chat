import { Routes, Route } from 'react-router'
import { MatrixProvider } from './hooks/useMatrixClient'
import Home from './pages/Home'

export default function App() {
  return (
    <MatrixProvider>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </MatrixProvider>
  )
}
