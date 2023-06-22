// Required modules
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(
    session({
        secret: 'your-secret-key',
        resave: true,
        saveUninitialized: true,
    })
);

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'job_applications',
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

/**
 * landing page
*/

app.get('/', (req, res) => {
    res.render('index');
});

/**
 * registration
*/

app.get('/register/user', (req, res) => {
    res.render('userRegistration');
});

app.post('/register/user', (req, res) => {
    const { name, email, password } = req.body;
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    connection.query(query, [name, email, password], (err, result) => {
        if (err) throw err;
        res.redirect('/login/user');
    });
});

app.get('/register/company', (req, res) => {
    res.render('companyRegistration');
});

app.post('/register/company', (req, res) => {
    const { name, email, password } = req.body;
    const query = 'INSERT INTO companies (name, email, password) VALUES (?, ?, ?)';
    connection.query(query, [name, email, password], (err, result) => {
        if (err) throw err;
        res.redirect('/login/company');
    });
});

/**
 * login
*/

app.get('/login/user', (req, res) => {
    res.render('userLogin');
});

app.post('/login/user', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    connection.query(query, [email, password], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            req.session.userId = result[0].id;
            res.redirect('/dashboard/user/' + req.session.userId);
        } else {
            res.redirect('/login/user');
        }
    });
});

app.get('/login/company', (req, res) => {
    res.render('companyLogin');
});

app.post('/login/company', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM companies WHERE email = ? AND password = ?';
    connection.query(query, [email, password], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            req.session.companyId = result[0].id;
            res.redirect('/dashboard/company/'+ req.session.companyId);
        } else {
            res.redirect('/login/company');
        }
    });
});

/**
 * -------------------------------------------------------------------------------------------
 *----------------------------------------- users  --------------------------------------
 *------------------------------- start of users route --------------------------------------
 *-------------------------------------------------------------------------------------------
*/

app.get('/dashboard/user/:id', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login/user');
        return;
    }
    const userId = req.session.userId;
    const query = 'SELECT job_applications.id, job_applications.title, job_applications.description, applications.status, (applications.user_id IS NOT NULL) AS applied FROM job_applications LEFT JOIN applications ON job_applications.id = applications.job_application_id AND applications.user_id = ' + req.session.userId;
    const quer = 'SELECT * FROM users WHERE id = ?';
    connection.query(query, (err, jobApplications) => {
        if (err) throw err;
        connection.query(quer, [userId], (err, userDetails) => {
            if (err) throw err;
                res.render('userDashboard', { jobApplications, user: userDetails[0] });
        });
    });
});

app.get('/dashboard/user/:id/update-details', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login/user');
        return;
    }
    const userId = req.session.userId;
    const query = 'SELECT * FROM users WHERE id = ?';

    connection.query(query, [userId], (err, userDetails) => {
        if (err) throw err;

        res.render('updateUser', { user: userDetails[0] });
    });
});


app.post('/dashboard/user/:id/update-details', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login/user');
        return;
    }
    const { name, email, cv } = req.body;
    const userId = req.session.userId;
    const updateUserQuery = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    connection.query(updateUserQuery, [name, email, userId], (err, result) => {
        if (err) throw err;
        if (req.files && req.files.cv) {
            const cvFile = req.files.cv;
            const getCVQuery = 'SELECT cv_path FROM users WHERE id = ?';
            connection.query(getCVQuery, [userId], (err, result) => {
                if (err) throw err;
                if (result[0].cv_path) {
                    const oldCVPath = result[0].cv_path;
                    fs.unlink(oldCVPath, (err) => {
                        if (err) throw err;
                    });
                }
                const cvFilename = `${userId}_${cvFile.name}`;
                cvFile.mv(`uploads/${cvFilename}`, (err) => {
                    if (err) throw err;
                    const updateCVQuery = 'UPDATE users SET cv_path = ? WHERE id = ?';
                    connection.query(updateCVQuery, [`uploads/${cvFilename}`, userId], (err, result) => {
                        if (err) throw err;
                        res.redirect(`/dashboard/user/${userId}`);
                    });
                });
            });
        } else {
            res.redirect(`/dashboard/user/${userId}`);
        }
    });
});

app.get('/dashboard/user/:id/job-application/:userId/apply', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login/user');
        return;
    }
    const jobId = req.params.userId;
    const query = 'INSERT INTO applications (user_id, job_application_id) VALUES (?, ?)';
    connection.query(query, [req.session.userId, jobId], (err, result) => {
        if (err) throw err;
        res.redirect('/dashboard/user/:id');
    });
});

