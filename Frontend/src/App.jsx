import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './Style/App.css';
import { Home } from './Components/Home';
import { SignIn } from './Components/SignIn';
import { SignUp } from './Components/signup';
import { Otp } from './Components/otp';
import ChatLayout from './Components/ChatLayout';
import { Report } from './Components/ReportArea';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/otp-verify' element={<Otp />} />

        {/* Chat Routes */}
        <Route path="/chat" element={<Navigate to="/chat/chats" />} />
        <Route path="/chat/:tab" element={<ChatLayout />} />
        <Route path="/chat/:tab/:entityId" element={<ChatLayout />} />
        <Route path="/report-area" element={<Report/>} />
      </Routes>
    </Router>
  );
}

export default App;
