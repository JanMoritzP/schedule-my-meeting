import React from 'react'
import {Link} from 'react-router-dom'
import './css/DefaultPage.css'

export default function DefaultPage() {

    return(
        <div>
            <div id="infoParagraph">                
                <h2 id="infoHeader">Welcome to schedule my meeting</h2> 
                <p>
                    You can use this website to create a meeting and then schedule it with your colleagues or friends.
                    You can either use the navbar on the left, or click <Link to={'/createNewMeeting'}>here</Link> to create a new meeting.
                    Every meeting has to have a unique name. You can set it yourself, and reuse it, if you want to schedule another meeting.
                    However, if you do not schedule anything within 30 days, the name is free again and might be used by someone else.
                </p>
                <p>Lorem Ipsum Stuff</p>
            </div>
        </div>
    )

}