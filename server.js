const express = require('express')
const mongoose = require('mongoose')
const { studentModel, instructorModel, courseModel } = require('./Mongoose')
const app = express()

mongoose.connect('mongodb://0.0.0.0:27017/lms')
    .then(() => { console.log("server is connected to the node js application") })
    .catch((err) => { console.log(err); })

const lmsSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: { type: String, required: true },
})

const lmsModel = mongoose.model('registrationdetail', lmsSchema)

app.use(express.json())

app.post('/register', async (req, resp) => {
    const { username, email, password, roles } = req.body;

    if (roles === 'admin') {
        const data = new lmsModel({ username: username, email: email, password: password, roles: roles })
        await data.save();
        resp.send("Admin details save to the admin database")
    } else if (roles === 'student') {
        const studentData = new studentModel({ username: username, email: email, password: password, roles: roles })
        await studentData.save();
        resp.send("Student details save to the student database");
    } else if (roles === 'instructor') {
        const instructorData = new instructorModel({ username: username, email: email, password: password, roles: roles })
        await instructorData.save();
        resp.send("instructor details save to the instructor database");
    }
})

app.get('/login', async (req, resp) => {
    const { email, password, roles } = req.body;

    try {
        if (roles === 'admin') {
            const findDetails = await lmsModel.findOne({ email })

            if (!findDetails) {
                resp.send({ message: "Admin Details Not found" })
            }

            if (password !== findDetails.password) {
                resp.send('password is invalid')
            }
            resp.redirect('/admindashboard')

        }

        else if (roles === 'student') {
            const findStudent = await studentModel.findOne({ email })

            if (!findStudent) {
                resp.send("Email or Password is invalid")
            }
            if (password !== findStudent.password) {
                resp.send("Password is invalid")
            }

            resp.redirect('/student')
        }

        else if (roles === 'instructor') {
            resp.redirect('/instructor')
        }
        resp.end()

    } catch (error) {
        resp.send("error")
    }
})

app.get('/admindashboard', async (req, resp) => {
    try {
        const findStudent = await studentModel.find();
        const findInstructor = await instructorModel.find()
        resp.json({ findStudent, findInstructor })
    } catch (error) {
        resp.send("Error Occured while getting the student and instructor data form the database")
    }
})

app.get('/student', async (req, resp) => {
    try {
        const findCourse = await courseModel.find();
        resp.send(findCourse);
    } catch (error) {
        resp.send("Error occured while getting the course data from the database")
    }
})

app.put('/course/:_id', async (req, resp) => {
    try {
        const { purches, studentid } = req.body;
        const pursesCourse = await courseModel.findById(req.params._id);
        if (!pursesCourse) {
            resp.send("Course Not found")
        }
        else {
            if (purches === 'add course') {
                await studentModel.updateOne(
                    { "_id": studentid },
                    { $push: { courses: { "courseid": req.params._id, "date": Date.now() } } }
                )
                resp.send(`course has been add to the student id ${studentid}`);
            }
            resp.end();
        }
    } catch (error) {
        resp.send("Error occured while adding the course")
    }
})

app.get('/instructor', async (req, resp) => {
    try {
        const findCourse = await courseModel.find();
        resp.send(findCourse)
    } catch (error) {
        resp.send("Error while getting the data from the instructor server", error)
    }
})

app.post('/instructor/updatedcourse', async (req, resp) => {
    try {
        const { coursename, description, price, type } = req.body;
        const saveCourse = new courseModel({ coursename: coursename, description: description, price: price })
        await saveCourse.save();
        resp.json({ message: "Course has been successfully saved" });
    }
    catch (err) {
        resp.send("Error While uploading the course", err)
    }
})


app.listen(8081, () => {
    console.log("Server is running on the port no 8081")
})



