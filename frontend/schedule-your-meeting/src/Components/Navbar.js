import React from 'react'
import {Link} from 'react-router-dom'
import './css/Navbar.css'
export default function Navbar() {

    return(
        <div id="navbar">
            <Link class="link" to="/">Home</Link>
            <Link class="link" to="/createNewMeeting">New Meeting</Link>
        </div>
    )

}