app.get('/dashboard/user/:id/job-application/:id/unapply', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login/user');
        return;
    }
    const jobId = req.params.id;
    const query = 'DELETE FROM applications WHERE user_id = ? AND job_application_id = ?';
    connection.query(query, [req.session.userId, jobId], (err, result) => {
        if (err) throw err;
        res.redirect('/dashboard/user/:id');
    });
});

app.get('/dashboard/user/:id/job-application/:userId/exam', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login/user');
        return;
    }
    const jobId = req.params.userId;
    const query = 'SELECT * FROM exam_questions WHERE job_application_id = ?';
    connection.query(query, [jobId], (err, examQuestions) => {
        if (err) throw err;
        res.render('jobExam', { examQuestions });
    });
});

app.post('/dashboard/user/:id/job-application/:userId/exam', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login/user');
        return;
    }
    const jobId = req.params.userId;
    const answers = req.body;
    const userId = req.session.userId;
    const query = 'INSERT INTO user_exam_answers (user_id, job_application_id, question_id, answer) VALUES (?, ?, ?, ?)';
    const values = [];
    for (const questionId in answers) {
        const answer = answers[questionId];
        values.push([userId, jobId, questionId, answer]);
    }
    connection.query(query, values, (err, result) => {
        if (err) throw err;
        res.redirect('/dashboard/user/:id');
    });
});

/**
 * -------------------------------------------------------------------------------------------
 *--------------------------------------- users -------------------------------------------
 *----------------------------------- End of users --------------------------------------
 *-------------------------------------------------------------------------------------------
*/

/**
 * -------------------------------------------------------------------------------------------
 *-------------------------------------- company  --------------------------------------
 *------------------------------- start of company route --------------------------------------
 *-------------------------------------------------------------------------------------------
*/

app.get('/dashboard/company/:id', (req, res) => {
    if (!req.session.companyId) {
        res.redirect('/login/company');
        return;
    }
    const companyId = req.session.companyId;
    const query = 'SELECT * FROM job_applications WHERE company_id = ?';
    connection.query(query, [companyId], (err, jobApplications) => {
        if (err) throw err;
        res.render('companyDashboard', { jobApplications, companyId });
    });
});

app.get('/dashboard/company/:id/job-application/create', (req, res) => {
    if (!req.session.companyId) {
        res.redirect('/login/company');
        return;
    }
    companyId = req.session.companyId
    res.render('createJobApplication', { companyId} );
});

app.post('/dashboard/company/:id/job-application/create', (req, res) => {
    if (!req.session.companyId) {
        res.redirect('/login/company');
        return;
    }
    const { title, description } = req.body;
    const companyId = req.session.companyId;
    const query = 'INSERT INTO job_applications (company_id, title, description) VALUES (?, ?, ?)';
    connection.query(query, [companyId, title, description], (err, result) => {
        if (err) throw err;
        res.redirect('/dashboard/company/:id/exam/create');
    });
});

app.get('/dashboard/company/:id/job-application/:appid/edit', (req, res) => {
    if (!req.session.companyId) {
        res.redirect('/login/company');
        return;
    }
    const companyId = req.session.companyId;
    const jobId = req.params.appid;
    const query1 = 'SELECT * FROM job_applications WHERE id = ?';
    const query2 = 'SELECT * FROM exam_questions WHERE job_application_id = ?';
    connection.query(query1, [jobId], (err, jobResults) => {
        if (err) throw err;
        connection.query(query2, [jobId], (err, questionResults) => {
            if (err) throw err;
            const jobApplication = jobResults[0];
            const questions = questionResults;
            res.render('editJobApplication', { jobApplication, questions, companyId });
        });
    });
});

app.post('/dashboard/company/:id/job-application/:appid/edit', (req, res) => {
    if (!req.session.companyId) {
        res.redirect('/login/company');
        return;
    }
    const companyId = req.session.companyId;
    const jobId = req.params.appid;
    const { title, description, questions } = req.body;
    const updateQuery = 'UPDATE job_applications SET title = ?, description = ? WHERE id = ?';
    connection.query(updateQuery, [title, description, jobId], (err, result) => {
        if (err) throw err;
        if (questions && questions.length > 0) {
            const selectQuery = 'SELECT question FROM exam_questions WHERE job_application_id = ?';
            connection.query(selectQuery, [jobId], (err, existingQuestions) => {
                if (err) throw err;
                const existingQuestionSet = new Set(existingQuestions.map(question => question.question));
                const newQuestions = questions.filter(question => !existingQuestionSet.has(question));
                if (newQuestions.length > 0) {
                    const insertQuery = 'INSERT INTO exam_questions (job_application_id, question) VALUES ?';
                    const insertValues = newQuestions.map(question => [jobId, question]);
                    connection.query(insertQuery, [insertValues], (err, result) => {
                        if (err) throw err;
                        res.redirect('/dashboard/company/'+ companyId);
                    });
                } else {
                    res.redirect('/dashboard/company/'+ companyId);
                }
            });
        } else {
            res.redirect('/dashboard/company/'+ companyId);
        }
    });
});

