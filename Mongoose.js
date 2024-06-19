const mongoose = require('mongoose');

mongoose.connect('mongodb://0.0.0.0:27017/lms')

const studentSchema = mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    roles: { type: String, required: true },
    courses: [
        {
            courseid: { type: String },
            date: { type: Date, default: Date.now() }
        }
    ],
});

const instructorSchema = mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    roles: { type: String, required: true },
})

const courseSchema = new mongoose.Schema({
    type: { type: String, required: true },
    coursename: { type: String, required: true },
    description: { type: String },
    price: Number
}, { timestamps: true })

const studentModel = mongoose.model('studentdetails', studentSchema)

const instructorModel = mongoose.model('instructordetails', instructorSchema)

const courseModel = mongoose.model('Course', courseSchema);

module.exports = { studentModel, instructorModel, courseModel }