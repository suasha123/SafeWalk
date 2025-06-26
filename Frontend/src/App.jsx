import { Home } from './Components/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './Style/App.css';
import { SignIn } from './Components/SignIn';
import { SignUp } from './Components/signup';
import { Otp } from './Components/otp';
function App() {
  return (
    <Router>
    <Routes>
    <Route path='/' element = {<Home/>} />
    <Route path='/signin' element = {<SignIn />} />
    <Route path='/signup' element = {<SignUp />} />
    <Route path='/otp-verify' element = {<Otp />} />
    </Routes>
    </Router>
  )
}

export default App
