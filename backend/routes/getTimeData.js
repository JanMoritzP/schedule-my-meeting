const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept')
    res.header('Access-Control-Allow-Origin', '*')
    next();
})

const Meeting = require('./../Schema/Meeting')
mongoose.connect('mongodb://localhost:27017/scheduleMeeting', {useNewUrlParser:true, useUnifiedTopology:true})

router.post('/getTimeData', (req, res) => {
    Meeting.findOne({name: req.body.name}, (err, meeting) => {
        if(err) res.status(500).send({message: 'Error accessing the database'})
        else if(!meeting) res.status(409).send({message: `There is no meeting named ${req.body.name}`})
        else {
            if(!meeting.validatePassword(req.body.password)) res.status(403).send({message: 'The provided password is incorrect'})
            else {
                if(!meeting.participants.includes(req.body.user)) res.status(409).send({message: 'This user is not in the included meeting'})
                else {
                    var userIndex = meeting.participants.indexOf(req.body.user)
                    var userData =  meeting.timeData.filter((data) => {
                        if(data.split(';')[3] == userIndex)  return data  //send only the data for the provided user
                    })
                    res.status(200).send({
                        timeData: userData
                    })
                }
                
            }
        }
    })
})

module.exports = router
