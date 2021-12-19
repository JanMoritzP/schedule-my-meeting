import React, {useState, useEffect} from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import './css/Meeting.css'

export default function Meeting() {
    let {name} = useParams()
    const [calendar, setCalendar] = useState();
    const [info, setInfo] = useState();
    const [password, setPassword] = useState();
    const [confirmed, setConfirmed] = useState(false);
    var mouseDown = false;
    var maxDays = 0;
    var lastSelectedDay = null;
    var lastSelectedTime = null;
    const navigate = useNavigate();
    
    useEffect(() => {
        if(!localStorage.getItem('password')) return
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
                localStorage.setItem('password', password)
            }
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

    const time2number = time => {
        //Time can be anywhere between '0:00' = 0 and '23:45' = 97
        let hours = parseInt(time.split(':')[0])
        let minutes = parseInt(time.split(':')[1])
        return hours*4 + minutes / 15
    }

    const number2time = number => {
        let hours = number/4 | 0
        let minutes = pad2((number % 4) * 15)
        return hours + ':' + minutes
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
        maxDays = dateDifference
        for (let i = 0; i < dateDifference; i++) {
            if(i === 0)  tableHeads.push(new Date(startingDate))
            else {
                tableHeads.push(new Date(tableHeads[i - 1]))
                tableHeads[i].setDate(tableHeads[i].getDate() + 1)
            }
        }

        //Create times array
        var times = [];
        for (let i = 0; i < 96; i++) {
            times.push(((i/4) | 0) + ":" + pad2(i*15 % 60));  //The | operation is to truncate the float, it is the fastest operation https://stackoverflow.com/questions/596467/how-do-i-convert-a-float-number-to-a-whole-number-in-javascript
        }

        function timeSlot(dayIndex, time) {
            this.dayIndex = dayIndex
            this.time = time
        }

        var data = [];
    
        for(let i = 0; i < 96 * dateDifference; i++) {
            data.push(new timeSlot(i/96 | 0, ((i%96/4) | 0) + ":" + pad2(i%96*15 % 60)))
        }

        var bodyData = [] //I need the data to be aligned in rows, not in columns, so i will put all the strings in this bodyData array;
        
        for(let i = 0; i < 96; i++) {
            var cell = []
            cell.push(times[i])
            for(let k = 0; k <  data.length/96 | 0; k++) {
                cell.push(data[k*96 + i])
            }
            bodyData.push(cell)
        }

        const handleEnter = async e => {
            if(e.target.classList.contains('firstRow')) return;
            if(mouseDown) {
                if(e.target.classList.contains('selected'))  { //Deselect
                    if(e.target.id.split(';')[1] >= lastSelectedDay) {
                        if(time2number(e.target.id.split(';')[0]) >= time2number(lastSelectedTime)) {
                            return
                        }
                        if(e.target.id.split(';')[1] > lastSelectedDay) {  //Join time slots
                            
                        }
                    }
                    if(parseInt(e.target.id.split(';')[1]) <= parseInt(lastSelectedDay)) {
                        //Check for day crossing and kill everything from last selected time to current time but do not kill current time
                        if(lastSelectedDay !== null && lastSelectedDay > e.target.id.split(';')[1]) {
                            let checked = false
                            var timeId = time2number(lastSelectedTime)
                            var day = lastSelectedDay
                            while(!checked) {
                                if(document.getElementById(number2time(timeId) + ';' + day).classList.contains('selected')) {
                                    document.getElementById(number2time(timeId) + ';' + day).classList.remove('selected')
                                    timeId = timeId - 1
                                    if(timeId < 0) {
                                        day = day - 1;
                                        timeId = 95  //95 because you check backwards
                                    }
                                    if(timeId == time2number(e.target.id.split(';')[0]) && day == e.target.id.split(';')[1])  checked = true
                                }
                                else {
                                    checked = true
                                }
                            }
                            lastSelectedDay = e.target.id.split(';')[1];
                            lastSelectedTime = e.target.id.split(';')[0];
                        }
                        //Just kill the last one and set yourself to the last selected one
                        else if(lastSelectedTime !== null) {
                            if(time2number(lastSelectedTime) - 1 > time2number(e.target.id.split(';')[0])) {
                                var checked = false
                                while(!checked) {
                                    if(time2number(lastSelectedTime) !== time2number(e.target.id.split(';')[0])) {
                                        document.getElementById(lastSelectedTime + ';' + lastSelectedDay).classList.remove('selected')
                                        lastSelectedTime = number2time(time2number(lastSelectedTime) - 1)
                                    }
                                    else checked = true; 
                                }
                            }
                            else {
                                document.getElementById(lastSelectedTime + ';' + lastSelectedDay).classList.remove('selected')                            
                                lastSelectedDay = e.target.id.split(';')[1];
                                lastSelectedTime = e.target.id.split(';')[0];
                            }
                        }

                    }
                }
                else {  //Start the selecting process
                    if(lastSelectedDay >= e.target.id.split(';')[1]) {
                        if(lastSelectedDay == e.target.id.split(';')[1] && time2number(lastSelectedTime) == time2number(e.target.id.split(';')[0])) {
                            e.target.classList.add('selected')
                        }
                        if(lastSelectedDay > e.target.id.split(';')[1]) {
                            return
                        }
                        if(time2number(e.target.id.split(';')[0]) < time2number(lastSelectedTime)) {
                            var checked = false
                            while(!checked) {
                                if(document.getElementById(number2time(time2number(lastSelectedTime) - 1) + ';' + lastSelectedDay).classList.contains('selected')) {
                                    document.getElementById(lastSelectedTime + ';' + lastSelectedDay).classList.remove('selected')
                                    lastSelectedTime = number2time(time2number(lastSelectedTime) - 1)
                                }
                                else checked = true;
                            }
                            document.getElementById(lastSelectedTime + ';' + lastSelectedDay).classList.remove('selected')
                            return
                        }

                        if(time2number(e.target.id.split(';')[0]) > time2number(lastSelectedTime)) {
                            var checked = false
                            while(!checked) {
                                if(!(time2number(e.target.id.split(';')[0]) == time2number(lastSelectedTime))) {
                                    document.getElementById(lastSelectedTime + ';' + lastSelectedDay).classList.add('selected')
                                    lastSelectedTime = number2time(time2number(lastSelectedTime) + 1)
                                }
                                else checked = true;
                            }
                        }
                        
                    }
                    
                    e.target.classList.add('selected')
                    
                    if(lastSelectedDay !== null && lastSelectedDay < e.target.id.split(';')[1]) {  //Do the check here
                        //We check the times backwards to reach the last selected time before the switch
                        //Backtrack to lastSelectedTime and lastSelectedDay
                        let checked = false
                        var timeId = time2number(e.target.id.split(';')[0]) - 1
                        var day = e.target.id.split(';')[1]
                        console.log(day)
                        if(day <= 0) day = 0
                        if(timeId < 0) {
                            day = day - 1
                            timeId = 95
                        }
                        while(!checked) {
                            if(day < 0) day = 0  //Check for errors to the left top, which can occur when user moves mouse wildy
                            if(!document.getElementById(number2time(timeId) + ';' + day).classList.contains('selected')) {
                                document.getElementById(number2time(timeId) + ';' + day).classList.add('selected')
                                timeId = timeId - 1
                                if(timeId < 0) {
                                    day = day - 1;
                                    timeId = 95  //95 because you check backwards
                                }
                            }
                            else {
                                checked = true
                            }
                        }
                    } 
                    lastSelectedDay = e.target.id.split(';')[1]
                    lastSelectedTime = e.target.id.split(';')[0]
                }
            }
        }
        
        const handleMouseDown = async e => {
            if(e.target.classList.contains('firstRow')) return;
            if(e.target.classList.contains('selected'))  {  //Check surrounding cells
                e.target.classList.remove('selected')
                let currentTime = e.target.id.split(';')[0];
                let currentDay = e.target.id.split(';')[1];
                //Check backwards, then forwards
                let checked = false
                let checkingId = time2number(currentTime) - 1;
                let checkingDay = currentDay;
                if(checkingId < 0) {
                    if(checkingDay == 0) checked = true;
                    else {
                        checkingDay = checkingDay - 1
                        checkingId = 95
                    }
                }
                while(!checked) {  //Check backwards
                    if(document.getElementById(number2time(checkingId) + ';' + checkingDay).classList.contains('selected')) {
                        document.getElementById(number2time(checkingId) + ';' + checkingDay).classList.remove('selected')
                        if(checkingId == 0) {
                            if(checkingDay == 0) { //All the way up left
                                checked = true
                            }
                            else {
                                checkingDay = checkingDay - 1;
                                checkingId = 95  //95 because you check backwards
                            }
                        }
                        else checkingId = checkingId - 1
                    }
                    else {
                        checked = true
                    }
                }
                checked = false
                checkingId = time2number(currentTime) + 1;
                checkingDay = currentDay;
                if(checkingId > 95) {
                    if(checkingDay == maxDays) checked = true
                    else checkingDay = parseInt(checkingDay) + 1
                    checkingId = 0
                }
                while(!checked) {  //Check forwards
                    if(document.getElementById(number2time(checkingId) + ';' + checkingDay).classList.contains('selected')) {
                        document.getElementById(number2time(checkingId) + ';' + checkingDay).classList.remove('selected')
                        if(checkingId == 95) {
                            if(checkingDay == maxDays) { 
                                checked = true
                            }
                            else {
                                checkingDay = parseInt(checkingDay) + 1;
                                checkingId = 0 
                            }
                        }
                        else checkingId = parseInt(checkingId) + 1
                    }
                    else {
                        checked = true
                    }
                }
            }
            else {
                e.target.classList.add('selected')
                lastSelectedDay = e.target.id.split(';')[1]
                lastSelectedTime = e.target.id.split(';')[0]
                mouseDown = true
            }
        }

        const handleMouseUp = async e => {
            mouseDown = false
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
                    <tbody onMouseDown={e=>handleMouseDown(e)} onMouseUp={e=>handleMouseUp(e)}>
                        {bodyData.map(cell =>
                            <tr>
                                <td class='firstRow'>{cell.shift()}</td>
                                {cell.map(times => 
                                    <td class="cell" id={times.time + ";" + times.dayIndex} onMouseEnter={e=>handleEnter(e)}>{times.time}</td>
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