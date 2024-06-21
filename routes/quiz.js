const express = require('express');
const mongoose = require('mongoose');
const { MCQ, OEQ } = require('../schema/question');
const Quiz = require('../schema/quiz');
const User = require('../schema/user');
const { UserSavedQuestion, UserSavedQuiz } = require('../schema/usersavedquiz');

const router = express.Router();

// create MCQ
router.post('/quiz/createMCQ', async (req, res) => {
  try {
    const { questionBody, options, author, explainText } = req.body;
    
    // Ensures question body is not empty
    if (questionBody.trim() === "") {
      return res.status(400).json({ message: 'Please do not input an empty question body!' });
    }

    // Checks for at least one answer option
    if (!options || options.length === 0) {
      return res.status(400).json({ message: 'You must have at least one answer option!' });
    }

    // Checks if all answer options are unique
    const answers = options.map(option => option.answer);
    if (answers.length !== new Set(answers).size) {
      return res.status(400).json({ message: 'Each answer option must be unique!' });
    }

    // Checks for at least one correct answer
    if (!options.some(option => option.isCorrect === true)) {
      return res.status(400).json({ message: 'You must have at least one correct answer!' });
    }

    // Checks for valid author
    const user = await User.findOne({ username: author }).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    var questionData = {
      questionBody: questionBody,
      options: options,
      author: user._id,
    }

    // Checks for explainText and adds it to questionData if present
    if (explainText && explainText.trim() !== "") {
      questionData.explainText = explainText;
    }

    // Saves question and pushes to db
    const question = new MCQ(questionData);
    await question.save()
                  .then(qn => console.log(`Question ID: ${ question._id } saved successfully.`));
    res.status(201).json({ questionId: question._id });
  } catch (error) {
    console.log('Unable to add MCQ');
    console.error(error);
    res.status(500).json({ message: 'Error adding MCQ', error });
  }
});

// create OEQ
router.post('/quiz/createOEQ', async (req, res) => {
  try {
    const { questionBody, correctOptions, author, explainText } = req.body;

    // Ensures question body is not empty
    if (!questionBody || questionBody.trim() === "") {
      return res.status(400).json({ message: 'Please do not input an empty question body!' });
    }

    // Checks if at least one correct answer option 
    if (!correctOptions || correctOptions.length === 0) {
      return res.status(400).json({ message: 'You must have at least one answer option!' });
    }

    // Checks for valid author
    const user = await User.findOne({ username: author }).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    var questionData = {
      questionBody: questionBody,
      correctOptions: correctOptions,
      author: user._id,
    }

    // Checks for explainText and adds it to questionData if present
    if (explainText && explainText.trim() !== "") {
      questionData.explainText = explainText;
    }

    // Saves question and pushes to db
    const question = new OEQ(questionData);
    await question.save()
                  .then(qn => console.log(`Question ID: ${ question._id } saved successfully.`));
    res.status(201).json({ questionId: question._id });
  } catch (error) {
    console.log('Unable to add OEQ');
    res.status(500).json({ message: 'Error adding OEQ', error });
  }
});

// fetch all questions saved by user, limited to 20 for now
router.get('/quiz/fetchSavedQuestions', async (req, res) => {
  try {
    const username = req.body.username;
    
    // No user provided
    if (!username) {
      return res.status(400).json({ message: 'User not provided' });
    }

    // Checks for user
    const user = await User.findOne({ username: username }).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetches only 20 for now
    const fetched = await UserSavedQuestion.find({ userId: user._id, }, 'question -_id')
                                           .sort({ dateSaved: -1 })
                                           .limit(20)
                                           .populate('question.questionId')
                                           .exec();
    const questions = fetched.map(doc => {
      const toObj = doc.question.questionId.toObject ? doc.question.questionId.toObject() : doc.question.questionId;
      toObj['questionType'] = doc.question.questionType;
      return toObj;
    });
    console.log('Saved questions fetched successfully!');
    res.status(200).json({ questions: questions });
  } catch (error) {
    console.log('Unable to fetch questions');
    res.status(500).json({ message: 'Error fetching questions', error });
  }
});

// fetch all questions from database, limited to 20 for now
router.get('/quiz/fetchAllQuestions', async (req, res) => {
  try {
    const [fetchedMCQs, fetchedOEQs] = await Promise.all([MCQ.find({}).exec(), OEQ.find({}).exec()]);
    const MCQs = fetchedMCQs.map(doc => {
      const toObj = doc.toObject();
      toObj['questionType'] = 'MCQ';
      return toObj;
    });
    const OEQs = fetchedOEQs.map(doc => {
      const toObj = doc.toObject();
      toObj['questionType'] = 'OEQ';
      return toObj;
    });
    const questions = [...MCQs, ...OEQs];   
    questions.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
    const limited = questions.slice(0, 20);
    console.log('All questions fetched successfully!');
    res.status(200).json({ questions: limited });
  } catch (error) {
    console.log('Unable to fetch questions');
    res.status(500).json({ message: 'Error fetching questions', error });
  }
});

