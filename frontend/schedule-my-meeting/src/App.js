import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './Components/css/App.css';
import DefaultPage from './Components/DefaultPage';
import CreateNewMeeting from './Components/CreateNewMeeting';
import Meeting from './Components/Meeting'

function App() {



  return (
    <div>
      <h1 id='mainHeader'>Schedule my meeting</h1>          
          <Routes>
            <Route path="/createNewMeeting/" element={<CreateNewMeeting/>}/>
            <Route path="/meeting/:name" element={<Meeting/>}/>
            <Route path="/" element={<DefaultPage/>}/>
          </Routes>
    </div>
  );
}

export default App;
