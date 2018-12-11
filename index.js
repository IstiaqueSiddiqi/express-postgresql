
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
    let pageSize = 20, pageNumber = 1;
    let objKeys = Object.keys(req.query);

    if (objKeys.length) { // for request query string
        let whereObj = {};

        if (objKeys.indexOf("classes") !== -1) {
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

        if (objKeys.indexOf("active") !== -1) {
            whereObj["active"] = req.query.active;
        }

        if (objKeys.indexOf("pageSize") !== -1) {
            pageSize = req.query.pageSize;
        } else {
            pageSize = 20;
        }

        if (objKeys.indexOf("pageNumber") !== -1) {
            pageNumber = req.query.pageNumber;
        } else {
            pageNumber = 1;
        }

        student.findAndCountAll({
            where: whereObj,
            offset: ((pageNumber - 1) * pageSize),
            limit: pageSize
        }).then(resp => {
            if (objKeys.indexOf("admissionYearAfter") !== -1) {
                for (let i = 0; i < resp.rows.length; i++) {
                    let currYear = new Date(resp.rows[i].admissionDate).getFullYear();
                    if (currYear >= req.query.admissionYearAfter) {

                    } else {
                        resp.rows.splice(i, 1);
                    }
                }
            } else if (objKeys.indexOf("admissionYearBefore") !== -1) {
                for (let i = 0; i < resp.rows.length; i++) {
                    let currYear = new Date(resp.rows[i].admissionDate).getFullYear();
                    if (currYear < req.query.admissionYearBefore) {

                    } else {
                        resp.rows.splice(i, 1);
                    }
                }
            }

            resp["prevPage"] = ((pageNumber - 1) === 0) ? "" : pageNumber - 1;
            resp["nextPage"] = pageNumber + 1;
            return res.status(200).json(resp);
        }).catch(err => {
            return res.status(404).json({
                message: err.message,
                error: err.stack
            });
        });
    } else {
        student.findAndCountAll({ offset: ((pageNumber - 1) * pageSize), limit: pageSize }).then(result => {
            result["prevPage"] = ((pageNumber - 1) === 0) ? "" : pageNumber - 1;
            result["nextPage"] = pageNumber + 1;
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
    studentClass.create({
        roll_no: req.body.roll_no,
        classId: req.params.id
    }).then(resp => {
        return res.status(201).json({
            studentClass: resp.dataValues
        });
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