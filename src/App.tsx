import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './components/AuthPage';
import Dashboard from './components/Dashboard';
import { Toaster } from "@/components/ui/toaster"


function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <Toaster />
      </Router>
  );
}

export default App;