import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './Style/App.css';
import { Home } from './Components/Home';
import { SignIn } from './Components/SignIn';
import { SignUp } from './Components/signup';
import { Otp } from './Components/otp';
import ChatLayout from './Components/ChatLayout';
import { Report } from './Components/ReportArea';
import { SafeWalk } from './Components/SafeWalk';
import { TrackScreen } from './Components/TrackingScrren';
import { WalkReport } from './Components/W.jsx';
import { ErrorPage } from './Components/Error.jsx';
function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/otp-verify' element={<Otp />} />
        <Route path="/chat" element={<Navigate to="/chat/chats" />} />
        <Route path="/chat/:tab" element={<ChatLayout />} />
        <Route path="/chat/:tab/:entityId" element={<ChatLayout />} />
        <Route path="/report-area" element={<Report/>} />
        <Route path="/safe-walk" element={<SafeWalk />} />
        <Route path='/trackscreen' element={<TrackScreen />} />
        <Route path="*" element={<ErrorPage />} />

      </Routes>
    </Router>
  );
}

export default App;
