import React from 'react'

export default function CreateNewMeeting() {

    return(
        <div>
            <h2>Create a new meeting</h2>
            <form action="http://localhost:3080/createNewMeeting" method="post">
                <label for="meetingName">Name of the meeting</label>
                <input type="text" id="meetingName" name="meetingName"></input>
                <label for="meetingPassword">Password of the meeting</label>
                <input type="password" id="meetingPassword" name="meetingPassword"></input>
                <input type="submit" value="Create"></input>
            </form>
        </div>
    )

}