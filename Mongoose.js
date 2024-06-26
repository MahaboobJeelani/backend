const mongoose = require('mongoose');

mongoose.connect('mongodb://0.0.0.0:27017/lms')

const adminSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    roles: { type: String, required: true },
})

const courseSchema = new mongoose.Schema({
    coursename: { type: String, required: true },
    description: { type: String },
    price: Number
}, { timestamps: true })

const studentSchema = mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required : true},
    roles: { type: String, required: true },
    profile: { type: String },
    courses: [
        {
            courseid: { type: String },
            coursetype: { type: String },
            completed: { type: Boolean, default: true },
            date: { type: Date, default: Date.now() }
        }
    ],
    wishlist: [courseSchema]
});


const instructorSchema = mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    roles: { type: String, required: true },
})




const adminModel = mongoose.model('admindetails', adminSchema)

const studentModel = mongoose.model('studentdetails', studentSchema)

const instructorModel = mongoose.model('instructordetails', instructorSchema)

const courseModel = mongoose.model('Course', courseSchema);

module.exports = { studentModel, instructorModel, courseModel, adminModel }