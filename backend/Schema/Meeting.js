const mongoose = require('mongoose')
const crypto = require('crypto')

const MeetingSchema = mongoose.Schema({
    participants: [String],
    participantAmount: {type: String, required: true},
    timeData: [String],
    hash: String,
    salt: String,
    name: {type: String, unique: true, required: true},
    startingDate: {type: String, required: true},
    endingDate: {type: String, required: true},
    admin: {type: String, required: true},
    adminHash: String,
    adminSalt: String
})

MeetingSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(32)
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`); 
}

MeetingSchema.methods.validatePassword = function(password) {
    tmpHash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`);
    return this.hash == tmpHash
}
MeetingSchema.methods.setAdminPassword = function(password) {
    this.adminSalt = crypto.randomBytes(32)
    this.adminHash = crypto.pbkdf2Sync(password, this.adminSalt, 1000, 64, `sha512`).toString(`hex`); 
}

MeetingSchema.methods.validateAdminPassword = function(password) {
    tmpAdminHash = crypto.pbkdf2Sync(password, this.adminSalt, 1000, 64, `sha512`).toString(`hex`);
    return this.adminHash == tmpAdminHash
}

const Meeting = module.exports = mongoose.model('meeting', MeetingSchema, 'scheduleMeeting')