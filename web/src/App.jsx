import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Upload from './pages/Upload'
import Processing from './pages/Processing'
import SanityCheck from './pages/SanityCheck'
import Results from './pages/Results'
import Letter from './pages/Letter'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/processing" element={<Processing />} />
        <Route path="/sanity-check" element={<SanityCheck />} />
        <Route path="/results" element={<Results />} />
        <Route path="/letter" element={<Letter />} />
      </Routes>
    </BrowserRouter>
  )
}
