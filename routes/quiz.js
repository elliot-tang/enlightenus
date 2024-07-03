const express = require('express');
const mongoose = require('mongoose');
const { MCQ, OEQ } = require('../schema/question');
const Quiz = require('../schema/quiz');
const User = require('../schema/user');
const { UserSavedQuestion, UserSavedQuiz } = require('../schema/usersavedquiz');
const UserTakenQuiz = require('../schema/usertakenquiz');

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
    const username = req.query.username;
    
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
                                           .limit(50)
                                           .populate({
                                              path: 'question.questionId', 
                                              populate: {
                                                path: 'author',
                                              }
                                            })
                                           .exec();
    const questions = fetched.map(doc => {
      const toObj = doc.question.questionId.toObject ? doc.question.questionId.toObject() : doc.question.questionId;
      toObj['questionType'] = doc.question.questionType;
      toObj['author'] = toObj.author.username;
      return toObj;
    });
    console.log('Saved questions fetched successfully!');
    res.status(200).json({ questions: questions });
  } catch (error) {
    console.log('Unable to fetch questions');
    res.status(500).json({ message: 'Error fetching questions', error });
  }
});

// fetch all questions created by user, limited to 20 for now
router.get('/quiz/fetchCreatedQuestions', async (req, res) => {
  try {
    const username = req.query.username;
    
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
    const [fetchedMCQs, fetchedOEQs] = await Promise.all([
      MCQ.find({ author: user._id }).populate('author').exec(), 
      OEQ.find({ author: user._id }).populate('author').exec()
    ]);

    const MCQs = fetchedMCQs.map(doc => {
      const toObj = doc.toObject();
      toObj['questionType'] = 'MCQ';
      toObj['author'] = toObj.author.username;
      return toObj;
    });

    const OEQs = fetchedOEQs.map(doc => {
      const toObj = doc.toObject();
      toObj['questionType'] = 'OEQ';
      toObj['author'] = toObj.author.username;
      return toObj;
    });

    const questions = [...MCQs, ...OEQs];   
    questions.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
    const limited = questions.slice(0, 50);
    console.log('All questions fetched successfully!');
    res.status(200).json({ questions: limited });
  } catch (error) {
    console.log('Unable to fetch questions');
    res.status(500).json({ message: 'Error fetching questions', error });
  }
});

// fetch all questions from database, limited to 20 for now
router.get('/quiz/fetchAllQuestions', async (req, res) => {
  try {
    const [fetchedMCQs, fetchedOEQs] = await Promise.all([
      MCQ.find({})
         .populate('author')
         .exec(), 
      OEQ.find({})
         .populate('author')
         .exec()]);
    const MCQs = fetchedMCQs.map(doc => {
      const toObj = doc.toObject();
      toObj['questionType'] = 'MCQ';
      toObj['author'] = toObj.author.username;
      return toObj;
    });
    const OEQs = fetchedOEQs.map(doc => {
      const toObj = doc.toObject();
      toObj['questionType'] = 'OEQ';
      toObj['author'] = toObj.author.username;
      return toObj;
    });
    const questions = [...MCQs, ...OEQs];   
    questions.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
    const limited = questions.slice(0, 50);
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

    // Default topic: Uncategorised
    if (!topic || topic.trim() === '') {
      topic = 'Uncategorised';
    }

    // Ensures correct capitalisation of topic
    topic = topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();

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
      topic: topic.toLowerCase(), 
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
    const { quizId, questionId, questionType, questionAttempts, noOptions, editor } = req.body;

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

    // Checks for valid noOptions
    let checkedOptions = noOptions;
    if (questionType === 'MCQ') {
      if (noOptions && noOptions > question.options.length) {
        return res.status(400).json({ message: 'Invalid noOptions' });
      }

      // Assigns default noOptions to number of provided options
      if (!noOptions) {
        checkedOptions = question.options.length;
      } 
    } else {
      if (!noOptions) {
        checkedOptions = 1;
      }
    }

    // Updates quiz on db
    quiz.questions.push({
      questionId: question._id,
      questionType: questionType,
      questionAttempts: questionAttempts,
      noOptions: checkedOptions,
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

// save question
router.post('/quiz/saveQuestion', async (req, res) => {
  try {
    const { username, questionId } = req.body;
    
    // checks for valid questionId
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: 'Invalid questionId' });
    }

    // Checks if user and question both exist
    const user = await User.findOne({ username: username }).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    var question = await OEQ.findById(questionId).exec();
    var questionType;
    if (question) {
      questionType = 'OEQ';
    } else {
      question = await MCQ.findById(questionId).exec();
      if (question) {
        questionType = 'MCQ';
      } else {
        return res.status(404).json({ message: 'Question not found' });
      }
    }

    // Checks if question has already been saved by user
    const existing = await UserSavedQuestion.findOne({ userId: user._id, 'question.questionId': questionId });
    if (existing) {
      return res.status(400).json({ message: 'Question already saved!' });
    }

    // Saves saved question and pushes to db
    const savedQuestion = new UserSavedQuestion({
      userId: user._id,
      question: {
        questionId: questionId,
        questionType: questionType,
      }
    });
    await savedQuestion.save()
                       .then(savedQn => console.log(`Question ID: ${ questionId } saved to User ${ username } successfully.`));
    res.status(201).json({ savedQuestionId: savedQuestion._id });
  } catch (error) {
    console.log('Unable to save question');
    res.status(500).json({ message: 'Error saving question', error });
  }
});

// save quiz
router.post('/quiz/saveQuiz', async (req, res) => {
  try {
    const { username, quizId } = req.body;
    
    // checks for valid quizId
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: 'Invalid quizId' });
    }

    // Checks if user and quiz both exist
    const user = await User.findOne({ username: username }).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const quiz = await Quiz.findById(quizId).exec();
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Checks if quiz has already been saved by user
    const existing = await UserSavedQuiz.findOne({ userId: user._id, quizId: quizId });
    if (existing) {
      return res.status(400).json({ message: 'Quiz already saved!' });
    }

    // Saves saved quiz and pushes to db
    const savedQuiz = new UserSavedQuiz({
      userId: user._id,
      quizId: quizId,
    });
    await savedQuiz.save()
                   .then(savedQuiz => console.log(`Quiz ID: ${ quizId } saved to User ${ username } successfully.`));
    res.status(201).json({ savedQuizId: savedQuiz._id });
  } catch (error) {
    console.log('Unable to save quiz');
    res.status(500).json({ message: 'Error saving quiz', error });
  }
});

