const express = require('express');
const mongoose = require('mongoose');
const { MCQ, OEQ } = require('../schema/question');
const User = require('../schema/user');
const { ReportedPost, ReportedReply, ReportedQuestion } = require('../schema/reported');

const router = express.Router();

// report question
router.post('report/reportQuestion', async (req, res) => {
  try {
    const { username, questionId, reportReason } = req.body;

    // No user provided
    if (!username) {
      return res.status(400).json({ message: 'User not provided' });
    }

    // Checks for user
    const user = await User.findOne({ username: username }).exec();
    if (!user) {
      return res.status(404).json({ message: `User with username ${username} not found` });
    }

    // No question provided
    if (!questionId) {
      return res.status(400).json({ message: 'Question not provided' });
    }

    // Checks for question
    var question;
    var questionType;

    question = await MCQ.findById(questionId);
    if (question) {
      questionType = 'MCQ';
    } else {
      question = await OEQ.findById(questionId);
      if (question) {
        questionType = 'OEQ';
      } else {
        return res.status(404).json({ message: `Question with questionId ${questionId} not found` });
      }
    }

    // Checks report body
    if (!reportReason || reportReason.trim() === '') {
      return res.status(400).json({ message: 'Please provide a valid report reason' });
    }

    const reportedQuestion = new ReportedQuestion({
      question: {
        questionId: questionId,
        questionType: questionType,
      },
      reporter: user._id,
      reportReason: reportReason
    });
    await reportedQuestion.save()
                          .then(qn => console.log(`Question ID: ${ questionId } reported successfully: Report ID: ${reportedQuestion._id}`));
    res.status(201).json({ reportId: reportedQuestion._id });
  } catch (error) {
    console.log('Unable to report question');
    console.error(error);
    res.status(500).json({ message: 'Error reporting question', error });
  }
});

// report forum post

// report forum reply

// fetch all reported questions

// fetch all reported forum posts

// fetch all reported forum replies

module.exports = router;