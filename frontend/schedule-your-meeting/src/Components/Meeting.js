import React, {useState} from 'react'
import { useParams, useNavigate } from 'react-router-dom';

export default function Meeting() {
    let {name} = useParams()
    const [password, setPassword] = useState();
    const [confirmed, setConfirmed] = useState(false);
    const navigate = useNavigate();
    
    if(localStorage.getItem('password')) {
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
            if(res.status === 200) {
                setConfirmed(true)
                //Get all the data here
            }
            else {
                if(res.status === 409) {
                    navigate('/')
                }
                console.log(res);
                setConfirmed(false)
            }
        })
    }

    const login = async e => {
        fetch("http://localhost:3080/joinMeeting", {
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
                setConfirmed(true)
                console.log(res)
            }
            else {
                console.log(res)
                setConfirmed(false)
            }
        })
    }

    const save = async e => {
        //save the data here by updating it to the backend
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
            <table>
                <thead>
                    <th>Table Head</th>
                </thead>
                <tbody>
                    <td>Table Data</td>
                </tbody>
            </table>
            <button onClick={save}>Save</button>
        </div>
    )

}