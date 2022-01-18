import React, {useState, useEffect} from 'react'
import { useParams, useNavigate, renderMatches } from 'react-router-dom';
import './css/Meeting.css'

export default function Meeting() {
    let {name} = useParams()
    const [calendar, setCalendar] = useState();
    const [info, setInfo] = useState();
    const [password, setPassword] = useState();
    const [confirmed, setConfirmed] = useState(false);
    const [perfectChecked, setPerfectChecked] = useState(true);
    const [worksChecked, setWorksChecked] = useState(false);
    const [ratherNotChecked, setRatherNotChecked] = useState(false);
    const [userOptions, setUserOptions] = useState()
    const [currentUser, setCurrentUser] = useState("")
    const [register, setRegister] = useState(false)
    const [participants, setParticipants] = useState([])
    var mouseDown = false;
    var maxDays = 0;
    var lastSelectedDay = null;
    var lastSelectedTime = null;
    const navigate = useNavigate();
    
    useEffect(() => {
        if(localStorage.getItem('password' + name) === undefined || localStorage.getItem('password' + name) === null) return
        fetch("http://schedule-my-meeting.com/data/joinMeeting", {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                password: localStorage.getItem('password' + name)
            })
        })
        .then(res => {
            if(res.status === 200) {
                setConfirmed(true)
            }
            else {
                if(res.status === 409) {
                    navigate('/')
                }
                if(res.status === 403) {
                    document.getElementById('badLogin').innerHTML = "Wrong password"
                }
                setConfirmed(false)
            }
            return res.json()
        })
        .then(data => {
            putInfoInPage(data)
        })
    }, [])

    useEffect(() => {
        const delayUniqueNameCheck = setTimeout(() => {
            if(currentUser !== "" && currentUser !== "Add new User") {
                fetch("http://schedule-my-meeting.com/data/checkNewUser", {
                    method: "POST", 
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user: currentUser,
                        meeting: name,
                        password: localStorage.getItem('password' + name)
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
        fetch("http://schedule-my-meeting.com/data/joinMeeting", {
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
                localStorage.setItem('password' + name, password)
            }
            else {
                if(res.status === 409) {
                    navigate('/')
                }
                if(res.status === 403) {
                    document.getElementById('badLogin').innerHTML = "Wrong password"
                }
                setConfirmed(false)
            }
            return res.json()
        })
        .then(data => {
            putInfoInPage(data)
        })
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
        if(data.message !== undefined) return
        let users = data.participants
        setParticipants(data.participants)
        let participantAmount = data.participantAmount
        while(participantAmount > users.length) {
            users.push("Add new User")
        }
        setUserOptions(users.map(user => {return <option value={user}/>}))
        let startingDate = new Date(data.startingDate)
        let endingDate = new Date(data.endingDate)
        
        const weeksdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

        setInfo(
            <div>
            <p>Starting Date: {weeksdays[startingDate.getDay()]} {months[startingDate.getMonth()]} {startingDate.getDate()} {startingDate.getFullYear()}</p>
            <p>Ending Date: {weeksdays[endingDate.getDay()]} {months[endingDate.getMonth()]} {endingDate.getDate()} {endingDate.getFullYear()}</p>
            <p id='meetingInfoParagraph'>
                Length of the meeting: {data.meetingLength} <br/>
                Remember to select time slots long enough for the meeting to happen. <br/>
                When you select slots, please be advised that it is intended, that each slot represents the starting time of a 15 minute interval <br />
                That means, when you select slots ranging from 1:00pm to 3:00pm that would mean you have time from 1:00pm to 3:15pm <br />
                Of course you could plan with your team differently, but please consider that you would have to adjust the meeting length <br />
                You can select time slots that are not long enough, <br/>
                but be aware that they will not be taken into account when trying to find the perfect time for the meeting. <br/>
                Also keep in mind, that this website cannot account for any time you might need to prepare for the meeting or any travel time. <br/>
                Lastly, when you have generated the best meeting, time slots will appear as shades of green. <br/>
                This indicates the availability of the participants. A bright green indicates a good slot, a darker one a worse slot. <br/>
                A white slots shows that there was no overlap of the provided times <br/>
            </p>
            </div>
        )
        var tableHeads = []
        var dates = []
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
            var selectedClasses = e.target.classList;
            var selectedClass = ""
            if(selectedClasses.contains('perfect')) selectedClass = 'perfect'
            else if(selectedClasses.contains('works')) selectedClass = 'works'
            else if(selectedClasses.contains('ratherNot')) selectedClass = 'ratherNot'
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
                if(document.getElementById(number2time(checkingId) + ';' + checkingDay).classList.contains(selectedClass)) {
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
                if(document.getElementById(number2time(checkingId) + ';' + checkingDay).classList.contains(selectedClass)) {
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

    const typeChanged = async value => {
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
        var collection = document.getElementsByClassName('selected')
        var selectedElems = []
        for(let i = 0; i < collection.length; i++) {
            selectedElems.push(collection.item(i))
        }
        var data = []
        selectedElems.map(elem => {
            return data.push(elem.id.split(';')[0] + ";" + elem.id.split(';')[1] + ";" + elem.classList[2] + ";" + participants.indexOf(currentUser))
        })
        fetch("http://schedule-my-meeting.com/data/saveTimeData", {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    user: currentUser,
                    password: localStorage.getItem('password'  + name),
                    data: data
                })
            })
            .then(res => {
                if(res.status === 200) document.getElementById('errorParagraph').innerHTML = "saved"
            })
            
        
    }

    const copyLink = async e => {
        await navigator.clipboard.writeText("https://www.schedule-my-meeting.com/meeting/" + name)
    }

    function loadUserData() {
        var checked = false
        if(currentUser === "Add new User" || currentUser === "" || currentUser === "Results") alert("Not allowed")
        else if(name !== "") {
            fetch("http://schedule-my-meeting.com/data/getTimeData", {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    user: currentUser,
                    password: localStorage.getItem('password'  + name)
                })
            })
            .then(res => {
                if(res.status == 200) checked = true
                return res.json()
            })
            .then(data => {
                if(checked) {
                    resetCalendar()
                    data.timeData.map(data => {
                        return document.getElementById(data.split(';')[0] + ";" + data.split(';')[1]).className = "cell " + "selected " + data.split(';')[2]
                    })
                }
            })
        }
    }

    function registerUser() {
        var checked = true
        if(currentUser === "Add new User" || currentUser === "" || currentUser === "Results") alert("Not allowed")
        else if(name !== "") {
            fetch("http://schedule-my-meeting.com/data/addNewUser", {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    meeting: name,
                    user: currentUser,
                    password: localStorage.getItem('password'  + name)
                })
            })
            .then(res => {
                if(res.status !== 200) {
                    document.getElementById('errorParagraph').innerHTML = "You have to register a unique username"
                    checked = false;
                }
                else document.getElementById('errorParagraph').innerHTML = ""
                return res.json()
            })
            .then(data => {
                if(data.users !== null && checked) {
                    let users = data.users;
                    while(data.participantAmount > data.users.length) {
                        users.push("Add new User")
                    }
                    setParticipants(users)
                    setUserOptions(users.map(user => {return <option value={user}/>}))
                    setRegister(false)
                    resetCalendar()
                }
            })

        }
    }

    const userKeyPressed = async e => {
        if(e === 'Enter') {
            if(register) registerUser()
            else loadUserData()
        }
    }

    function checkUser() {
        if(register) return <button onClick={e => registerUser()}>Register User</button>
        else return <button onClick={e => loadUserData()}>Load</button>
    }

    function deleteMeeting() {

        fetch("http://schedule-my-meeting.com/data/deleteMeeting", {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                password: localStorage.getItem('password'  + name)
            })
        })
        .then(res => {
            if(res.status === 200) {
                navigate('/')
            }
            else {
                document.getElementById('errorParagraph').innerHTML = "Meeting could not be deleted"
            }
            return res.json()
        })
    }

    function generateMeeting() {
        fetch("http://schedule-my-meeting.com/data/getBestTime", {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                password: localStorage.getItem('password'  + name)
            })
        })
        .then(res => res.json())
        .then(data => {
            if(data !== null) {
                resetCalendar()
                console.log(data)
                data.data.map(data => {
                    let green = (data.priority / (2*participants.length)) * 255; //Can range from 0 to 2*participants.length
                    document.getElementById(data.time + ";" + data.date).style = `background-color: rgb(0, ${green}, 0)`
                    return document.getElementById(data.time + ";" + data.date).className = "cell " + "selected "
                })
                var buttons = document.getElementsByClassName("controlButtons")
                for(let i = 0; i < buttons.length; i++) {
                    buttons.item(i).hidden = true
                }
                document.getElementById("refreshButton").hidden = false;
                if(data.message !== "Possible") {
                    document.getElementById("errorParagraph").innerHTML = "There is no possible time where all participants are available but this is the map of the times where some of the participants would be able to attend"
                }
            }
        })
    }

    const userChange = async e => {
        if(e !== "" && e !== "Add new User") setCurrentUser(e)
        else if (e === "Add new User" || e === "") {
            document.getElementById("usernameInput").value = ""
            if(participants.indexOf('Add new User') !== -1)  document.getElementById("usernameInput").placeholder = "Add new User"
            else document.getElementById("usernameInput").placeholder = ""
            var selectedElems = document.querySelectorAll('.selected')
            for(let i = 0; i < selectedElems.length; i++) {
                selectedElems.item(i).classList = "cell"
            }
            setCurrentUser("Add new User")
        }
    }

    function resetCalendar() {
        var selectedElems = document.querySelectorAll('.selected')
        for(let i = 0; i < selectedElems.length; i++) {
            selectedElems.item(i).classList = "cell"
        }
    }

    const inputPlaceholderSet = async e => {
        if(participants.indexOf("Add new User") !== -1) e.target.placeholder = "Add new User"
        else e.target.placeholder = ""
    }

    const radioChange = async choice => {
        if(choice === "perfect") {
            document.getElementById("tierSelector").classList.add('perfect')
            document.getElementById("tierSelector").classList.remove('works')
            document.getElementById("tierSelector").classList.remove('ratherNot')
        }
        else if(choice === "works") {
            document.getElementById("tierSelector").classList.remove('perfect')
            document.getElementById("tierSelector").classList.add('works')
            document.getElementById("tierSelector").classList.remove('ratherNot')            
        }
        else if(choice === "ratherNot") {
            document.getElementById("tierSelector").classList.remove('perfect')
            document.getElementById("tierSelector").classList.remove('works')
            document.getElementById("tierSelector").classList.add('ratherNot')            
        }
        typeChanged(choice)
    }

    const loginEnter = async e => {        
        if(e === 'Enter') {
            login()
        }
    }
    
    if(!confirmed) {
        return (
            <div>
                <a href='/' id='homeButton'>Take me home</a>      
                <div id='loginDiv'>
                    <label for="password">Please provide a password</label>
                    <input type="password" name="password" id="password" onChange={e => setPassword(e.target.value)} onKeyPress={e => loginEnter(e.key)}></input>
                    <button onClick={login}>Login</button>
                    <p id='badLogin'></p>
                </div>     
            </div>
        )
    }
    else {
        return(
            <div>
                <a href='/' id='homeButton'>Take me home</a>
                <div id='meetingContainer'>
                    <h2 id='meetingHeader'>Please provide times for this meeting</h2>
                    {info}
                    <label for="username">Current User</label>
                    <input type="text" list="datalist" onChange={e => userChange(e.target.value)} onKeyPress={e => userKeyPressed(e.key)} onSelect={e => inputPlaceholderSet(e)} id='usernameInput'></input>
                    <datalist id="datalist">
                        {userOptions}
                    </datalist>
                    {checkUser()}
                    {calendar}             
                    <button onClick={save} className='controlButtons'>Save</button>
                    <button onClick={copyLink} className='controlButtons'>Copy Link</button>
                    <button onClick={generateMeeting} className='controlButtons'>Generate Best Meeting(s)</button>
                    <button onClick={deleteMeeting} className='controlButtons'>Delete Meeting</button>
                    <button onClick={() => window.location.reload()} hidden={true} id='refreshButton'>Take me back</button>
                    <p id='errorParagraph'></p>
                </div>
                <div id="tierSelector" className='perfect'>
                    <h3>Select the quality of the time slot</h3>
                    <input type="radio" value="perfect" id="perfectRadio" onChange={e => radioChange(e.target.value)} checked={perfectChecked}/> Perfect for me
                    <input type="radio" value="works" id="worksRadio" onChange={e => radioChange(e.target.value)} checked={worksChecked}/> This would work
                    <input type="radio" value="ratherNot" id="ratherNotRadio" onChange={e => radioChange(e.target.value)} checked={ratherNotChecked}/> Rather not
                </div>
            </div>
        )
    }
}