// create quiz
router.post('/quiz/createQuiz', async (req, res) => {
  try {  
    var { title, topic, questions, author, isVerified } = req.body;
    
    // Checks for valid author
    const user = await User.findOne({ username: author }).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ensures title is not empty
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Please provide a quiz title!' });
    }

    // Default topic: Miscellaneous
    if (!topic || topic.trim() === '') {
      topic = 'Miscellaneous';
    }

    // Ensures quiz has at least 1 question
    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'You must have at least one question!' });
    }

    // Checks for valid questionIds, questionTypes, questionAttempts and noOptions
    for (const qn of questions) {
      if (!qn.questionId) {
        return res.status(400).json({ message: 'QuestionId not provided' });
      };

      if (!mongoose.Types.ObjectId.isValid(qn.questionId)) {
        return res.status(400).json({ message: `questionId: ${qn.questionId} is an invalid ObjectId` });
      };

      if (!qn.questionType || (qn.questionType !== 'MCQ' && qn.questionType !== 'OEQ')) {
        return res.status(400).json({ message: 'Invalid questionType' });
      };

      // Fetches MCQ question and checks validity of noOptions
      var fetched;
      if (qn.questionType === 'MCQ') {
        fetched = await MCQ.findById(qn.questionId);
        if (!fetched) {
          return res.status(404).json({ message: `Question with questionId ${qn.questionId} not found`});
        }

        if (qn.noOptions && qn.noOptions > fetched.options.length) {
          return res.status(400).json({ message: 'Invalid noOptions' });
        }

        // Assigns default noOptions to number of provided options
        if (!qn.noOptions) {
          qn.noOptions = fetched.options.length;
        } 
      } else if (qn.questionType === 'OEQ') {
        fetched = await OEQ.findById(qn.questionId);
        if (!fetched) {
          return res.status(404).json({ message: `Question with questionId ${qn.questionId} not found`});
        }

        // Assign a dummy noOptions (bad code i got it)
        if (!qn.noOptions) {
          qn.noOptions = 1;
        } 
      }

      // Validate noOfAttempts if present
      if (qn.noOfAttempts && (!Number.isInteger(qn.noOfAttempts) || qn.noOfAttempts <= 0)) {
        return res.status(400).json({ message: 'Invalid noOfAttempts' });
      }
    };

    // Default verification: false
    if (!isVerified || typeof isVerified !== 'boolean') {
      isVerified = false;
    };

    // Saves quiz to db
    const createdQuiz = new Quiz({
      title: title,
      topic: topic, 
      questions: questions,
      author: user._id,
      isVerified: isVerified,
    });

    await createdQuiz.save()
                     .then(quiz => console.log(`Quiz ID: ${ createdQuiz._id } saved successfully.`));
    res.status(201).json({ quizId: createdQuiz._id });
  } catch (error) {
    console.log('Unable to create quiz');
    console.error(error);
    res.status(500).json({ message: 'Error creating quiz', error });
  }
});

// push question to quiz
router.post('/quiz/pushQuestion', async (req, res) => {
  try {
    const { quizId, questionId, questionType, questionAttempts, editor } = req.body;

    // Checks if ObjectIds are valid
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: 'Invalid quizId' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: 'Invalid questionId' });
    }

    // Checks for valid questionType
    if (!['MCQ', 'OEQ'].includes(questionType)) {
      return res.status(400).json({ message: 'Question must be an MCQ or OEQ' });
    }

    // Gets quiz
    const quiz = await Quiz.findById(quizId).populate('author').populate('questions.questionId').exec();
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Checks if question has already been added to the quiz
    const questionIds = quiz.questions.map(question => question.questionId._id.toString());
    if (questionIds.includes(questionId.toString())) {
      return res.status(400).json({ message: 'All questions must be unique!' });
    }

    // Checks for authorisation
    // TODO: (Consider:) Add editors array to quiz schema to allow for collaborators
    if (editor !== quiz.author.username) {
      return res.status(401).json({ message: 'You are not authorised to edit this quiz!' });
    }

    // Gets question
    let question;
    if (questionType === 'MCQ') {
      question = await MCQ.findById(questionId).exec();
    } else if (questionType === 'OEQ') {
      question = await OEQ.findById(questionId).exec();
    } else {
      return res.status(400).json({ message: 'Question must be an MCQ or OEQ' });
    }

    if (!question) {
      return res.status(404).json({ message: 'Question not found '});
    }

    // Default questionAttempts = 1
    if (!questionAttempts || typeof questionAttempts !== 'number' || isNaN(questionAttempts)) {
      questionAttempts = 1;
    }

    // Updates quiz on db
    quiz.questions.push({
      questionId: question._id,
      questionType: questionType,
      questionAttempts: questionAttempts,
    });

    await quiz.save()
              .then(quiz => console.log(`Quiz ID: ${ quizId } updated successfully.`));
    res.status(200).json({ quizId: quiz._id });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      errorMessage = error.errors.message;
      return res.status(400).json({ message: error.message });
    } else {
      console.log('Unable to push question to quiz');
      console.error(error);
      res.status(500).json({ message: 'Error pushing question to quiz', error });
    }
  }
});

// 

module.exports = router;