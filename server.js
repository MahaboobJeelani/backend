const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const multer = require('multer')
const { studentModel, instructorModel, courseModel, adminModel } = require('./Mongoose');

const app = express()

mongoose.connect('mongodb://0.0.0.0:27017/lms')
    .then(() => { console.log("Mongodb is connected to the node js application") })
    .catch((err) => { console.log(err); })


app.use(express.json())
// app.use(express.static('uploads'))


// Register Endpoint for admin / student / instructor

const saltRound = 10;

const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/images")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});

const upload = multer({
    storage: Storage
}).single('file');

app.post('/register', upload, async (req, resp) => {

    const { username, email, password, roles } = req.body;

    const hashPassword = await bcrypt.hash(password, saltRound)

    const createMail = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        port: 465,
        auth: {
            user: "luckyjoy765@gmail.com",
            pass: "tnkt ptgn bixk iggy"
        }
    })

    const receiver = {
        from: "luckyjoy765@gmail.com",
        to: `${email}`,
        subject: `registration successfully`,
        text: `You have successfully registered for the role of ${roles}. Welcome aboard!`
    }

    try {
        if (roles === 'admin') {
            createMail.sendMail(receiver, async (err, mailResponse) => {
                if (err) {
                    resp.send(err)
                }
                const data = new adminModel({ username: username, email: email, password: hashPassword, roles: roles })
                await data.save();
                resp.status(200).send(`${username} register succesfully role is ${roles}`)
            })

        } else if (roles === 'student') {
            createMail.sendMail(receiver, async (err, mailResponse) => {
                if (err) {
                    resp.send(err)
                }
                else {
                    const profile = req.file.filename
                    const studentData = new studentModel({ username: username, email: email, password: hashPassword, roles: roles, profile: profile })
                    await studentData.save();
                    resp.status(200).send(`${username} register succesfully role is ${roles}`);

                }
            })

        } else if (roles === 'instructor') {
            createMail.sendMail(receiver);
            const instructorData = new instructorModel({ username: username, email: email, password: hashPassword, roles: roles })
            await instructorData.save();
            resp.status(200).send(`${username} register succesfully role is ${roles}`);
        }
    } catch (error) {
        resp.status(404).send(error.message);
    }
})


// Login Endpoint admin / student / instructor

app.post('/login', async (req, resp) => {
    const { email, password, roles } = req.body;

    try {
        if (roles === 'admin') {
            const findAdmin = await adminModel.findOne({ email })

            const camparePassword = await bcrypt.compare(password, findAdmin.password)

            if (!findAdmin) {
                resp.send({ message: "Admin Details Not found" })
            }

            if (!camparePassword) {
                resp.send('password is invalid')
            }

            else {
                resp.redirect('/admindashboard')
            }
        }

        else if (roles === 'student') {
            const findStudent = await studentModel.findOne({ email })
            const camparePassword = await bcrypt.compare(password, findStudent.password)


            if (!findStudent) {
                resp.send("Email or Password is invalid")
            }
            if (!camparePassword) {
                resp.send("Password is invalid")
            }

            else {
                resp.redirect('/student')
            }
        }

        else if (roles === 'instructor') {
            const findInstructor = await instructorModel.findOne({ email })

            const comparePassword = await bcrypt.compare(password, findInstructor.password)

            if (!findInstructor) {
                resp.status(404).send("Instructor not found")
            }

            if (!comparePassword) {
                resp.status(404).send("password is invalid")
            }

            else {
                resp.redirect('/instructor')
            }
        }

        resp.end()

    } catch (error) {
        resp.status(404).send(error.message)
    }
})


// Reset Password for admin / student / instructor

const passwordReset = async (req, resp, next) => {
    const { email, newpassword, roles } = req.body;

    try {
        if (roles === "admin") {
            const findEmail = await adminModel.findOne({ email })

            const comparePassword = await bcrypt.hash(newpassword, saltRound || 10)

            if (!findEmail) {
                resp.send("Admin invalid")
            }
            const updatedPassword = await adminModel.updateOne(
                { "email": email }, { $set: { "password": comparePassword } }
            )
            resp.status(200).send("password reset succesfully")
        }

        if (roles === 'student') {
            const findEmail = await studentModel.findOne({ email })

            const comparePassword = await bcrypt.hash(newpassword, saltRound || 10)

            if (!findEmail) {
                resp.send("Student invalid")
            }
            const updatedPassword = await studentModel.updateOne(
                { "email": email }, { "password": comparePassword }
            )
            resp.status(200).send("password reset succesfully");
        }

        if (roles === 'instructor') {
            const findEmail = await instructorModel.findOne({ email })

            const comparePassword = await bcrypt.hash(newpassword, saltRound || 10)

            if (!findEmail) {
                resp.send("Instructor details not found")
            }
            const updatedPassword = await instructorModel.updateOne(
                { "email": email }, { $set: { "password": comparePassword } }
            )
            resp.status(200).send("password reset succesffuly");
        }
    } catch (error) {
        resp.status(404).send(error.message)
    }
}

