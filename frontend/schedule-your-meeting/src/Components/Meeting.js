import React, {useState, useEffect} from 'react'
import { useParams, useNavigate } from 'react-router-dom';

export default function Meeting() {
    let {name} = useParams()
    var calendar;
    const [info, setInfo] = useState();
    const [password, setPassword] = useState();
    const [confirmed, setConfirmed] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        if(!localStorage.getItem('password')) return
        /* fetch("http://localhost:3080/joinMeeting", {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                password: localStorage.getItem('password')
            })
        })
        .then(res => {
            if(res.status === 200) {
                if(!confirmed)  setConfirmed(true)
                //Get all the data here and construct the table here
                res.json();
            }
            else {
                if(res.status === 409) {
                    navigate('/')
                }
                console.log(res);
                setConfirmed(false)
            }
        })
        .then(data => {
            console.log(data)
        }) */
        fetch("http://localhost:3080/joinMeeting", {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                password: localStorage.getItem('password')
            })
        })
        .then(res => {
            if(res.status === 200) setConfirmed(true);
            return res.json()
        })
        .then(data => putInfoInPage(data))

    }, [])
    
    const login = async e => {
        /* fetch("http://localhost:3080/joinMeeting", {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                password: password
            })
        })
        .then(res => {
            if(res.status === 200) {
                if(!confirmed)  setConfirmed(true)
                //Get all the data here and construct the table here
                res.json();
            }
            else {
                if(res.status === 409) {
                    navigate('/')
                }
                console.log(res);
                setConfirmed(false)
            }
        }) */
        fetch("http://localhost:3080/joinMeeting", {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                password: localStorage.getItem('password')
            })
        })
        .then(res => {
            if(res.status === 200) setConfirmed(true);
            return res.json()
        })
        .then(data => putInfoInPage(data))
    }

    const putInfoInPage = data => {
        let timeData = data.timeData;
        let participants = data.participants;
        let participantAmount = data.participantAmount;
        let startingDate = data.startingDate;
        let endingDate = data.endingDate;

        setInfo(
            <div>
            <p>Starting Date: {startingDate}</p>
            <p>Ending Date: {endingDate}</p>
            </div>
        )

        calendar = (
            <div>
                <table>
                    <thead>
                        <th>Table Head</th>
                    </thead>
                    <tbody>
                        <td>Table Data</td>
                    </tbody>
                </table>
            </div>
        )
    }


    const save = async e => {
        //save the data here by updating it to the backend
    }

    const copyLink = async e => {
        await navigator.clipboard.writeText("https://www.schedule-your-meeting.com/meeting/" + name)
    }
    
    if(!confirmed) {
        return (
            <div>
            
                <label for="password">Please provide a password</label>
                <input type="password" name="password" id="password" onChange={e => setPassword(e.target.value)}></input>
                <button onClick={login}>Login</button>
            </div>
        )
    }


    return(
        <div>
            <h2>Please provide times for this meeting</h2>
            {info}
            <button onClick={save}>Save</button>
            <button onClick={copyLink}>Copy Link</button>
        </div>
    )

}