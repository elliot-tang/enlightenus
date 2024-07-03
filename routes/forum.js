const express = require('express');
const mongoose = require('mongoose');
const ForumPost = require('../schema/forumpost');
const ForumReply = require('../schema/forumreply');
const { MCQ, OEQ } = require('../schema/question');
const Quiz = require('../schema/quiz');
const User = require('../schema/user')

const router = express.Router();

// create forum post
router.post('/forum/createForumPost', async (req, res) => {
  try {
    var { username, postTitle, postTopic, postBody, isVerified, attachments } = req.body;
    
    // No user provided
    if (!username) {
      return res.status(400).json({ message: 'User not provided' });
    }

    // Checks for user
    const user = await User.findOne({ username: username }).exec();
    if (!user) {
      return res.status(404).json({ message: `User with username ${username} not found` });
    }

    // Ensures title is not empty
    if (!postTitle || postTitle.trim() === '') {
      return res.status(400).json({ message: 'Please provide a post title!' });
    }

    // Default topic: Uncategorised
    if (!postTopic || postTopic.trim() === '') {
      postTopic = 'Uncategorised';
    }

    // Ensures correct capitalisation of topic
    postTopic = postTopic.charAt(0).toUpperCase() + postTopic.slice(1).toLowerCase();

    // Ensures body is not empty
    if (!postBody || postBody.trim() === '') {
      return res.status(400).json({ message: 'Please provide a post body!' });
    }

    // Ensures valid attachments
    const mappedAttachments = [];
    for (const attachment of attachments) {
      if (!attachment.attachmentId) {
        return res.status(400).json({ message: 'AttachmentId not provided' });
      }

      if (!mongoose.Types.ObjectId.isValid(attachment.attachmentId)) {
        return res.status(400).json({ message: `attachmentId: ${attachment.attachmentId} is an invalid ObjectId` });
      };

      if (!attachment.attachmentType || (attachment.attachmentType !== 'Question' && attachment.attachmentType !== 'Quiz')) {
        return res.status(400).json({ message: 'Invalid attachmentType' });
      };

      var attachmentType;
      var attachmentName;
      var fetched;
      if (attachment.attachmentType === 'Question') {
        fetched = await MCQ.findById(attachment.attachmentId);
        
        if (fetched) {
          attachmentType = 'MCQ';
          attachmentName = (attachment.attachmentName && attachment.attachmentName.trim() !== '') 
                           ? attachment.attachmentName 
                           : fetched.questionBody;
        } else {
          fetched = await OEQ.findById(attachment.attachmentId);

          if (fetched) {
            attachmentType = 'OEQ';
            attachmentName = (attachment.attachmentName && attachment.attachmentName.trim() !== '') 
                             ? attachment.attachmentName 
                             : fetched.questionBody;
          } else {
            return res.status(404).json({ message: 'Question not found' });
          }
        }
      } else {
        fetched = await Quiz.findById(attachment.attachmentId);
        
        if (fetched) {
          attachmentType = 'Quiz';
          attachmentName = (attachment.attachmentName && attachment.attachmentName.trim() !== '') 
                           ? attachment.attachmentName 
                           : fetched.title;
        } else {
          return res.status(404).json({ message: 'Quiz not found' });
        }
      }
      mappedAttachments.push({ attachmentId: attachment.attachmentId, attachmentType, attachmentName });
    }

    // Default verification: false
    if (!isVerified || typeof isVerified !== 'boolean') {
      isVerified = false;
    };

    const forumPost = new ForumPost({
      userId: user._id,
      postTitle: postTitle,
      postTopic: postTopic,
      postBody: postBody,
      attachments: mappedAttachments,
      isVerified: isVerified,
    })
    await forumPost.save()
                   .then(post => console.log(`Forum Post ID: ${forumPost._id} successfully created`));
    res.status(201).json({ postId: forumPost._id });
  } catch (error) {
    console.log('Unable to create forum post');
    console.error(error);
    res.status(500).json({ message: 'Error creating forum post', error });
  }
});