// fetch quiz saved by user, limited to 20 for now
router.get('/quiz/fetchSavedQuizzes', async (req, res) => {
  try {
    const username = req.query.username;

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
    const fetched = await UserSavedQuiz.find({ userId: user._id })
                                       .sort({ dateSaved: -1 })
                                       .limit(50)
                                       .populate({
                                        path: 'quizId',
                                        populate: [
                                            { 
                                              path: 'questions.questionId',
                                              populate: {
                                                path: 'author'
                                              } 
                                            }, 
                                            { 
                                              path: 'author' 
                                            }
                                          ]
                                        }
                                      )
                                       .exec();
    const quizzes = fetched.map(doc => doc.quizId);
    const mappedQuizzes = quizzes.map(quiz => {
      const quizObject = quiz.toObject();
      const mappedQuestions = quizObject.questions.map(question => {
        var toObj = question.questionId;
        toObj.author = toObj.author.username;
        toObj.questionType = question.questionType;
        toObj.questionAttempts = question.questionAttempts;
        toObj.noOptions = question.noOptions;
        return toObj;
      });
      quizObject.questions = mappedQuestions;
      quizObject.author = quizObject.author.username;
      return quizObject;
    });
    console.log('Quizzes fetched successfully!');
    res.status(200).json({ quizzes: mappedQuizzes });
  } catch (error) {
    console.log('Unable to fetch quizzes');
    console.error(error);
    res.status(500).json({ message: 'Error fetching quizzes', error });
  }
});

// fetch quizzes created by user, limited to 50 for now
router.get('/quiz/fetchCreatedQuizzes', async (req, res) => {
  try {
    const username = req.query.username;

    // No user provided
    if (!username) {
      return res.status(400).json({ message: 'User not provided' });
    }

    // Checks for user
    const user = await User.findOne({ username: username }).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fetched = await Quiz.find({ author: user._id })
                              .sort({ dateCreated: -1 })
                              .limit(50)
                              .populate({
                                path: 'questions.questionId',
                                populate: {
                                  path: 'author',
                                }
                              })
                              .populate('author')
                              .exec();
    const quizzes = fetched.map(quiz => {
      const quizObject = quiz.toObject();
      const mappedQuestions = quizObject.questions.map(question => {
        var toObj = question.questionId;
        toObj.questionType = question.questionType;
        toObj.questionAttempts = question.questionAttempts;
        toObj.noOptions = question.noOptions;
        toObj.author = toObj.author.username;
        return toObj;
      });
      quizObject.questions = mappedQuestions;
      quizObject.author = quizObject.author.username;
      return quizObject;
    });
    console.log('Quizzes fetched successfully!');
    res.status(200).json({ quizzes: quizzes });
  } catch (error) {
    console.log('Unable to fetch quizzes');
    res.status(500).json({ message: 'Error fetching quizzes', error });
  }
});

