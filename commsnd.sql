-- Table for users (applicants)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  cv_path VARCHAR(255) NOT NULL
);

-- Table for companies
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL
);

-- Table for job applications
CREATE TABLE job_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Table for applications (user-job application relationship)
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  job_application_id INT NOT NULL,
  status VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (job_application_id) REFERENCES job_applications(id)
);

-- Table for exam questions
CREATE TABLE exam_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_application_id INT NOT NULL,
  question TEXT,
  FOREIGN KEY (job_application_id) REFERENCES job_applications(id)
);

-- Table for user exam answers
CREATE TABLE user_exam_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  job_application_id INT NOT NULL,
  question_id INT NOT NULL,
  answer TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (job_application_id) REFERENCES job_applications(id),
  FOREIGN KEY (question_id) REFERENCES exam_questions(id)
);