import React, {useState, useEffect} from 'react'

export default function CreateNewMeeting() {

    const [name, setName] = useState("");

    const handleSubmit = async e => {
        e.preventDefault();
    }

    useEffect(() => {
        const delayUniqueNameCheck = setTimeout(() => {
            //Send the request here
            console.log(name)
            fetch("http://localhost:3080/checkUniqueMeeting", {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    name: name
                }
            })
            .then(data => {
                console.log(data)
            })
        }, 500) //ms
        return () => clearTimeout(delayUniqueNameCheck)
    }, [name])

    return(
        <div>
            <h2>Create a new meeting</h2>
            <form onSubmit={handleSubmit}>
                <label for="meetingName">Name of the meeting</label>
                <input type="text" id="meetingName" name="meetingName" onChange={e => setName(e.target.value)}></input>
                <label for="meetingPassword">Password of the meeting</label>
                <input type="password" id="meetingPassword" name="meetingPassword"></input>
                <input type="submit" value="Create"></input>
            </form>
        </div>
    )

}