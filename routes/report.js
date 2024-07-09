const express = require('express');
const mongoose = require('mongoose');
const { MCQ, OEQ } = require('../schema/question');
const User = require('../schema/user');
const { ReportedPost, ReportedReply, ReportedQuestion } = require('../schema/reported');
const ForumPost = require('../schema/forumpost');
const ForumReply = require('../schema/forumreply');

const router = express.Router();

// report question
router.post('/report/reportQuestion', async (req, res) => {
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

    question = await MCQ.findById(questionId).exec();
    if (question) {
      questionType = 'MCQ';
    } else {
      question = await OEQ.findById(questionId).exec();
      if (question) {
        questionType = 'OEQ';
      } else {
        return res.status(404).json({ message: `Question with questionId ${questionId} not found` });
      }
    }

    // Checks if question has been reported before
    const previousReport = await ReportedQuestion.findOne({ reporter: user._id, 'question.questionId': questionId }).exec();
    if (previousReport) {
      return res.status(400).json({ message: `Question has already been reported. \n \nPrevious report reason: "${previousReport.reportReason}"`});
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
router.post('/report/reportForumPost', async (req, res) => {
  try {
    const { username, postId, reportReason } = req.body;
    
    // No user provided
    if (!username) {
      return res.status(400).json({ message: 'User not provided' });
    }

    // Checks for user
    const user = await User.findOne({ username: username }).exec();
    if (!user) {
      return res.status(404).json({ message: `User with username ${username} not found` });
    }

    // Checks for valid postId
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid forum postId' });
    }

    // Checks for forum post
    const forumPost = await ForumPost.findById(postId).exec();
    if (!forumPost) {
      return res.status(404).json({ message: `Post with postId ${postId} not found` });
    }

    // Checks if post has been reported before
    const previousReport = await ReportedPost.findOne({ reporter: user._id, postId: postId }).exec();
    if (previousReport) {
      return res.status(400).json({ message: `Post has already been reported. \n \nPrevious report reason: "${previousReport.reportReason}"`});
    }

    // Checks report body
    if (!reportReason || reportReason.trim() === '') {
      return res.status(400).json({ message: 'Please provide a valid report reason' });
    }

    const reportedPost = new ReportedPost({
      postId: postId,
      reporter: user._id,
      reportReason: reportReason,
    });
    await reportedPost.save()
                      .then(post => console.log(`Post ID: ${postId} reported successfully: Report ID: ${reportedPost._id}` ));
    res.status(201).json({ reportId: reportedPost._id });
  } catch (error) {
    console.log('Unable to report forum post');
    console.error(error);
    res.status(500).json({ message: 'Error reporting forum post', error });
  }
});

// report forum reply
router.post('/report/reportForumReply', async (req, res) => {
  try {
    const { username, replyId, reportReason } = req.body;
    
    // No user provided
    if (!username) {
      return res.status(400).json({ message: 'User not provided' });
    }

    // Checks for user
    const user = await User.findOne({ username: username }).exec();
    if (!user) {
      return res.status(404).json({ message: `User with username ${username} not found` });
    }

    // Checks for valid replyId
    if (!replyId || !mongoose.Types.ObjectId.isValid(replyId)) {
      return res.status(400).json({ message: 'Invalid forum reply Id' });
    }

    // Checks for forum reply
    const forumReply = await ForumReply.findById(replyId).exec();
    if (!forumReply) {
      return res.status(404).json({ message: `Reply with replyId ${replyId} not found` });
    }

    // Checks if reply has been reported before
    const previousReport = await ReportedReply.findOne({ reporter: user._id, replyId: replyId }).exec();
    if (previousReport) {
      return res.status(400).json({ message: `Reply has already been reported. \n \nPrevious report reason: "${previousReport.reportReason}"`});
    }

    // Checks report body
    if (!reportReason || reportReason.trim() === '') {
      return res.status(400).json({ message: 'Please provide a valid report reason' });
    }

    const reportedReply = new ReportedReply({
      postId: forumReply.postId,
      replyId: replyId,
      reporter: user._id,
      reportReason: reportReason,
    });
    await reportedReply.save()
                       .then(post => console.log(`Reply ID: ${replyId} reported successfully: Report ID: ${reportedReply._id}` ));
    res.status(201).json({ reportId: reportedReply._id });
  } catch (error) {
    console.log('Unable to report forum reply');
    console.error(error);
    res.status(500).json({ message: 'Error reporting forum reply', error });
  }
});

// fetch all reported questions
router.get('/report/fetchReportedQuestions', async (req, res) => {
  try {
    const fetched = await ReportedQuestion.find()
                                          .sort({ dateCreated: -1 })
                                          .limit(50)
                                          .populate({
                                            path: 'question.questionId',
                                            populate: {
                                              path: 'author',
                                            }
                                          })
                                          .populate('reporter')
                                          .exec();
    
    const mappedQuestions = fetched.map(doc => {
      const toObj = doc.toObject();
      toObj.question.questionId.questionType = toObj.question.questionType;
      toObj.question.questionId.author = toObj.question.questionId.author.username;
      toObj.question = toObj.question.questionId;
      toObj.reporter = toObj.reporter.username;
      return toObj;
    });
    console.log('Reported questions fetched successfully!');
    res.status(200).json({ questions: mappedQuestions });
  } catch (error) {
    console.log('Unable to fetch reported questions');
    console.error(error);
    res.status(500).json({ message: 'Error fetching reported questions', error });
  }
});

// fetch all reported forum posts (doesn't populate attachments)
router.get('/report/fetchReportedPosts', async (req, res) => {
  try {
    const fetched = await ReportedPost.find()
                                      .sort({ dateCreated: -1 })
                                      .limit(50)
                                      .populate('reporter')
                                      .populate({
                                        path: 'postId',
                                        populate: {
                                          path: 'userId',
                                        }
                                      })
                                      .exec();
    
    const mappedPosts = fetched.map(doc => {
      const toObj = doc.toObject();
      toObj.reporter = toObj.reporter.username;
      toObj.postId.userId = toObj.postId.userId.username;
      return toObj;
    });
    console.log('Reported posts fetched successfully!');
    res.status(200).json({ questions: mappedPosts });
  } catch (error) {
    console.log('Unable to fetch reported posts');
    console.error(error);
    res.status(500).json({ message: 'Error fetching reported posts', error });
  }
});

// fetch all reported forum replies
router.get('/report/fetchReportedReplies', async (req, res) => {
  try {
    const fetched = await ReportedReply.find()
                                       .sort({ dateCreated: -1 })
                                       .limit(50)
                                       .populate('reporter')
                                       .populate({
                                         path: 'postId',
                                         populate: {
                                           path: 'userId',
                                         }
                                       })
                                       .populate({
                                        path: 'replyId',
                                        populate: {
                                          path: 'userId',
                                        }
                                       })
                                       .exec();
    
    const mappedReplies = fetched.map(doc => {
      const toObj = doc.toObject();
      toObj.reporter = toObj.reporter.username;
      toObj.postId.userId = toObj.postId.userId.username;
      toObj.replyId.userId = toObj.replyId.userId.username;
      return toObj;
    });
    console.log('Reported replies fetched successfully!');
    res.status(200).json({ questions: mappedReplies });
  } catch (error) {
    console.log('Unable to fetch reported replies');
    console.error(error);
    res.status(500).json({ message: 'Error fetching reported replies', error });
  }
});

module.exports = router;