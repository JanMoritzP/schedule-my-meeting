const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept')
    res.header('Access-Control-Allow-Origin', 'https://www.schedule-my-meeting.com')
    next();
})

const Meeting = require('./../Schema/Meeting')
mongoose.connect('mongodb://localhost:27017/scheduleMeeting', {useNewUrlParser:true, useUnifiedTopology:true})

router.post('/data/deleteMeeting', (req, res) => {
    Meeting.findOne({name: req.body.name}, (err, meeting) => {
        if(err) res.status(500).send({message: 'Error accessing the database'})
        else if(!meeting) res.status(409).send({message: `There is no meeting named ${req.body.name}`})
        else {
            if(req.body.password === "" || req.body.password === undefined || req.body.password === null) res.status(403).send({message: "You have to provide a password"})
            else if(!meeting.validatePassword(req.body.password)) res.status(403).send({message: 'The entered password is incorrect'})
            else {
                meeting.remove();
                res.status(200).send({message: "Meeting deleted"})
            }
        }
    })
})

module.exports = router
