import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';

export default function CreateNewMeeting() {
    const date = new Date();
    
    const [name, setName] = useState("");
    const [uniqueCheck, setUniqueCheck] = useState("X")
    const [startingDate, setStartingDate] = useState(date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate());
    const [endingDate, setEndingDate] = useState();
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
                    startingDate: startingDate,
                    endingDate: endingDate,
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
                console.log(year + "-" + pad2(month) + "-" + pad2(parseInt(day) + 1))
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

    return(
        <div>
            <h2>Create a new meeting</h2>
            <form onSubmit={handleSubmit}>
                <label for="name">Name of the meeting {uniqueCheck}</label>
                <input type="text" id="name" name="name" onChange={e => setName(e.target.value)}></input>
                <label for="password">Password of the meeting</label>
                <input type="password" id="password" name="password"></input>
                <label for="startingDate">Starting Date</label>
                <input type="date" id="startingDate" name="startingDate"
                min={date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate()} value={startingDate}
                onChange={e => {setStartingDate(e.target.value)}}></input>
                <label for="endingDate">Ending Date</label>       
                <input type="date" id="endingDate" name="endingDate" min={getMinDate(startingDate)} value={getMinDate(startingDate)} onChange={e => setEndingDate(e.target.value)}></input>     
                <label for="participantAmount">Amount of participants</label>
                <input type="number" id="participantAmount" name="participantAmount"></input>           
                <input type="submit" value="Create"></input>
            </form>
        </div>
    )

}