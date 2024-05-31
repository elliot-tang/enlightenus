# enlighteNUS
An integrated mobile quiz application which comprises quizzes on NUS modules as well as general knowledge topics as well as a forum feature to facilitate discussions on quiz questions and related topics.

Project for NUS Orbital\
Level of Achievement: Apollo 11

## Problem Statement
Many quiz applications offer topics which are generic and irrelevant to a person’s course of study. On the other hand, many NUS students often find studying and preparing for examinations tedious and isolating. 
Furthermore, access to past-year papers via NUS libraries is patchy and outdated. 
A quiz application, which doubles as a community for discussion of modules and other extra-curricular topics, will make studying more fun and collaborative, and also improve access to practice questions. 

## Project Solution and Core Features
We aim to create an integrated quiz app that is tailored to help NUS students learn and have fun at the same time. 
The topics we intend to host come from a mix of NUS specific modules and general trivia. The core features will include:
- Authentication and Login (Implemented)
   - Users will need to create an account and login in order to build their profile.
- Create and Play Quizzes (Partially Implemented)
   - Users will be able to contribute new questions and quizzes to a common database for other users to play. Questions can be a short answer format or an MCQ format. Each question has a short explanation for the correct answer and can accept multiple correct answers.
- Edit Previously Contributed Questions and Quizzes
   - Users will be able to modify their questions or quizzes and re-submit them to the database.
- Leaderboard
   - We will include a quiz specific and global leaderboard in our app to encourage healthy competition between users
- Analytics
   - Users will be able to see their own analytics, as well as the analytics of the quizzes they have created. Example data may include, most commonly attempted topic, average score, most incorrectly answered question (of a quiz).
- Reporting Questions
   - Users will be able to flag and report questions which are inappropriate or have incorrect answers/explanations.
- Search
   - Users will be able to search the database for questions based on keywords and topic categories.
- Saving Quizzes, Questions and Answers
   - Users will be able to save quizzes, questions and answers for future reference.
- Forum 
   - A space for users to post questions and discuss answers to quiz questions.
- ChatGPT Integration
   - Users will be able to generate questions from a formatted prompt that is sent to ChatGPT.

## User Stories
- As a student, I want a seamless login procedure which will allow me to create and play quizzes under my own username. (Authentication and Login)
- As a student seeking to improve my understanding of basic concepts, I hope to obtain additional practice questions for my modules and get instant feedback on my answers on a simple, user-friendly interface. (Create and Play Quizzes)
- As a student seeking to pass the time whilst broadening my general knowledge, I want to test my general knowledge on a wide variety of topics and compete against other users. (Leaderboards)
- As a student who is short of time, I want a quick way to search for interesting quizzes, questions or topics. (Search / Saving Quizzes, Questions and Answer)
- As a student who needs more practice with certain topics, I want to have a way to generate a series of questions with answers and explanations at the push of a button. (ChatGPT Integration)
- As a tutor, I want to create questions and quizzes which will help my students revise for their exams. (Create and Play Quizzes)
- As a tutor who wants to help my students improve, I hope to identify areas where my students are weak at and correct any misunderstandings using the community forum feature. (Forum / Analytics)
- As a tutor, I wish to have the option to create different question formats. (Create and Play Quizzes)

## Projected Timeline
### Milestone 1
Proof of Concept:
- Authentication Feature (Completed)
   - Login, Register User, Logout functionality implemented
   - User email, username, encrypted password stored in MongoDB Database
- Quiz Interface (In Progress, Not Yet Integrated)
   - Created home screen navigation skeleton
   - Created screens for two types of quizzes, scroll view and questions 1 by 1.
- Deployment of Application (Partially Completed)
   - Backend deployed on AWS EC2 instance
   - Frontend not deployed

### Milestone 2
Implementation of Core Features:
- Integration of quiz interface into main app
- Allow quizzes and questions to be stored in and retrieved from MongoDB Database
- Leaderboard Feature
- Score Analytics Feature
- Question Reporting Feature
- Forum Feature
Unit Testing of Individual Features and Integration Testing of Entire Application

### Milestone 3
Implementation of Extension Features:
- Integration with ChatGPT
Continued Integration Testing and Bug Fixing

## Project Log

## Tech Stack
### Frameworks
1. React Native and Expo Go (Frontend)
2. Axios (Communication between Frontend and Backend)
3. Node.js and Express.js (Backend)
4. MongoDB and MongoDB Atlas (Database)
5. AWS EC2 (Backend Hosting)
6. Vercel (projected) (Frontend Deployment)

### Others
1. TypeScript and JavaScript (Frontend and Backend Code)
2. Git and GitHub (for Version Control and CI/CD)
3. OpenAI API (for integration with ChatGPT for question and answer generation)