app.put('/resetpassword', passwordReset, (req, resp) => {
    resp.send("Passsword rest functionalities")
})


// Admin Dashboard 

app.get('/admindashboard', async (req, resp) => {

    try {
        const findStudent = await studentModel.find();
        const findInstructor = await instructorModel.find()
        resp.status(200).json({ findStudent, findInstructor })
    } catch (error) {
        resp.status(404).send("Error Occured while getting the student and instructor data form the database")
    }
})


// Student Course Details

app.get('/student', async (req, resp) => {
    try {
        const findCourse = await courseModel.find();
        resp.status(200).send(findCourse);
    } catch (error) {
        resp.status(404).send(error.message)
    }
})


// student profile

app.get('/student/profile/:stdid', async (req, resp) => {
    const { coursetype } = req.body
    try {
        const student = await studentModel.findById(req.params.stdid)
        if (!student) {
            resp.status(200).send("student not found")
        } else {
            const paidCourse = student.courses.filter(course => course.coursetype === coursetype);
            resp.status(404).send(paidCourse)
        }
    } catch (error) {
        console.log(error.message);
    }
})


// search for a course

app.get('/student/searchcourse', async (req, resp) => {
    try {
        const searchCourse = await courseModel.find(
            {
                coursename: { $regex: req.query.searchcourse, $options: 'i' }
            }
        )
        resp.status(200).send(searchCourse)
    } catch (error) {
        resp.status(404).send(error.message)
    }
})


// purchesing the course 

app.put('/course/:_id', async (req, resp) => {

    try {

        const { purches, studentid, coursetype } = req.body;

        const pursesCourse = await courseModel.findById(req.params._id);

        if (!pursesCourse) {
            resp.status(404).send("Course Not found")
        }

        else {
            if (purches === 'add course') {
                await studentModel.updateOne(
                    { "_id": studentid },
                    { $push: { courses: { "courseid": req.params._id, "date": Date.now(), "coursetype": coursetype } } }
                )
                resp.status(200).send(`course has been sucessfully enrolled to the course id ${req.params._id}`);
            }
        }
    } catch (error) {
        resp.status(404).send(error.message)
    }
})



// Instructor Details =========

app.get('/instructor', async (req, resp) => {
    try {
        const findCourse = await courseModel.find();
        resp.status(200).send(findCourse)
    } catch (error) {
        resp.status(404).send("Error while getting the data from the instructor server", error)
    }
})



// instructor is upload the course 

app.post('/instructor/publishcourse', async (req, resp) => {
    try {
        const { coursename, description, price } = req.body;

        const saveCourse = new courseModel({ coursename: coursename, description: description, price: price })
        await saveCourse.save();
        resp.status(200).json({ message: "Course has been successfully published" });
    }
    catch (err) {
        resp.status(404).send(err.message)
    }
})


// get all Wishlist from particular student

app.get('/wishlist/:stdin', async (req, resp) => {
    try {
        const student = await studentModel.findById(req.params.stdin)
        if (!student) {
            resp.send("user invalid")
        }
        resp.status(200).send(student.wishlist)
    } catch (error) {
        resp.status(404).send(error.message)
    }
})

// Add wishist

app.post('/wishlist/:stdid/:courseid', async (req, resp) => {
    try {
        const courseid = await courseModel.findById(req.params.courseid)
        const student = await studentModel.findById(req.params.stdid)

        student.wishlist.push(courseid)

        await student.save()
        resp.status(200).send(student)
    } catch (error) {
        resp.status(404).json({ message: error.message })
    }
})


// Certication

app.post('/certification/:completed', async (req, resp) => {
    const { studentid, courseid } = req.body;

    try {

        const student = await studentModel.findById(studentid);

        if (!student) {
            return resp.status(404).send('Student not found');
        }

        const course = await courseModel.findById(courseid);

        if (!course) {
            return resp.status(404).send('Course not found');
        }

        const studentCourse = student.courses.find(course => course.courseid.toString() === courseid);

        if (!studentCourse) {
            return resp.status(404).send('Course not enrolled by the student');
        }

        studentCourse.completed = req.params.completed

        await studentCourse.save();

        if (!studentCourse.completed) {
            return resp.status(400).send('Course not completed yet');
        }

        resp.send({
            username: student.username,
            coursename: course.coursename,
            date: new Date().toDateString()
        });


    } catch (error) {
        console.log(error.message);
        resp.status(500).send(error.message);
    }
});


app.listen(8081, () => {
    console.log("Server is running on the port no 8081");
})