// reply to forum post
router.post('/forum/createForumReply', async (req, res) => {
  try {
    const { username, postId, replyBody } = req.body;

    // No user provided
    if (!username) {
      return res.status(400).json({ message: 'User not provided' });
    }

    // Checks for user
    const user = await User.findOne({ username: username }).exec();
    if (!user) {
      return res.status(404).json({ message: `User with username ${username} not found` });
    }

    // No/invalid postId provided
    if (!postId) {
      return res.status(400).json({ message: 'PostId not provided' });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: `postId: ${postId} is an invalid ObjectId` });
    };

    // Checks for post
    const post = await ForumPost.findById(postId).exec();
    if (!post) {
      return res.status(404).json({ message: `Post ID: ${postId} not found` });
    }

    // Ensures body is not empty
    if (!replyBody || replyBody.trim() === '') {
      return res.status(400).json({ message: 'Please provide a reply body!' });
    }

    const forumReply = new ForumReply({
      userId: user._id,
      postId: postId,
      replyBody: replyBody,
    });
    await forumReply.save()
                    .then(reply => console.log(`Forum Reply ID: ${forumReply._id} successfully created`));
    res.status(201).json({ replyId: forumReply._id });
  } catch (error) {
    console.log('Unable to create forum reply');
    console.error(error);
    res.status(500).json({ message: 'Error creating forum reply', error });
  }
})

// fetch all forum posts
router.get('/forum/fetchAllPosts', async (req, res) => {
  try {
    // Initial population of post author and attachment authors
    const fetched = await ForumPost.find()
                                   .sort({ dateCreated: -1 })
                                   .limit(50)
                                   .populate('userId')
                                   .populate({
                                      path: 'attachments.attachmentId',
                                      populate: {
                                        path: 'author'
                                      }
                                   })
                                   .exec();
    
    // Population of questions and question authors for quizzes
    const quizPromises = [];
    fetched.forEach(doc => {
      doc.attachments.forEach(attachment => {
        if (attachment && attachment.attachmentId && attachment.attachmentType === 'Quiz') {
          quizPromises.push(attachment.attachmentId.populate({
            path: 'questions.questionId',
            populate: {
              path: 'author',
            }
          }).then(populatedAttachment => {
            attachment.attachmentId = populatedAttachment;
          }));
        }
      });
    });
    await Promise.all(quizPromises);

    // Mapping of attachments
    const mappedPosts = fetched.map(post => {
      const toObj = post.toObject();
      toObj.userId = toObj.userId.username;
      const mappedAttachments = toObj.attachments.map(attachment => {
        if (attachment.attachmentType === 'MCQ' || attachment.attachmentType === 'OEQ') {
          const mappedQuestion = attachment;
          mappedQuestion.attachmentId.author = mappedQuestion.attachmentId.author.username;
          mappedQuestion.attachmentId.questionType = attachment.attachmentType;
          return mappedQuestion;
        } else {
          const mappedQuiz = attachment;
          mappedQuiz.attachmentId.author = mappedQuiz.attachmentId.author.username;
          const mappedQuestions = mappedQuiz.attachmentId.questions.map(qn => {
            const mappedQuestion = qn.questionId;
            mappedQuestion.author = mappedQuestion.author.username;
            mappedQuestion.questionType = qn.questionType;
            mappedQuestion.questionAttempts = qn.questionAttempts;
            mappedQuestion.noOptions = qn.noOptions;
            return mappedQuestion;
          });
          mappedQuiz.attachmentId.questions = mappedQuestions;
          return mappedQuiz;
        }
      });
      toObj.attachments = mappedAttachments;
      return toObj;
    });
    
    console.log('Posts fetched successfully!');
    res.status(200).json({ posts: mappedPosts });
  } catch (error) {
    console.log('Unable to fetch forum posts');
    console.error(error);
    res.status(500).json({ message: 'Error fetching forum posts', error });
  }
});

