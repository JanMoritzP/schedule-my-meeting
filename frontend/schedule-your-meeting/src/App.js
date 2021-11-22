import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './Components/css/App.css';
import DefaultPage from './Components/DefaultPage';
import Navbar from './Components/Navbar';
import CreateNewMeeting from './Components/CreateNewMeeting';
import YourTimes from './Components/YourTimes';
import Meeting from './Components/Meeting'

function App() {



  return (
    <div>
      <h1>Schedule your meeting!</h1>
          <Navbar/>
          
          <Routes>
            <Route path="/createNewMeeting/" element={<CreateNewMeeting/>}/>
            <Route path="/meeting/:id" element={<Meeting/>}/>
            <Route path="/" element={<DefaultPage/>}/>
            <Route path="/yourTimes" element={<YourTimes/>}/>
          </Routes>
    </div>
  );
}

export default App;
