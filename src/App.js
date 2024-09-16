import './App.css';
import { Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import Room from './components/Room';
import CssBaseline from '@mui/material/CssBaseline';
import ChatBot from './components/ChatBot';

function App() {
  return (
    <div className="App">
        <CssBaseline />
        <Routes>
          <Route path='/' element={<Lobby/>} />
          <Route path='/room/:id' element={<Room/>} /> 
          <Route path='/chat' element={<ChatBot/>} /> 
        </Routes>
    </div>
  );
}

export default App;
