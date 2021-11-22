import React from 'react'
import {Link} from 'react-router-dom'
export default function Navbar() {

    return(
        <div>
            <Link to="/">Home</Link>
            <Link to="/yourTimes">Your Times</Link>
            <Link to="/createNewMeeting">Create new Meeting</Link>
        </div>
    )

}