app.post('/dashboard/company/:id/job-application/:jbid/delete', (req, res) => {
    const companyId = req.session.companyId
    const jobId = req.params.jbid;
    const deleteQuery = 'DELETE FROM job_applications WHERE id = ?';
    connection.query(deleteQuery, [jobId], (err, result) => {
        if (err) throw err;
        res.redirect('/dashboard/company/'+ companyId);
    });
});

app.get('/dashboard/company/:id/exam/create', (req, res) => {
    if (!req.session.companyId) {
        res.redirect('/login/company/');
        return;
    }
    const companyId = req.params.id;
    res.render('setExamQuestions', { companyId });
});

app.post('/dashboard/company/:id/exam/create', (req, res) => {
    const companyId = req.params.id;
    const { questions } = req.body;

    if (questions && questions.length > 0) {
        const insertQuery = 'INSERT INTO exam_questions (job_application_id, question) VALUES ?';
        const insertValues = questions.map((question) => [companyId, question.question]);
        connection.query(insertQuery, [insertValues], (err, result) => {
            if (err) throw err;
            console.log('Exam questions added successfully!');
            res.redirect('/dashboard/company/'+ companyId);
        });
    } else {
        res.redirect('/dashboard/company/'+ companyId);
    }
});

app.get('/dashboard/company/:id/exam/edit', (req, res) => {
    const companyId = req.params.id;
    const query = 'SELECT * FROM exam_questions WHERE job_application_id = ?';
    connection.query(query, [companyId], (err, results) => {
        if (err) throw err;
        const questions = results.map((row) => ({ question: row.question }));
        res.render('editExamQuestions', { companyId, questions });
    });
});

app.post('/dashboard/company/:id/exam/edit', (req, res) => {
    const companyId = req.params.id;
    const { questions } = req.body;
    const deleteQuery = 'DELETE FROM exam_questions WHERE job_application_id = ?';
    connection.query(deleteQuery, [companyId], (err, result) => {
        if (err) throw err;
        if (questions && questions.length > 0) {
            const insertQuery = 'INSERT INTO exam_questions (job_application_id, question) VALUES (?, ?)';
            const insertValues = questions.map((question) => [companyId, question.question]);
            connection.query(insertQuery, insertValues, (err, result) => {
                if (err) throw err;
                res.redirect('/dashboard/company/'+ companyId);
            });
        } else {
            res.redirect('/dashboard/company/'+ companyId);
        }
    });
});

app.get('/dashboard/company/:id/job-application/:jobid/qualified-applicants', (req, res) => {
    if (!req.session.companyId) {
        res.redirect('/login/company');
        return;
    }
    const companyId = req.session.companyId;
    const jobId = req.params.jobid;
    const query = 'SELECT * FROM applications INNER JOIN users ON applications.user_id = users.id WHERE applications.job_application_id = ?';
    connection.query(query, [jobId], (err, results) => {
        if (err) throw err;
        res.render('qualifiedApplicants', { applicants: results, companyId });
    });
});

app.post('/dashboard/company/:id/job-application/:jobid/qualified-applicants/accept', (req, res) => {
    if (!req.session.companyId) {
        res.redirect('/login/company');
        return;
    }
    const companyId = req.session.companyId
    const jobId = req.params.jobid;
    const query = 'UPDATE applications SET status = "Accepted" WHERE job_application_id = ?';
    connection.query(query, [jobId], (err, result) => {
        if (err) throw err;
        res.redirect(`/dashboard/company/${companyId}/job-application/${jobId}/qualified-applicants`);
    });
});

app.post('/dashboard/company/:id/job-application/:jobid/qualified-applicants/reject', (req, res) => {
    if (!req.session.companyId) {
        res.redirect('/login/company');
        return;
    }
    const companyId = req.session.companyId;
    const jobId = req.params.id;
    const query = 'UPDATE applications SET status = "Rejected" WHERE user_id = ?';
    connection.query(query, [jobId], (err, result) => {
        if (err) throw err;
        res.redirect(`/dashboard/company/${companyId}/job-application/${jobId}/qualified-applicants`);
    });
});

/**
 * -------------------------------------------------------------------------------------------
 *------------------------------------- company  --------------------------------------
 *------------------------------- end of company route --------------------------------------
 *-------------------------------------------------------------------------------------------
*/

/**
 * Logout route
*/
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/');
    });
});


app.listen(3000, () => {
    console.log('Server started on port 3000');
});