// fetch all quizzes in the database, limited to 50 for now
router.get('/quiz/fetchAllQuizzes', async (req, res) => {
  try {
    const fetched = await Quiz.find({})
                              .sort({ dateCreated: -1 })
                              .limit(50)
                              .populate({
                                path: 'questions.questionId',
                                populate: {
                                  path: 'author',
                                }
                              })
                              .populate('author')
                              .exec();
    const quizzes = fetched.map(quiz => {
      const quizObject = quiz.toObject();
      const mappedQuestions = quizObject.questions.map(question => {
        var toObj = question.questionId;
        toObj.questionType = question.questionType;
        toObj.questionAttempts = question.questionAttempts;
        toObj.noOptions = question.noOptions;
        toObj.author = toObj.author.username;
        return toObj;
      });
      quizObject.questions = mappedQuestions;
      quizObject.author = quizObject.author.username;
      return quizObject;
    });
    console.log('Quizzes fetched successfully!');
    res.status(200).json({ quizzes: quizzes });
  } catch (error) {
    console.log('Unable to fetch quizzes');
    console.error(error);
    res.status(500).json({ message: 'Error fetching quizzes', error });
  }
});

// fetch all quiz matching criteria, limited to 20 for now
router.get('/quiz/fetchAllQuizMatchCriteria', async (req, res) => {
  try {
    const { title, topic, isVerified } = req.query;

    var query = {};

    // Checks validity of title and adds it to query
    if (title) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json('Invalid title');
      } 
      query.title = { $regex: title, $options: 'i' };
    }

    // Checks validity of topic and adds it to query
    if (topic) {
      if (typeof topic !== 'string' || topic.trim() === '') {
        return res.status(400).json('Invalid topic');
      } 
      query.topic = { $regex: `^${topic}$`, $options: 'i' };
    }

    // Checks validity of isVerified and adds it to query
    if (isVerified !== undefined && isVerified !== null) {
      if (typeof isVerified !== 'string' || isVerified.trim() === '' || (isVerified !== 'true' && isVerified !== 'false')) {
        return res.status(400).json('Invalid isVerified');
      } 
      query.isVerified = isVerified === 'true';
    }

    const fetched = await Quiz.find(query)
                              .sort({ dateSaved: -1 })
                              .limit(50)
                              .populate({
                                path: 'questions.questionId',
                                populate: {
                                  path: 'author',
                                }
                              })
                              .populate('author')
                              .exec();
    const quizzes = fetched.map(quiz => {
      const quizObject = quiz.toObject();
      const mappedQuestions = quizObject.questions.map(question => {
        var toObj = question.questionId;
        toObj.questionType = question.questionType;
        toObj.questionAttempts = question.questionAttempts;
        toObj.noOptions = question.noOptions;
        toObj.author = toObj.author.username;
        return toObj;
      });
      quizObject.questions = mappedQuestions;
      quizObject.author = quizObject.author.username;
      return quizObject;
    });
    console.log('Quizzes fetched successfully!');
    res.status(200).json({ quizzes: quizzes });
  } catch (error) {
    console.log('Unable to fetch quizzes');
    console.error(error);
    res.status(500).json({ message: 'Error fetching quizzes \n' + error.message, error });
  }
});

// rate quiz
router.post('/quiz/rateQuiz', async (req, res) => {
  try {
    const { rating, quizId } = req.body;

    if (!quizId) {
      return res.status(400).json({ message: 'quizId not provided' });
    }

    // Checks if ObjectIds are valid
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: 'Invalid quizId' });
    }
    
    // Checks for valid quiz
    const quiz = await Quiz.findById(quizId).exec();
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Checks for valid rating (0-5)
    if (!rating || typeof rating !== 'number' || isNaN(rating) || rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating' });
    }

    const currRating = quiz.rating;
    const currTimesRated = quiz.timesRated;
    quiz.rating = (currRating * currTimesRated + rating) / (currTimesRated + 1);
    quiz.timesRated = currTimesRated + 1;
    await quiz.save()
              .then(quiz => console.log(`Quiz ID: ${quizId} rated successfully`));
    res.status(200).json({ quiz: quizId });
  } catch (error) {
    console.log('Unable to rate quiz');
    res.status(500).json({ message: 'Error rating quiz', error });
  }
})

