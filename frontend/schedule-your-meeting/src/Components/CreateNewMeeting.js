import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';

export default function CreateNewMeeting() {
    const [name, setName] = useState("");
    const [uniqueCheck, setUniqueCheck] = useState("X")
    const navigate = useNavigate();
    


    const handleSubmit = async e => {
        e.preventDefault()
        if(name !== "") {
            fetch("http://localhost:3080/createNewMeeting", {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    password: e.target.password.value,
                    startingDate: e.target.startingDate.value,
                    endingDate: e.target.endingDate.value,
                    participantAmount: e.target.participantAmount.value
                })
            })
            .then(res => {
                if(res.status === 200) {
                    localStorage.setItem('password', e.target.password.value)
                    navigate("/meeting/" + name)
                }
                else {
                    console.log(res);
                }
            })
        }
    }

    useEffect(() => {
        const delayUniqueNameCheck = setTimeout(() => {
            //Send the request here
            if(name !== "") {
                fetch("http://localhost:3080/checkUniqueMeeting", {
                    method: "POST", 
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name
                    })
                })
                .then(res => {
                    if(res.status === 200) setUniqueCheck("Yeah")
                    else setUniqueCheck("X")
                })
            }
            else setUniqueCheck("X")
            
        }, 500) //ms
        return () => clearTimeout(delayUniqueNameCheck)
    }, [name])

    return(
        <div>
            <h2>Create a new meeting</h2>
            <form onSubmit={handleSubmit}>
                <label for="name">Name of the meeting {uniqueCheck}</label>
                <input type="text" id="name" name="name" onChange={e => setName(e.target.value)}></input>
                <label for="password">Password of the meeting</label>
                <input type="password" id="password" name="password"></input>
                <label for="startingDate">Starting Date</label>
                <input type="date" id="startingDate" name="startingDate"></input>
                <label for="endingDate">Ending Date</label>       
                <input type="date" id="endingDate" name="endingDate"></input>     
                <label for="participantAmount">Amount of participants</label>
                <input type="number" id="participantAmount" name="participantAmount"></input>           
                <input type="submit" value="Create"></input>
            </form>
        </div>
    )

}