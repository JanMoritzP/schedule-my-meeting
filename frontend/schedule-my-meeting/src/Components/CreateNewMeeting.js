import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import './css/CreateNewMeeting.css'

export default function CreateNewMeeting() {

    const getMinDate = inputDate => {
        const [year, month, day] = inputDate.split('-');
        if(["01", "03", "05", "07", "08", "10", "12"].includes(month)) {
            //31 days
            if(day === "31") {
                if(month === "12") {
                    return (year + 1) + "-" + "01" + "-" + "01"
                }
                else {
                    return year + "-" + pad2(parseInt(month) + 1) + "-" + "01"
                }
            }
            else {
                return year + "-" + pad2(month) + "-" + pad2(parseInt(day) + 1)
            }
        }
        else if(["04", "06", "09", "11"].includes(month)) {
            //30 days
            if(day === "30") {       
                return year + "-" + pad2(parseInt(month) + 1) + "-" + "01"
            }
            else {
                return year + "-" + pad2(month) + "-" + pad2(parseInt(day) + 1)
            }
        }
        else {
            //check for leap year
            let isLeap = !((parseInt(year) % 4) || (!(parseInt(year) % 100) && (parseInt(year) % 400)));
            if(isLeap) {
                if(day === "29") {       
                    return year + "-" + pad2(parseInt(month) + 1) + "-" + "01"
                }
                else {
                    return year + "-" + pad2(month) + "-" + pad2(parseInt(day) + 1)
                }
            }
            else {
                if(day === "28") {       
                    return year + "-" + pad2(parseInt(month) + 1) + "-" + "01"
                }
                else {
                    return year + "-" + pad2(month) + "-" + pad2(parseInt(day) + 1)
                }
            }
        }
    }

    const pad2 = string => {
        if(string < 10) {
            return "0" + parseInt(string)
        }
        else return string
    }

    const date = new Date();
    
    const [name, setName] = useState("");
    const [uniqueCheck, setUniqueCheck] = useState("X")
    const [startingDate, setStartingDate] = useState(date.getFullYear() + "-" + pad2(parseInt((date.getMonth()) + 1)) + "-" + pad2(date.getDate()));
    const [endingDate, setEndingDate] = useState(getMinDate(startingDate));
    const [meetingLength, setMeetingLength] = useState('0:15');
    const [error, setError] = useState('')
    const navigate = useNavigate();

    var times = []
    
    for(let i = 1; i < 96; i++) {
        times.push(((i%96/4) | 0) + ":" + pad2(i%96*15 % 60))
    }

    const handleSubmit = async e => {
        e.preventDefault()
        if(name !== "") {
            fetch("http://localhost:3080/data/createNewMeeting", {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    password: e.target.password.value,
                    startingDate: startingDate,
                    endingDate: endingDate,
                    participantAmount: e.target.participantAmount.value,
                    meetingLength: meetingLength
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
                fetch("http://localhost:3080/data/checkUniqueMeeting", {
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

    const calcEndingDate = async e => {
        const minDate = getMinDate(e.target.value).split('-');
        const endingDateArray = endingDate.split('-');
        if(endingDateArray[0] > minDate[0]) return;
        else if(endingDateArray[0] < minDate[0]) return setEndingDate(getMinDate(e.target.value));
        else if(endingDateArray[1] > minDate[1]) return;
        else if(endingDateArray[1] < minDate[1]) return setEndingDate(getMinDate(e.target.value));        
        else if(endingDate[2] > minDate[2]) return;
        else return setEndingDate(getMinDate(e.target.value))
    }

    const meetingLengthChanged = async e => {
        if(e.length > 4 || e.length < 3)  setError('This meeting length is not permitted')
        else {
            if(e.split(':').length !== 2) setError('This meeting length is not permitted')
            else if (e.split(':')[0] < 0 || e.split(':')[0] > 23) setError('This meeting length is not permitted')
            else if (e.split(':')[1] % 15 !== 0) setError('This meeting length is not permitted')
            else {
                setMeetingLength(e)
                setError('')
            }
        }
        //Check if the meetingLength string is actually good
    }

    return(
        <div id='CreateMeeting'>
            <h2 id='meetingHeader'>Create a new meeting</h2>
            <form onSubmit={handleSubmit}>
                <div id='nameDiv'>
                    <label for="name" id='labelName'>Name of the meeting {uniqueCheck}</label>
                    <input type="text" id="name" name="name" onChange={e => setName(e.target.value)}></input>
                </div>
                <div id='passwordDiv'>
                    <label for="password" id='labelPassword'>Password of the meeting</label>
                    <input type="password" id="password" name="password"></input>
                </div>
                <div id='startingDiv'>
                    <label for="startingDate" id='labelStartingDate'>Starting Date</label>
                    <input type="date" id="startingDate" name="startingDate"
                    min={date.getFullYear() + "-" + (parseInt(date.getMonth()) + 1) + "-" + date.getDate()} value={startingDate}
                    onChange={e => {setStartingDate(e.target.value);calcEndingDate(e)}}></input>
                </div>
                <div id='endingDiv'>
                    <label for="endingDate" id='labelEndingDate'>Ending Date</label>       
                    <input type="date" id="endingDate" name="endingDate" min={getMinDate(startingDate)} value={endingDate} onChange={e => setEndingDate(e.target.value)}></input>     
                </div>
                <div id='lengthDiv'>
                    <label for="meetingLength" id='labelMeetingLength'>Length of the meeting</label>
                    <input type="text" list="data" onChange={e => meetingLengthChanged(e.target.value)} id="meetingLength" name="meetingLength"></input>
                    <datalist id="data">
                        {times.map(time => {
                            return <option value={time} />
                        })}
                    </datalist>
                </div>
                <div id='participantDiv'>
                    <label for="participantAmount" id='labelParticipantAmount'>Amount of participants</label>
                    <input type="number" id="participantAmount" name="participantAmount"></input>           
                </div>
                <input type="submit" value="Create" id='submitButton'></input>
                <p>{error}</p>
            </form>
        </div>
    )

}