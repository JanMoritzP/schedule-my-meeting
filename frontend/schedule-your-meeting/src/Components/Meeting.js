import React, {useState, useEffect} from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import './css/Meeting.css'

export default function Meeting() {
    let {name} = useParams()
    const [calendar, setCalendar] = useState();
    const [info, setInfo] = useState();
    const [password, setPassword] = useState();
    const [confirmed, setConfirmed] = useState(false);
    const [type, setType] = useState("perfect");
    const [perfectChecked, setPerfectChecked] = useState(true);
    const [worksChecked, setWorksChecked] = useState(false);
    const [ratherNotChecked, setRatherNotChecked] = useState(false);
    const [userOptions, setUserOptions] = useState()
    const [currentUser, setCurrentUser] = useState()
    const [register, setRegister] = useState(false)
    var users = []
    const [participants, setParticipants] = useState([])
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

    useEffect(() => {
        const delayUniqueNameCheck = setTimeout(() => {
            //Send the request here
            if(currentUser !== "") {
                fetch("http://localhost:3080/checkNewUser", {
                    method: "POST", 
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user: currentUser,
                        meeting: name,
                        password: localStorage.getItem('password')
                    })
                })
                .then(res => {
                    if(res.status === 409) setRegister(false)
                    else setRegister(true)
                })
            }
            else setRegister(true)
            
        }, 500) //ms
        return () => clearTimeout(delayUniqueNameCheck)
    }, [currentUser])
    
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

    function getRadioChoice() {
        if(document.getElementById("perfectRadio").checked) return "perfect"
        if(document.getElementById("worksRadio").checked) return "works"
        if(document.getElementById("ratherNotRadio").checked) return "ratherNot"
    }

    const putInfoInPage = data => {
        users = data.participants
        setParticipants(data.participants)
        let participantAmount = data.participantAmount
        while(participantAmount > users.length) {
            users.push("Add new User")
        }
        setUserOptions(users.map(user => {return <option value={user}/>}))
        let startingDate = new Date(data.startingDate)
        let endingDate = new Date(data.endingDate)
        


        setInfo(
            <div>
            <p>Starting Date: {startingDate.toString()}</p>
            <p>Ending Date: {endingDate.toString()}</p>
            <p>
                Length of the meeting: {data.meetingLength} <br/>
                Remember to select time slots long enough for the meeting to happen. <br/>
                You can select time slots that are not long enough, <br/>
                but be aware that they will not be taken into account when trying to find the perfect time for the meeting. <br/>
                Also keep in mind, that this website cannot account for any time you might need to prepare for the meeting or any travel time. <br/>
            </p>
            </div>
        )
        var tableHeads = []
        var dates =[]
        const dateDifference = (endingDate - startingDate)/(1000*3600*24) + 1 //This gives days after the division
        maxDays = dateDifference
        for (let i = 0; i < dateDifference; i++) {
            if(i === 0)  {
                dates.push(new Date(startingDate))
                tableHeads[0] = dates[0].getDate() + "/" + (parseInt(dates[0].getMonth()) + 1) + "/" + dates[0].getFullYear();  //Yes, getMonth() is 0-indexed....goddamnit
            }
            else {
                dates.push(new Date(dates[i - 1]))
                dates[i].setDate(dates[i].getDate() + 1)
                tableHeads[i] = dates[i].getDate() + "/" + (parseInt(dates[i].getMonth()) + 1) + "/" + dates[i].getFullYear();
            }
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
                                    document.getElementById(number2time(timeId) + ';' + day).className = "cell"
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
                                        document.getElementById(lastSelectedTime + ';' + lastSelectedDay).className = "cell"
                                        lastSelectedTime = number2time(time2number(lastSelectedTime) - 1)
                                    }
                                    else checked = true; 
                                }
                            }
                            else {
                                document.getElementById(lastSelectedTime + ';' + lastSelectedDay).className = "cell"                            
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
                            e.target.classList.add(getRadioChoice())
                        }
                        if(lastSelectedDay > e.target.id.split(';')[1]) {
                            return
                        }
                        if(time2number(e.target.id.split(';')[0]) < time2number(lastSelectedTime)) {
                            var checked = false
                            while(!checked) {
                                if(document.getElementById(number2time(time2number(lastSelectedTime) - 1) + ';' + lastSelectedDay).classList.contains('selected')) {
                                    document.getElementById(lastSelectedTime + ';' + lastSelectedDay).className = "cell"
                                    lastSelectedTime = number2time(time2number(lastSelectedTime) - 1)
                                }
                                else checked = true;
                            }
                            document.getElementById(lastSelectedTime + ';' + lastSelectedDay).className = "cell"
                            return
                        }

                        if(time2number(e.target.id.split(';')[0]) > time2number(lastSelectedTime)) {
                            var checked = false
                            while(!checked) {
                                if(!(time2number(e.target.id.split(';')[0]) == time2number(lastSelectedTime))) {
                                    document.getElementById(lastSelectedTime + ';' + lastSelectedDay).classList.add('selected')
                                    document.getElementById(lastSelectedTime + ';' + lastSelectedDay).classList.add(getRadioChoice())
                                    lastSelectedTime = number2time(time2number(lastSelectedTime) + 1)
                                }
                                else checked = true;
                            }
                        }
                        
                    }
                    
                    e.target.classList.add('selected')
                    e.target.classList.add(getRadioChoice())
                    
                    if(lastSelectedDay !== null && lastSelectedDay < e.target.id.split(';')[1]) {  //Do the check here
                        //We check the times backwards to reach the last selected time before the switch
                        //Backtrack to lastSelectedTime and lastSelectedDay
                        let checked = false
                        var timeId = time2number(e.target.id.split(';')[0]) - 1
                        var day = e.target.id.split(';')[1]
                        if(day <= 0) day = 0
                        if(timeId < 0) {
                            day = day - 1
                            timeId = 95
                        }
                        while(!checked) {
                            if(day < 0) day = 0  //Check for errors to the left top, which can occur when user moves mouse wildy
                            if(day == lastSelectedDay && timeId == time2number(lastSelectedTime)) checked = true;
                            if(!document.getElementById(number2time(timeId) + ';' + day).classList.contains('selected')) {
                                document.getElementById(number2time(timeId) + ';' + day).classList.add('selected')
                                document.getElementById(number2time(timeId) + ';' + day).classList.add(getRadioChoice())
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
                var paint = false
                if(!e.target.classList.contains(getRadioChoice())) paint = true
                if(!paint)  e.target.className = "cell"
                else e.target.className = "cell" + " selected " + getRadioChoice()
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
                        if(!paint)  document.getElementById(number2time(checkingId) + ';' + checkingDay).className = "cell"
                        else document.getElementById(number2time(checkingId) + ';' + checkingDay).className = "cell" + " selected " + getRadioChoice()
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
                        if(!paint)  document.getElementById(number2time(checkingId) + ';' + checkingDay).className = "cell"
                        else document.getElementById(number2time(checkingId) + ';' + checkingDay).className = "cell" + " selected " + getRadioChoice()
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
                e.target.classList.add(getRadioChoice())
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

    const typeChanged = async value => {
        setType(value)
        if(value === "perfect") {
            setPerfectChecked(true)
            setWorksChecked(false)
            setRatherNotChecked(false)
        }
        else if(value === "works") {
            setPerfectChecked(false)
            setWorksChecked(true)
            setRatherNotChecked(false)
        }
        else {
            setPerfectChecked(false)
            setWorksChecked(false)
            setRatherNotChecked(true)
        }
    }

    const save = async e => {
        //timeData structure: {time};{dateIndex};{priority};{userIndex}
        //Iterate over all timeSlots and add the ones that are selected to an array and send that one to the backend
        var collection = document.getElementsByClassName('selected')
        var selectedElems = []
        for(let i = 0; i < collection.length; i++) {
            selectedElems.push(collection.item(i))
        }
        var data = []
        selectedElems.map(elem => {
            data.push(elem.id.split(';')[0] + ";" + elem.id.split(';')[1] + ";" + elem.classList[2] + ";" + participants.indexOf(currentUser))
        })
        fetch("http://localhost:3080/saveTimeData", {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    user: currentUser,
                    password: localStorage.getItem('password'),
                    data: data
                })
            })
            .then(res => {
                if(res.status === 200) alert("Nice")
            })
            
        
    }

    const copyLink = async e => {
        await navigator.clipboard.writeText("https://www.schedule-your-meeting.com/meeting/" + name)
    }

    function loadUserData() {
        //getTimeData call
    }

    const registerUser = async e => {
        if(currentUser === "Add new User") alert("Not allowed")
        else if(name !== "") {
            fetch("http://localhost:3080/addNewUser", {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    meeting: name,
                    user: currentUser,
                    password: localStorage.getItem('password')
                })
            })
            .then(res => res.json())
            .then(data => {
                if(data.users !== null) {
                    let users = data.users;
                    while(data.participantAmount > data.users.length) {
                        users.push("Add new User")
                    }
                    setUserOptions(users.map(user => {return <option value={user}/>}))
                    setRegister(false)
                }
            })

        }
    }

    function checkUser() {
        if(register) return <button onClick={e => registerUser(e)}>Register User</button>
        else return <button onClick={loadUserData()}>Load</button>
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
            <label for="username">Current User</label>
            <input type="text" list="datalist" onChange={e => setCurrentUser(e.target.value)}></input>
            <datalist id="datalist">
                {userOptions}
            </datalist>
            {users.map(user => {return <p>{user}</p>})}
            {checkUser()}
            {calendar}
            <div id="tierSelector">
                <h3>Select the quality of the time slot</h3>
                <input type="radio" value="perfect" id="perfectRadio" onChange={e => typeChanged(e.target.value)} checked={perfectChecked}/> Perfect for me
                <input type="radio" value="works" id="worksRadio" onChange={e => typeChanged(e.target.value)} checked={worksChecked}/> This would work
                <input type="radio" value="ratherNot" id="ratherNotRadio" onChange={e => typeChanged(e.target.value)} checked={ratherNotChecked}/> I am available, but definitely prefer other options
            </div>
            <button onClick={save}>Save</button>
            <button onClick={copyLink}>Copy Link</button>
        </div>
    )

}