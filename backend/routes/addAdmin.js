const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept')
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    next();
})

const Meeting = require('../Schema/Meeting')
//mongoose.connect('mongodb://localhost:27017/scheduleMeeting', {useNewUrlParser:true, useUnifiedTopology:true})

router.post('/addAdmin', (req, res) => {
    if(req.body.admin === "") return res.status(409).send({message: 'You have to enter a name for the new admin'})
    Meeting.findOne({name: req.body.meeting}, (err, meeting) => {
        if(err) res.status(500).send({message: 'Error accessing the database'})
        else if(!meeting) res.status(404).send({messsage: 'There is no meeting with the id ' + req.body.meeting})
        else {
            meeting.participants.push(req.body.admin)
            meeting.setAdminPassword(req.body.password)
            meeting.save((err, meeting) => {
                if(err) return res.status(500).send({message: 'Error accessing the database'})
            })
            return res.status(200).send({message: 'New admin added'})    
        }
    })
})

module.exports = router
