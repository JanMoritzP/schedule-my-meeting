import React, {useState, useEffect} from 'react'
import { useParams, useNavigate } from 'react-router-dom';

export default function Meeting() {
    let {name} = useParams()
    const [calendar, setCalendar] = useState();
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
            else {
                if(res.status === 409) {
                    navigate('/')
                }
                setConfirmed(false)
            }
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
            if(res.status === 200) setConfirmed(true)
            else {
                if(res.status === 409) {
                    navigate('/')
                }
                setConfirmed(false)
            }
            return res.json()
        })
        .then(data => putInfoInPage(data))
    }

    const pad2 = string => {
        if(string < 10) {
            return "0" + parseInt(string)
        }
        else return string
    }

    const putInfoInPage = data => {
        let timeData = data.timeData;
        let participants = data.participants;
        let participantAmount = data.participantAmount;
        let startingDate = new Date(data.startingDate);
        let endingDate = new Date(data.endingDate);

        setInfo(
            <div>
            <p>Starting Date: {startingDate.toString()}</p>
            <p>Ending Date: {endingDate.toString()}</p>
            </div>
        )
        var tableHeads = [];
        const dateDifference = (endingDate - startingDate)/(1000*3600*24) + 1 //This gives days after the division
        for (let i = 0; i < dateDifference; i++) {
            if(i === 0)  tableHeads.push(new Date(startingDate))
            else {
                tableHeads.push(new Date(tableHeads[i - 1]))
                tableHeads[i].setDate(tableHeads[i].getDate() + 1)
            }
        }

        //Create times array
        var times = [];
        for (let i = 1; i < 96; i++) {
            times.push(((i/4) | 0) + ":" + pad2(i*15 % 60));  //The | operation is to truncate the float, it is the fastest operation https://stackoverflow.com/questions/596467/how-do-i-convert-a-float-number-to-a-whole-number-in-javascript
        }

        function timeSlot(dayIndex, time) {
            this.dayIndex = dayIndex
            this.time = time
        }

        var data = [];
    
        for(let i = 1; i < 96 * dateDifference; i++) {
            data.push(new timeSlot(i/96 | 0, ((i%96/4) | 0) + ":" + pad2(i%96*15 % 60)))
        }

        var bodyData = [] //I need the data to be aligned in rows, not in columns, so i will put all the strings in this bodyData array;
        
        for(let i = 0; i < 95; i++) {
            var cell = []
            cell.push(times[i])
            for(let k = 0; k <  data.length/96 | 0; k++) {
                cell.push(data[k*96 + i])
            }
            bodyData.push(cell)
        }

        setCalendar(
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Times</th>
                            {tableHeads.map(date => 
                                <th>
                                    {date.toString()}
                                </th>
                            )}
                       </tr>
                    </thead>
                    <tbody>
                        {bodyData.map(cell =>
                            <tr>
                                <td>{cell.shift()}</td>
                                {cell.map(times => 
                                    <td>{times.time}</td>
                                )}
                            </tr>
                        )}
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
            {calendar}
            <button onClick={save}>Save</button>
            <button onClick={copyLink}>Copy Link</button>
        </div>
    )

}