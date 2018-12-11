
const express = require("express");
const app = express();
const port = process.env.PORT || 3000
const professor = require("./models").Professor;
const semClass = require("./models").SemesterClass;
const student = require("./models").Student;
const studentClass = require("./models").StudentClass;
const sequelize = require("sequelize");


app.use(express());
//parse requests
app.use(express.json());

const names = ["Ramesh", "Rajesh", "Kamlesh", "Prajita", "Suraj", "Usha", "Kunal", "Esita"];
const classNames = ["DMBS", "C++", "Java", "Operating System", "System Design", "Computer Organization", "Networking", "Maths"];

professor.count().then(count => {
    if (count === 0) {
        for (let i = 0; i < classNames.length; i++) {
            professor.create({
                name: names[i],
                designation: "Professor"
            }).then(prof => {
                semClass.create({
                    title: classNames[i],
                    university_staff_no: prof.dataValues.university_staff_no
                }).then(classes => {
                    console.log(classes.dataValues);
                })
            }).catch(err => {
                console.log("Error", err);
            })
        }
    }
})


// returns list of all the students filtered by the provided parameters
app.get("/students", async (req, res) => {
    // findAndCountAll{ offset: 20, limit: 1 }
    if (Object.keys(req.query).length) { // for request query string
        let whereObj = {};
        console.log(req.query)
        if (Object.keys(req.query).indexOf("classes") !== -1) {
            let results = await studentClass.findAll({
                attributes: ['roll_no'],
                where: {
                    classId: req.query.classes
                }
            })

            if (results.length) {
                let students = [];
                results.forEach(obj => {
                    students.push(obj.dataValues.roll_no);
                })
                whereObj["roll_no"] = students;
            }
        }

        if (Object.keys(req.query).indexOf("active") !== -1) {
            whereObj["active"] = req.query.active;
        }

        // if (Object.keys(req.query).indexOf("pageSize") !== -1) {
        //     whereObj["limit"] = req.query.pageSize;
        // } else {
        //     whereObj["limit"] = 20;
        // }

        // if (Object.keys(req.query).indexOf("pageNumber") !== -1) {
        //     whereObj["offset"] = req.query.pageNumber;
        // } else {
        //     whereObj["offset"] = 0;
        // }
        
        student.findAll({
            where: whereObj
        }).then(students => {
            // if(Object.keys(req.query).indexOf("admissionYearAfter") !== -1) {
            //     whereObj["admissionYearAfter"] = req.query.admissionYearAfter;
            // }
            return res.status(200).json(students);
        }).catch(err => {
            return res.status(404).json({
                message: err.message,
                error: err.stack
            });
        });
    } else {
        student.findAndCountAll({ limit: 20 }).then(result => {
            return res.status(200).json(result);
        }).catch(err => {
            return res.status(404).json({
                message: err.message,
                error: err.stack
            });
        });
    }
});


// return a single student whose id is given.
app.get("/students/:id", (req, res) => {
    student.findById(req.params.id).then(result => {
        if (result !== null) {
            return res.status(200).json(result);
        } else {
            return res.status(200).json({
                message: `No student is available with the given id:${req.params.id}.`
            });
        }
    }).catch(err => {
        return res.status(404).json({
            message: err.message,
            error: err.stack
        });
    });
});


// return the semester classes student is part of (including the professor teaching the class).
app.get("/students/:id/classes", (req, res) => {
    studentClass.findAll({
        attributes: ['classId'],
        where: {
            roll_no: req.params.id
        }
    }).then(results => {
        if (results.length) {
            let studClasses = [];
            results.forEach(obj => {
                studClasses.push(obj.dataValues.classId);
            })

            semClass.findAll({
                include: [professor],
                where: {
                    classId: studClasses
                }
            }).then(studClasses => {
                return res.status(200).json(studClasses);
            })
        } else {
            return res.status(404).json({
                message: `No student is available with the given id:${req.params.id}.`
            });
        }
    }).catch(err => {
        return res.status(404).json({
            message: err.message,
            error: err.stack
        });
    });
});


// Creates a student
app.post('/students', (req, res) => {
    student.create(req.body).then((result) => {
        return res.status(201).json({
            student: result.dataValues
        });
    }).catch(err => {
        return res.status(404).json({
            message: err.message,
            error: err.stack
        });
    });
});


// Allows updating of only name attribute for the given student.
app.patch('/students/:id', (req, res) => {
    student.findById(req.params.id).then(result => {
        if (!result) {
            return res.status(404).json({
                message: `No student is available with the given id:${req.params.id}.`
            });
        } else {
            return result.update({
                name: req.body.name,
            }).then(resp => {
                res.status(200).json(resp.dataValues)
            }).catch((error) => {
                res.status(400).json(error)
            });
        }
    }).catch(err => {
        return res.status(404).json({
            message: err.message,
            error: err.stack
        });
    });
});


// make the student inactive.
app.delete('/students/:id', (req, res) => {
    student.findById(req.params.id).then(result => {
        if (!result) {
            return res.status(404).json({
                message: `No student is available with the given id:${req.params.id}.`
            });
        } else {
            return result.update({
                active: false,
            }).then(resp => {
                res.status(200).json(resp.dataValues)
            }).catch((error) => {
                res.status(400).json(error)
            });
        }
    }).catch(err => {
        return res.status(404).json({
            message: err.message,
            error: err.stack
        });
    });
});


// Returns list of classes.
app.get("/classes", (req, res) => {
    semClass.findAll({ include: [professor] }).then(result => {
        return res.status(200).json(result);
    }).catch(err => {
        return res.status(404).json({
            message: err.message,
            error: err.stack
        });
    });
});


// Add provided students to a semester class.
app.post('/classes/:id/students', (req, res) => {
    // student.create(req.body).then((result) => {
    studentClass.create({
        // roll_no: result.dataValues.roll_no,
        roll_no: req.body.roll_no,
        classId: req.params.id
    }).then(resp => {
        return res.status(201).json({
            studentClass: resp.dataValues
        });
        // })
    }).catch(err => {
        return res.status(404).json({
            message: err.message,
            error: err.stack
        });
    });
});


// start server
const server = app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});