// fetch all forum posts matching criteria (including created)
router.get('/forum/fetchAllPostsMatchCriteria', async (req, res) => {
  try {
    const { title, topic, isVerified, author } = req.query;

    var query = {};

    // Checks validity of title and adds it to query
    if (title) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json('Invalid title');
      } 
      query.postTitle = { $regex: title, $options: 'i' };
    }

    // Checks validity of topic and adds it to query
    if (topic) {
      if (typeof topic !== 'string' || topic.trim() === '') {
        return res.status(400).json('Invalid topic');
      } 
      query.postTopic = { $regex: `^${topic}$`, $options: 'i' };
    }

    // Checks validity of isVerified and adds it to query
    if (isVerified !== undefined && isVerified !== null) {
      if (typeof isVerified !== 'string' || isVerified.trim() === '' || (isVerified !== 'true' && isVerified !== 'false')) {
        return res.status(400).json('Invalid isVerified');
      } 
      query.isVerified = isVerified === 'true';
    }

    // No user provided
    if (!author) {
      return res.status(400).json({ message: 'User not provided' });
    }

    // Checks for user
    const user = await User.findOne({ username: author }).exec();
    if (!user) {
      return res.status(404).json({ message: `User with username ${author} not found` });
    } else {
      query.userId = user._id;
    }

    // Initial population of post author and attachment authors
    const fetched = await ForumPost.find(query)
                                   .sort({ dateCreated: -1 })
                                   .limit(50)
                                   .populate('userId')
                                   .populate({
                                      path: 'attachments.attachmentId',
                                      populate: {
                                        path: 'author'
                                      }
                                   })
                                   .exec();
    
    // Population of questions and question authors for quizzes
    const quizPromises = [];
    fetched.forEach(doc => {
      doc.attachments.forEach(attachment => {
        if (attachment && attachment.attachmentId && attachment.attachmentType === 'Quiz') {
          quizPromises.push(attachment.attachmentId.populate({
            path: 'questions.questionId',
            populate: {
              path: 'author',
            }
          }).then(populatedAttachment => {
            attachment.attachmentId = populatedAttachment;
          }));
        }
      });
    });
    await Promise.all(quizPromises);

    // Mapping of attachments
    const mappedPosts = fetched.map(post => {
      const toObj = post.toObject();
      toObj.userId = toObj.userId.username;
      const mappedAttachments = toObj.attachments.map(attachment => {
        if (attachment.attachmentType === 'MCQ' || attachment.attachmentType === 'OEQ') {
          const mappedQuestion = attachment;
          mappedQuestion.attachmentId.author = mappedQuestion.attachmentId.author.username;
          mappedQuestion.attachmentId.questionType = attachment.attachmentType;
          return mappedQuestion;
        } else {
          const mappedQuiz = attachment;
          mappedQuiz.attachmentId.author = mappedQuiz.attachmentId.author.username;
          const mappedQuestions = mappedQuiz.attachmentId.questions.map(qn => {
            const mappedQuestion = qn.questionId;
            mappedQuestion.author = mappedQuestion.author.username;
            mappedQuestion.questionType = qn.questionType;
            mappedQuestion.questionAttempts = qn.questionAttempts;
            mappedQuestion.noOptions = qn.noOptions;
            return mappedQuestion;
          });
          mappedQuiz.attachmentId.questions = mappedQuestions;
          return mappedQuiz;
        }
      });
      toObj.attachments = mappedAttachments;
      return toObj;
    });
    
    console.log('Posts fetched successfully!');
    res.status(200).json({ posts: mappedPosts });
  } catch (error) {
    console.log('Unable to fetch forum posts');
    console.error(error);
    res.status(500).json({ message: 'Error fetching forum posts', error });
  }
});

// fetch all replies given post
router.get('/forum/fetchPostReplies', async (req, res) => {
  try {
    const postId = req.query.postId;

    // Checks for valid postId
    if (!postId) {
      return res.status(400).json({ message: 'PostId not provided' });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: `postId: ${postId} is an invalid ObjectId` });
    };

    // Checks for post
    const post = await ForumPost.findById(postId).exec();
    if (!post) {
      return res.status(404).json({ message: `Post ID: ${postId} not found` });
    }

    const fetched = await ForumReply.find({ postId: postId })
                                    .sort({ dateCreated: 1 })
                                    .limit(50)
                                    .populate('userId')
                                    .exec();
    const mappedReplies = fetched.map(doc => {
      const mappedReply = {
        user: doc.userId.username,
        replyBody: doc.replyBody,
      };
      return mappedReply;
    })

    console.log('Replies fetched successfully!');
    res.status(200).json({ replies: mappedReplies });
  } catch (error) {
    console.log('Unable to fetch forum replies');
    console.error(error);
    res.status(500).json({ message: 'Error fetching forum replies', error });
  }
})

// save forum post

// fetch saved forum post

module.exports = router;