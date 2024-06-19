const express = require('express');
const { MCQ, OEQ } = require('../schema/question');
const Quiz = require('../schema/quiz');
const User = require('../schema/user');
const { UserSavedQuestion, UserSavedQuiz } = require('../schema/usersavedquiz');

const router = express.Router();

// create MCQ
router.post('/quiz/createMCQ', async (req, res) => {
  try {
    const { questionBody, options, author } = req.body;
    
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
    if (corrects.some(option => option.isCorrect === true)) {
      return res.status(400).json({ message: 'You must have at least one correct answer!' });
    }

    // Checks for valid author
    const user = await User.findOne({ username: author }).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const question = new MCQ({ 
      questionBody: questionBody, 
      options: options, 
      author: user._id 
    });
    await question.save()
                  .then(qn => console.log(`Question ID: ${ question._id } saved successfully.`));
    res.status(200).json({ questionId: question._id });
  } catch (error) {
    console.log('Unable to add MCQ');
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(500).json({ message: error.message, error });
    }
    res.status(500).json({ message: 'Error adding MCQ', error });
  }
});

// create OEQ
router.post('/quiz/createOEQ', async (req, res) => {
  try {
    const { questionBody, correctOptions, author } = req.body;

    // Ensures question body is not empty
    if (questionBody.trim() === "") {
      return res.status(400).json({ message: 'Please do not input an empty question body!' });
    }

    // Checks if at least one correct answer option 
    if (correctOptions.length === 0) {
      return res.status(400).json({ message: 'You must have at least one answer option!' });
    }

    // Checks for valid author
    const user = await User.findOne({ username: author }).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const question = new OEQ({ 
      questionBody: questionBody, 
      correctOptions: correctOptions, 
      author: user._id 
    });
    await question.save()
                  .then(qn => console.log(`Question ID: ${ question._id } saved successfully.`));
    res.status(200).json({ questionId: question._id });
  } catch (error) {
    console.log('Unable to add OEQ');
    res.status(500).json({ message: 'Error adding OEQ', error });
  }
});

// fetch all questions saved by user
router.get('/quiz/fetchQuestions', async (req, res) => {
  try {
    const username = req.body;
    
    // No user id provided
    if (!username) {
      return res.status(400).json({ message: 'UserID not provided' });
    }

    // Checks for user
    const user = await User.findOne({ username: username }).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetches only 20 for now until we find out how to buffer lol
    const fetched = await UserSavedQuestion.find({ userId: user._id, }, 'question -_id')
                                           .sort({ dateSaved: -1 })
                                           .limit(20)
                                           .populate('question.questionId')
                                           .exec();
    const questions = fetched.map(doc => doc.question.questionId);
    console.log('Saved questions fetched successfully!');
    res.status(200).json({ questions: questions });
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
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Please provide a quiz title!' });
    }

    if (!topic || topic.trim() === '') {
      topic = 'Misc';
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'You must have at least one question!' });
    }

    if (!isVerified || typeof isVerified !== 'boolean') {
      isVerified = false;
    }

    const createdQuiz = new Quiz({
      title: title,
      topic: topic, 
      questions: questions,
      author: user._id,
      isVerified: isVerified,
    });

    await createdQuiz.save()
                     .then(quiz => console.log(`Quiz ID: ${ createdQuiz._id } saved successfully.`));
    res.status(200).json({ quizId: createdQuiz._id });
  } catch (error) {
    console.log('Unable to create quiz');
    res.status(500).json({ message: 'Error creating quiz', error });
  }
})

// push question to quiz
router.post('/quiz/pushQuestion', async (req, res) => {
  try {
    const { quizId, questionId, questionType, questionAttempts } = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: 'Invalid quizId' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: 'Invalid questionId' });
    }


    if (!['MCQ', 'OEQ'].includes(questionType)) {
      return res.status(400).json({ message: 'Question must be an MCQ or OEQ' });
    }

    const quiz = await Quiz.findById(quizId).exec();
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

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

    if (!questionAttempts || typeof questionAttempts !== 'number' || isNaN(questionAttempts)) {
      questionAttempts = 1;
    }

    quiz.questions.push({
      questionId: question._id,
      questionType: questionType,
      questionAttempts: questionAttempts,
    });

    await quiz.save()
              .then(quiz => console.log(`Quiz ID: ${ quizId } saved successfully.`));
    res.status(200).json({ quizId: quiz._id });
  } catch (error) {
    console.log('Unable to push question to quiz');
    res.status(500).json({ message: 'Error pushing question to quiz', error });
  }
})

module.exports = router;