// submit taken quiz
router.post('/quiz/takeQuiz', async (req, res) => {
  try {
    const { username, quizId, score, breakdown } = req.body;

    // No user provided
    if (!username) {
      return res.status(400).json({ message: 'User not provided' });
    }

    // Checks for user
    const user = await User.findOne({ username: username }).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Checks for quizId
    if (!quizId) {
      return res.status(400).json({ message: 'quizId not provided' });
    }

    // Checks if quizId is valid
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: 'Invalid quizId' });
    }
    
    // Checks for valid quiz
    const quiz = await Quiz.findById(quizId).populate('questions.questionId').exec();
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Checks question breakdown
    if (!breakdown || !Array.isArray(breakdown) || breakdown.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Invalid breakdown' });
    }

    for (let i = 0; i < breakdown.length; i++) {
      const qn = breakdown[i];
      const fetchedQn = quiz.questions[i];

      // Checks for question
      if (!qn.question) {
        return res.status(400).json({ message: 'question not provided' });
      }

      // Checks for questionId
      if (!qn.question.questionId) {
        return res.status(400).json({ message: 'questionId not provided' });
      }

      // Checks for valid question
      if (qn.question.questionId !== fetchedQn.questionId._id.toString()) {
        return res.status(400).json({ message: 'Invalid questionId' });
      }

      // Checks for questionType
      if (!qn.question.questionType) {
        return res.status(400).json({ message: 'questionType not provided' });
      }

      // Checks for valid questionType
      if (qn.question.questionType !== fetchedQn.questionType) {
        return res.status(400).json({ message: 'Invalid questionType' });
      }

      // Checks validity of noAttempts, responses, isCorrect
      if (!qn.noAttempts || typeof qn.noAttempts !== 'number' || isNaN(qn.noAttempts) || qn.noAttempts > fetchedQn.questionAttempts) {
        return res.status(400).json({ message: 'Invalid noAttempts' });
      }

      if (!qn.responses || !Array.isArray(qn.responses) || qn.responses.length <= 0) {
        return res.status(400).json({ message: 'Invalid responses' });
      }

      if (qn.isCorrect === undefined || typeof qn.isCorrect !== 'boolean') {
        return res.status(400).json({ message: 'Invalid isCorrect' });
      }
    }

    // Checks for valid score
    if (score === undefined || typeof score !== 'number' || isNaN(score) || score < 0 || score > breakdown.length) {
      return res.status(400).json({ message: 'Invalid score' });
    }

    const takenQuiz = new UserTakenQuiz({
      userId: user._id,
      quizId: quizId,
      score: score,
      breakdown: breakdown
    });
    await takenQuiz.save()
                   .then(takenQuiz => console.log(`Quiz ID: ${ quizId } taken by User ${ username } successfully.`))
    res.status(201).json({ takenQuizId: takenQuiz._id });
  } catch (error) {
    console.log('Unable to submit taken quiz');
    res.status(500).json({ message: 'Error submitting taken quiz', error });
  }
});

// fetch all taken quizzes, limited to 20 for now
router.get('/quiz/fetchTakenQuizzes', async (req, res) => {
  try {
    const username = req.query.username;
    
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
    const fetched = await UserTakenQuiz.find({ userId: user._id })
                                       .sort({ dateTaken: -1 })
                                       .limit(50)
                                       .populate({
                                        path: 'quizId',
                                        populate: [
                                            { 
                                              path: 'questions.questionId',
                                              populate: {
                                                path: 'author'
                                              } 
                                            }, 
                                            { 
                                              path: 'author' 
                                            }
                                          ]
                                        }
                                      )
                                       .exec();

    const quizzes = fetched.map(doc => {
      const quiz = doc.quizId.toObject();
      quiz.score = doc.score;
      const mappedQuestions = quiz.questions.map(question => {
        var toObj = question.questionId;
        toObj.author = toObj.author.username;
        toObj.questionType = question.questionType;
        toObj.questionAttempts = question.questionAttempts;
        toObj.noOptions = question.noOptions;

        const matchingBreakdown = doc.breakdown.find(qn => qn.question.questionId.toString() === toObj._id.toString());
        toObj.noAttempts = matchingBreakdown.noAttempts;
        toObj.responses = matchingBreakdown.responses;
        toObj.isCorrect = matchingBreakdown.isCorrect;
        
        return toObj;
      });
      quiz.questions = mappedQuestions;
      quiz.author = quiz.author.username;
      return quiz;
    });
    console.log('Quizzes fetched successfully!');
    res.status(200).json({ quizzes: quizzes });
  } catch (error) {
    console.log('Unable to fetch taken quizzes');
    console.error(error);
    res.status(500).json({ message: 'Error fetching taken quizzes', error });
  }
})

module.exports = router;