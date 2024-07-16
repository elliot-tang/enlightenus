const express = require('express');
const request = require('supertest');
const authRouter = require('../../routes/auth');
const quizRouter = require('../../routes/quiz');

// Schema imports
const User = require('../../schema/user');
const { MCQ, OEQ } = require('../../schema/question');
const Quiz = require('../../schema/quiz');
const { UserSavedQuestion, UserSavedQuiz } = require('../../schema/usersavedquiz');
const UserTakenQuiz = require('../../schema/usertakenquiz');

const app = express();
app.use(express.json());
app.use('/', quizRouter);
app.use('/', authRouter);
app.use('/quiz', quizRouter);
app.use('/auth', authRouter);

// Creates a new user before testing
beforeAll(async () => {
  const userData = {
    email: 'jest@gmail.com',
    username: 'jest',
    password: 'password1'
  };
  await request(app).post('/auth/register').send(userData);
});

describe('Create MCQ', () => {
  it('Should return 201 with questionId', async () => {
    const questionData = {
      questionBody: 'Which Polish voivodeship is the most populous?',
      options: [
        {
          answer: 'Greater Poland Voivodeship'
        },
        {
          answer: 'Lesser Poland Voivodeship'
        },
        {
          answer: 'Masovian Voivodeship',
          isCorrect: true
        },
        {
          answer: 'Masurian Voivodeship'
        }
      ],
      author: 'jest',
      explainText: 'The Masovian Voivodeship contains the capital, Warsaw, and has a total of roughly 5.4 million people as of 2019.'
    };
    const response = await request(app).post('/quiz/createMCQ').send(questionData);

    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty('questionId');
    const objectIdPattern = /^[a-f\d]{24}$/i;
    expect(response.body.questionId).toMatch(objectIdPattern);
  });

  it('Should return 201 with questionId with no explainText', async () => {
    const questionData = {
      questionBody: 'Which Polish voivodeship is the most populous?',
      options: [
        {
          answer: 'Greater Poland Voivodeship'
        },
        {
          answer: 'Lesser Poland Voivodeship'
        },
        {
          answer: 'Masovian Voivodeship',
          isCorrect: true
        },
        {
          answer: 'Masurian Voivodeship'
        }
      ],
      author: 'jest',
    };
    const response = await request(app).post('/quiz/createMCQ').send(questionData);

    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty('questionId');
    const objectIdPattern = /^[a-f\d]{24}$/i;
    expect(response.body.questionId).toMatch(objectIdPattern);
  });

  it('Should return 201 with questionId with multiple correct options', async () => {
    const questionData = {
      questionBody: 'Out of the following city names, which are in the Polish language?',
      options: [
        {
          answer: 'Székesfehérvár'
        },
        {
          answer: 'Świętochłowice',
          isCorrect: true
        },
        {
          answer: 'Szczebrzeszyn',
          isCorrect: true
        },
        {
          answer: 'Stanisławów',
          isCorrect: true
        }
      ],
      author: 'jest'
    }
    const response = await request(app).post('/quiz/createMCQ').send(questionData);

    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty('questionId');
    const objectIdPattern = /^[a-f\d]{24}$/i;
    expect(response.body.questionId).toMatch(objectIdPattern);
  });

  it('Should return 400 with missing questionBody', async () => {
    const questionData = {
      options: [
        {
          answer: 'Greater Poland Voivodeship'
        },
        {
          answer: 'Lesser Poland Voivodeship'
        },
        {
          answer: 'Masovian Voivodeship',
          isCorrect: true
        },
        {
          answer: 'Masurian Voivodeship'
        }
      ],
      author: 'jest',
      explainText: 'The Masovian Voivodeship contains the capital, Warsaw, and has a total of roughly 5.4 million people as of 2019.'
    };
    const response = await request(app).post('/quiz/createMCQ').send(questionData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Please do not input an empty question body!');
  });

  it('Should return 400 with empty questionBody', async () => {
    const questionData = {
      questionBody: '              ',
      options: [
        {
          answer: 'Greater Poland Voivodeship'
        },
        {
          answer: 'Lesser Poland Voivodeship'
        },
        {
          answer: 'Masovian Voivodeship',
          isCorrect: true
        },
        {
          answer: 'Masurian Voivodeship'
        }
      ],
      author: 'jest',
      explainText: 'The Masovian Voivodeship contains the capital, Warsaw, and has a total of roughly 5.4 million people as of 2019.'
    };
    const response = await request(app).post('/quiz/createMCQ').send(questionData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Please do not input an empty question body!');
  });

  it('Should return 400 with missing options array', async () => {
    const questionData = {
      questionBody: 'Which Polish voivodeship is the most populous?',
      author: 'jest',
      explainText: 'The Masovian Voivodeship contains the capital, Warsaw, and has a total of roughly 5.4 million people as of 2019.'
    };
    const response = await request(app).post('/quiz/createMCQ').send(questionData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('You must have at least one answer option!');
  });

  it('Should return 400 with empty options array', async () => {
    const questionData = {
      questionBody: 'Which Polish voivodeship is the most populous?',
      options: [],
      author: 'jest',
      explainText: 'The Masovian Voivodeship contains the capital, Warsaw, and has a total of roughly 5.4 million people as of 2019.'
    };
    const response = await request(app).post('/quiz/createMCQ').send(questionData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('You must have at least one answer option!');
  });

  it('Should return 400 with duplicate answer options', async () => {
    const questionData = {
      questionBody: 'Which Polish voivodeship is the most populous?',
      options: [
        {
          answer: 'Greater Poland Voivodeship'
        },
        {
          answer: 'Greater Poland Voivodeship'
        },
        {
          answer: 'Masovian Voivodeship',
          isCorrect: true
        },
        {
          answer: 'Masurian Voivodeship'
        }
      ],
      author: 'jest',
      explainText: 'The Masovian Voivodeship contains the capital, Warsaw, and has a total of roughly 5.4 million people as of 2019.'
    };
    const response = await request(app).post('/quiz/createMCQ').send(questionData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Each answer option must be unique!');
  });

  it('Should return 400 with no correct options', async () => {
    const questionData = {
      questionBody: 'Which Polish voivodeship is the most populous?',
      options: [
        {
          answer: 'Greater Poland Voivodeship'
        },
        {
          answer: 'Lesser Poland Voivodeship'
        },
        {
          answer: 'Masovian Voivodeship'
        },
        {
          answer: 'Masurian Voivodeship'
        }
      ],
      author: 'jest',
      explainText: 'The Masovian Voivodeship contains the capital, Warsaw, and has a total of roughly 5.4 million people as of 2019.'
    };
    const response = await request(app).post('/quiz/createMCQ').send(questionData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('You must have at least one correct answer!');
  });

  it('Should return 400 with missing author', async () => {
    const questionData = {
      questionBody: 'Which Polish voivodeship is the most populous?',
      options: [
        {
          answer: 'Greater Poland Voivodeship'
        },
        {
          answer: 'Lesser Poland Voivodeship'
        },
        {
          answer: 'Masovian Voivodeship',
          isCorrect: true
        },
        {
          answer: 'Masurian Voivodeship'
        }
      ],
      explainText: 'The Masovian Voivodeship contains the capital, Warsaw, and has a total of roughly 5.4 million people as of 2019.'
    };
    const response = await request(app).post('/quiz/createMCQ').send(questionData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User not provided');
  });

  it('Should return 404 with invalid author', async () => {
    const questionData = {
      questionBody: 'Which Polish voivodeship is the most populous?',
      options: [
        {
          answer: 'Greater Poland Voivodeship'
        },
        {
          answer: 'Lesser Poland Voivodeship'
        },
        {
          answer: 'Masovian Voivodeship',
          isCorrect: true
        },
        {
          answer: 'Masurian Voivodeship'
        }
      ],
      author: 'jerrell',
      explainText: 'The Masovian Voivodeship contains the capital, Warsaw, and has a total of roughly 5.4 million people as of 2019.'
    };
    const response = await request(app).post('/quiz/createMCQ').send(questionData);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});

describe('Create OEQ', () => {
  it('Should return 201 with questionId', async () => {
    const questionData = {
      questionBody: 'What city has the second largest container port in Poland?',
      correctOptions: ['Gdynia'],
      author: 'jest',
      explainText: 'The nearby city of Gdańsk is the largest container port in Poland. Together with Sopot, they form the Trójmiasto/Trzëgard metropolitan area of Poland.'
    }
    const response = await request(app).post('/quiz/createOEQ').send(questionData);

    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty('questionId');
    const objectIdPattern = /^[a-f\d]{24}$/i;
    expect(response.body.questionId).toMatch(objectIdPattern);
  });

  it('Should return 201 with questionId with multiple correct answers', async () => {
    const questionData = {
      questionBody: 'What is the largest city on the Oder River? You may give either the former (pre-1945) name or the modern name.',
      correctOptions: ['Szczecin', 'Stettin'],
      author: 'jest',
      explainText: 'Stettin is the German name for the city, in common use in English until Szczecin was ceded to Poland in 1945 after WWII. Szczecin is now the 7th largest city in Poland with 391,566 inhabitants.'
    };
    const response = await request(app).post('/quiz/createOEQ').send(questionData);

    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty('questionId');
    const objectIdPattern = /^[a-f\d]{24}$/i;
    expect(response.body.questionId).toMatch(objectIdPattern);
  });

  it('Should return 201 with questionId with no explainText', async () => {
    const questionData = {
      questionBody: 'What is the largest city on the Oder River? You may give either the former (pre-1945) name or the modern name.',
      correctOptions: ['Szczecin', 'Stettin'],
      author: 'jest',
    };
    const response = await request(app).post('/quiz/createOEQ').send(questionData);

    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty('questionId');
    const objectIdPattern = /^[a-f\d]{24}$/i;
    expect(response.body.questionId).toMatch(objectIdPattern);
  });

  it('Should return 400 with missing questionBody', async () => {
    const questionData = {
      correctOptions: ['Szczecin', 'Stettin'],
      author: 'jest',
    };
    const response = await request(app).post('/quiz/createOEQ').send(questionData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Please do not input an empty question body!');
  });

  it('Should return 400 with empty questionBody', async () => {
    const questionData = {
      questionBody: '             ',
      correctOptions: ['Szczecin', 'Stettin'],
      author: 'jest',
    };
    const response = await request(app).post('/quiz/createOEQ').send(questionData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Please do not input an empty question body!');
  });

  it('Should return 400 with missing options array', async () => {
    const questionData = {
      questionBody: 'What is the largest city on the Oder River? You may give either the former (pre-1945) name or the modern name.',
      author: 'jest',
    };
    const response = await request(app).post('/quiz/createOEQ').send(questionData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('You must have at least one answer option!');
  });

  it('Should return 400 with empty options array', async () => {
    const questionData = {
      questionBody: 'What is the largest city on the Oder River? You may give either the former (pre-1945) name or the modern name.',
      correctOptions: [],
      author: 'jest',
    };
    const response = await request(app).post('/quiz/createOEQ').send(questionData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('You must have at least one answer option!');
  });

  it('Should return 400 with missing author', async () => {
    const questionData = {
      questionBody: 'What is the largest city on the Oder River? You may give either the former (pre-1945) name or the modern name.',
      correctOptions: ['Szczecin', 'Stettin']
    };
    const response = await request(app).post('/quiz/createOEQ').send(questionData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User not provided');
  });

  it('Should return 400 with invalid author', async () => {
    const questionData = {
      questionBody: 'What is the largest city on the Oder River? You may give either the former (pre-1945) name or the modern name.',
      correctOptions: ['Szczecin', 'Stettin'],
      author: 'jerrell'
    };
    const response = await request(app).post('/quiz/createOEQ').send(questionData);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});

describe('Save Question', () => {
  var questionId;

  beforeAll(async () => {
    // Creates the question
    const questionData = {
      questionBody: 'Which Polish voivodeship is the most populous?',
      options: [
        {
          answer: 'Greater Poland Voivodeship'
        },
        {
          answer: 'Lesser Poland Voivodeship'
        },
        {
          answer: 'Masovian Voivodeship',
          isCorrect: true
        },
        {
          answer: 'Masurian Voivodeship'
        }
      ],
      author: 'jest',
      explainText: 'The Masovian Voivodeship contains the capital, Warsaw, and has a total of roughly 5.4 million people as of 2019.'
    };
    const response = await request(app).post('/quiz/createMCQ').send(questionData);
    questionId = response.body.questionId;
  });

  it('Should return 201 with UserSavedQuestion ObjectId', async () => {
    const savedQuestionData = {
      username: 'jest',
      questionId: questionId
    }
    const response = await request(app).post('/quiz/saveQuestion').send(savedQuestionData);
    expect(response.status).toBe(201);
  });

  it('Should return 400 if user not provided', async () => {
    const savedQuestionData = {
      questionId: questionId
    }
    const response = await request(app).post('/quiz/saveQuestion').send(savedQuestionData);
    expect(response.status).toBe(400);
  });

  it('Should return 404 if invalid user provided', async () => {
    const savedQuestionData = {
      username: 'jerrell',
      questionId: questionId
    }
    const response = await request(app).post('/quiz/saveQuestion').send(savedQuestionData);
    expect(response.status).toBe(404);
  });

  it('Should return 400 if questionId not provided', async () => {
    const savedQuestionData = {
      username: 'jest'
    }
    const response = await request(app).post('/quiz/saveQuestion').send(savedQuestionData);
    expect(response.status).toBe(400);
  });

  it('Should return 400 if invalid questionId provided', async () => {
    const savedQuestionData = {
      username: 'jest',
      questionId: 'lol'
    }
    const response = await request(app).post('/quiz/saveQuestion').send(savedQuestionData);
    expect(response.status).toBe(400);
  });
})

describe('Fetch Saved Questions', () => {
  it('Should return 200 with questions', async () => {
    const response = await request(app).get('/quiz/fetchSavedQuestions').query({ username: 'jest' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('questions');
    expect(response.body.questions).toBeInstanceOf(Array);

    // Checks whether questions contains all the required fields
    const objectIdPattern = /^[a-f\d]{24}$/i;
    const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    response.body.questions.forEach(qn => {
      // Matches the compulsory fields
      expect(qn).toMatchObject({
        _id: expect.stringMatching(objectIdPattern),
        questionBody: expect.any(String),
        questionType: expect.stringMatching(/MCQ|OEQ/),
        author: expect.any(String),
        dateCreated: expect.stringMatching(datePattern)
      })

      // Matches the options array depending on type
      if (qn.questionType === 'MCQ') {
        expect(qn).toHaveProperty('options');
        expect(qn.options).toBeInstanceOf(Array);
        qn.options.forEach(option => {
          expect(option).toHaveProperty('answer');
          expect(typeof option.answer).toBe('string');

          if (option.hasOwnProperty('isCorrect')) {
            expect(typeof option.isCorrect).toBe('boolean');
          }
        });

        // Checks for at least 1 correct answer
        const hasCorrect = qn.options.some(opt => opt.isCorrect);
        expect(hasCorrect).toBe(true);
      } else {
        expect(qn).toHaveProperty('correctOptions');
        expect(qn.correctOptions).toBeInstanceOf(Array);
        qn.correctOptions.forEach(option => {
          expect(typeof option).toBe('string');
        });
      }

      // Checks for explainText
      if (qn.hasOwnProperty('explainText')) {
        expect(typeof qn.explainText).toBe('string');
      }
    })
  });

  it('Should return 400 if user not provided', async () => {
    const response = await request(app).get('/quiz/fetchSavedQuestions');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User not provided');
  });

  it('Should return 404 if invalid username provided', async () => {
    const response = await request(app).get('/quiz/fetchSavedQuestions').query({ username: 'jerrell' });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});

describe('Fetch Created Questions', () => {
  it('Should return 200 with questions', async () => {
    const response = await request(app).get('/quiz/fetchCreatedQuestions').query({ username: 'jest' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('questions');
    expect(response.body.questions).toBeInstanceOf(Array);

    // Checks whether questions contains all the required fields
    const objectIdPattern = /^[a-f\d]{24}$/i;
    const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    response.body.questions.forEach(qn => {
      // Matches the compulsory fields
      expect(qn).toMatchObject({
        _id: expect.stringMatching(objectIdPattern),
        questionBody: expect.any(String),
        questionType: expect.stringMatching(/MCQ|OEQ/),
        author: expect.any(String),
        dateCreated: expect.stringMatching(datePattern)
      })

      // Matches the options array depending on type
      if (qn.questionType === 'MCQ') {
        expect(qn).toHaveProperty('options');
        expect(qn.options).toBeInstanceOf(Array);
        qn.options.forEach(option => {
          expect(option).toHaveProperty('answer');
          expect(typeof option.answer).toBe('string');

          if (option.hasOwnProperty('isCorrect')) {
            expect(typeof option.isCorrect).toBe('boolean');
          }
        });

        // Checks for at least 1 correct answer
        const hasCorrect = qn.options.some(opt => opt.isCorrect);
        expect(hasCorrect).toBe(true);
      } else {
        expect(qn).toHaveProperty('correctOptions');
        expect(qn.correctOptions).toBeInstanceOf(Array);
        qn.correctOptions.forEach(option => {
          expect(typeof option).toBe('string');
        });
      }

      // Checks for explainText
      if (qn.hasOwnProperty('explainText')) {
        expect(typeof qn.explainText).toBe('string');
      }
    })
  });

  it('Should return 400 if user not provided', async () => {
    const response = await request(app).get('/quiz/fetchCreatedQuestions');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User not provided');
  });

  it('Should return 404 if invalid username provided', async () => {
    const response = await request(app).get('/quiz/fetchCreatedQuestions').query({ username: 'jerrell' });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});

describe('Fetch All Questions', () => {
  it('Should return 200 with questions', async () => {
    const response = await request(app).get('/quiz/fetchAllQuestions');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('questions');
    expect(response.body.questions).toBeInstanceOf(Array);

    // Checks whether questions contains all the required fields
    const objectIdPattern = /^[a-f\d]{24}$/i;
    const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    response.body.questions.forEach(qn => {
      // Matches the compulsory fields
      expect(qn).toMatchObject({
        _id: expect.stringMatching(objectIdPattern),
        questionBody: expect.any(String),
        questionType: expect.stringMatching(/MCQ|OEQ/),
        author: expect.any(String),
        dateCreated: expect.stringMatching(datePattern)
      })

      // Matches the options array depending on type
      if (qn.questionType === 'MCQ') {
        expect(qn).toHaveProperty('options');
        expect(qn.options).toBeInstanceOf(Array);
        qn.options.forEach(option => {
          expect(option).toHaveProperty('answer');
          expect(typeof option.answer).toBe('string');

          if (option.hasOwnProperty('isCorrect')) {
            expect(typeof option.isCorrect).toBe('boolean');
          }
        });

        // Checks for at least 1 correct answer
        const hasCorrect = qn.options.some(opt => opt.isCorrect);
        expect(hasCorrect).toBe(true);
      } else {
        expect(qn).toHaveProperty('correctOptions');
        expect(qn.correctOptions).toBeInstanceOf(Array);
        qn.correctOptions.forEach(option => {
          expect(typeof option).toBe('string');
        });
      }

      // Checks for explainText
      if (qn.hasOwnProperty('explainText')) {
        expect(typeof qn.explainText).toBe('string');
      }
    })
  });
});

describe('Create Quiz', () => {
  var MCQId;
  var OEQId;

  beforeAll(async () => {
    // Creates the questions
    const MCQData = {
      questionBody: 'Which Polish voivodeship is the most populous?',
      options: [
        {
          answer: 'Greater Poland Voivodeship'
        },
        {
          answer: 'Lesser Poland Voivodeship'
        },
        {
          answer: 'Masovian Voivodeship',
          isCorrect: true
        },
        {
          answer: 'Masurian Voivodeship'
        }
      ],
      author: 'jest',
      explainText: 'The Masovian Voivodeship contains the capital, Warsaw, and has a total of roughly 5.4 million people as of 2019.'
    };
    const MCQResponse = await request(app).post('/quiz/createMCQ').send(MCQData);
    MCQId = MCQResponse.body.questionId;

    const OEQData = {
      questionBody: 'What city has the second largest container port in Poland?',
      correctOptions: ['Gdynia'],
      author: 'jest',
      explainText: 'The nearby city of Gdańsk is the largest container port in Poland. Together with Sopot, they form the Trójmiasto/Trzëgard metropolitan area of Poland.'
    }
    const OEQResponse = await request(app).post('/quiz/createOEQ').send(OEQData);
    OEQId = OEQResponse.body.questionId;
  });

  it('Should return 201 with quizId', async () => {
    const quizData = {
      title: 'My Polish Geography Quiz',
      topic: 'Geography',
      author: 'jest',
      isVerified: false,
      questions: [
        {
          questionId: MCQId,
          questionType: 'MCQ',
          questionAttempts: 5,
          noOptions: 4
        },
        {
          questionId: OEQId,
          questionType: 'OEQ',
          questionAttempts: 5,
        }
      ]
    };
    const response = await request(app).post('/quiz/createQuiz').send(quizData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('quizId');
    const objectIdPattern = /^[a-f\d]{24}$/i;
    expect(response.body.quizId).toMatch(objectIdPattern);
  });

  it('Should return 400 if title not provided', async () => {
    const quizData = {
      topic: 'Geography',
      author: 'jest',
      isVerified: false,
      questions: [
        {
          questionId: MCQId,
          questionType: 'MCQ',
          questionAttempts: 5,
          noOptions: 4
        },
        {
          questionId: OEQId,
          questionType: 'OEQ',
          questionAttempts: 5,
        }
      ]
    };
    const response = await request(app).post('/quiz/createQuiz').send(quizData);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Please provide a quiz title!');
  });

  it('Should return 201 with "Uncategorised" as topic if topic not provided', async () => {
    const quizData = {
      title: 'My Polish Geography Quiz',
      author: 'jest',
      isVerified: false,
      questions: [
        {
          questionId: MCQId,
          questionType: 'MCQ',
          questionAttempts: 5,
          noOptions: 4
        },
        {
          questionId: OEQId,
          questionType: 'OEQ',
          questionAttempts: 5,
        }
      ]
    };
    const response = await request(app).post('/quiz/createQuiz').send(quizData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('quizId');
    const objectIdPattern = /^[a-f\d]{24}$/i;
    expect(response.body.quizId).toMatch(objectIdPattern);

    const quiz = await Quiz.findById(response.body.quizId);
    expect(quiz.topic).toBe('Uncategorised');
  });

  it('Should return 400 if user not provided', async () => {
    const quizData = {
      title: 'My Polish Geography Quiz',
      topic: 'Geography',
      isVerified: false,
      questions: [
        {
          questionId: MCQId,
          questionType: 'MCQ',
          questionAttempts: 5,
          noOptions: 4
        },
        {
          questionId: OEQId,
          questionType: 'OEQ',
          questionAttempts: 5,
        }
      ]
    };
    const response = await request(app).post('/quiz/createQuiz').send(quizData);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User not provided');
  });

  it('Should return 404 if invalid user provided', async () => {
    const quizData = {
      title: 'My Polish Geography Quiz',
      topic: 'Geography',
      author: 'jerrell',
      isVerified: false,
      questions: [
        {
          questionId: MCQId,
          questionType: 'MCQ',
          questionAttempts: 5,
          noOptions: 4
        },
        {
          questionId: OEQId,
          questionType: 'OEQ',
          questionAttempts: 5,
        }
      ]
    };
    const response = await request(app).post('/quiz/createQuiz').send(quizData);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('Should return 400 if questions array not provided', async () => {
    const quizData = {
      title: 'My Polish Geography Quiz',
      topic: 'Geography',
      author: 'jest',
      isVerified: false,
    };
    const response = await request(app).post('/quiz/createQuiz').send(quizData);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('You must have at least one question!');
  });

  it('Should return 400 if empty questions array provided', async () => {
    const quizData = {
      title: 'My Polish Geography Quiz',
      topic: 'Geography',
      author: 'jest',
      isVerified: false,
      questions: []
    };
    const response = await request(app).post('/quiz/createQuiz').send(quizData);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('You must have at least one question!');
  });

  it('Should return 400 if questionId not provided', async () => {
    const quizData = {
      title: 'My Polish Geography Quiz',
      topic: 'Geography',
      author: 'jest',
      isVerified: false,
      questions: [
        {
          questionType: 'MCQ',
          questionAttempts: 5,
          noOptions: 4
        },
        {
          questionId: OEQId,
          questionType: 'OEQ',
          questionAttempts: 5,
        }
      ]
    };
    const response = await request(app).post('/quiz/createQuiz').send(quizData);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('QuestionId not provided');
  });

  it('Should return 400 if invalid questionId provided', async () => {
    const quizData = {
      title: 'My Polish Geography Quiz',
      topic: 'Geography',
      author: 'jest',
      isVerified: false,
      questions: [
        {
          questionId: 'lol',
          questionType: 'MCQ',
          questionAttempts: 5,
          noOptions: 4
        },
        {
          questionId: OEQId,
          questionType: 'OEQ',
          questionAttempts: 5,
        }
      ]
    };
    const response = await request(app).post('/quiz/createQuiz').send(quizData);
    expect(response.status).toBe(400);
  });

  it('Should return 400 if questionType not provided', async () => {
    const quizData = {
      title: 'My Polish Geography Quiz',
      topic: 'Geography',
      author: 'jest',
      isVerified: false,
      questions: [
        {
          questionId: MCQId,
          questionAttempts: 5,
          noOptions: 4
        },
        {
          questionId: OEQId,
          questionType: 'OEQ',
          questionAttempts: 5,
        }
      ]
    };
    const response = await request(app).post('/quiz/createQuiz').send(quizData);
    expect(response.status).toBe(400);
  });

  it('Should return 400 if invalid questionType provided', async () => {
    const quizData = {
      title: 'My Polish Geography Quiz',
      topic: 'Geography',
      author: 'jest',
      isVerified: false,
      questions: [
        {
          questionId: MCQId,
          questionType: 'XDQ',
          questionAttempts: 5,
          noOptions: 4
        },
        {
          questionId: OEQId,
          questionType: 'OEQ',
          questionAttempts: 5,
        }
      ]
    };
    const response = await request(app).post('/quiz/createQuiz').send(quizData);
    expect(response.status).toBe(400);
  });
});

describe('Save Quiz', () => {
  var MCQId;
  var OEQId;
  var quizId;

  beforeAll(async () => {
    // Creates the questions
    const MCQData = {
      questionBody: 'Which Polish voivodeship is the most populous?',
      options: [
        {
          answer: 'Greater Poland Voivodeship'
        },
        {
          answer: 'Lesser Poland Voivodeship'
        },
        {
          answer: 'Masovian Voivodeship',
          isCorrect: true
        },
        {
          answer: 'Masurian Voivodeship'
        }
      ],
      author: 'jest',
      explainText: 'The Masovian Voivodeship contains the capital, Warsaw, and has a total of roughly 5.4 million people as of 2019.'
    };
    const MCQResponse = await request(app).post('/quiz/createMCQ').send(MCQData);
    MCQId = MCQResponse.body.questionId;

    const OEQData = {
      questionBody: 'What city has the second largest container port in Poland?',
      correctOptions: ['Gdynia'],
      author: 'jest',
      explainText: 'The nearby city of Gdańsk is the largest container port in Poland. Together with Sopot, they form the Trójmiasto/Trzëgard metropolitan area of Poland.'
    }
    const OEQResponse = await request(app).post('/quiz/createOEQ').send(OEQData);
    OEQId = OEQResponse.body.questionId;

    // Creates the Quiz
    const quizData = {
      title: 'My Polish Geography Quiz',
      topic: 'Geography',
      author: 'jest',
      isVerified: false,
      questions: [
        {
          questionId: MCQId,
          questionType: 'MCQ',
          questionAttempts: 5,
          noOptions: 4
        },
        {
          questionId: OEQId,
          questionType: 'OEQ',
          questionAttempts: 5,
        }
      ]
    };
    const response = await request(app).post('/quiz/createQuiz').send(quizData);
    quizId = response.body.quizId;
  });

  it('Should return 201 with UserSavedQuiz ObjectId', async () => {
    const savedQuizData = {
      username: 'jest',
      quizId: quizId
    };
    const response = await request(app).post('/quiz/saveQuiz').send(savedQuizData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('savedQuizId');
    const objectIdPattern = /^[a-f\d]{24}$/i;
    expect(response.body.savedQuizId).toMatch(objectIdPattern);
  });

  it('Should return 400 if user not provided', async () => {
    const savedQuizData = {
      quizId: quizId
    };
    const response = await request(app).post('/quiz/saveQuiz').send(savedQuizData);
    expect(response.status).toBe(400);
  });

  it('Should return 404 if invalid user provided', async () => {
    const savedQuizData = {
      username: 'jerrell',
      quizId: quizId
    };
    const response = await request(app).post('/quiz/saveQuiz').send(savedQuizData);
    expect(response.status).toBe(404);
  });

  it('Should return 400 if quizId not provided', async () => {
    const savedQuizData = {
      username: 'jest',
    };
    const response = await request(app).post('/quiz/saveQuiz').send(savedQuizData);
    expect(response.status).toBe(400);
  });

  it('Should return 400 if invalid quizId provided', async () => {
    const savedQuizData = {
      username: 'jest',
      quizId: 'lol'
    };
    const response = await request(app).post('/quiz/saveQuiz').send(savedQuizData);
    expect(response.status).toBe(400);
  });
});

describe('Fetch All Quizzes', () => {
  it('Should return 200 with all quizzes', async () => {
    const response = await request(app).get('/quiz/fetchAllQuizzes');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('quizzes');
    expect(response.body.quizzes).toBeInstanceOf(Array);

    // Checks whether quizzes contain all the required fields
    const objectIdPattern = /^[a-f\d]{24}$/i;
    const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    response.body.quizzes.forEach(quiz => {
      // Matches the compulsory fields
      expect(quiz).toMatchObject({
        _id: expect.stringMatching(objectIdPattern),
        title: expect.any(String),
        topic: expect.any(String),
        author: expect.any(String),
        rating: expect.any(Number),
        timesRated: expect.any(Number),
        timesTaken: expect.any(Number),
        isVerified: expect.any(Boolean),
        dateCreated: expect.stringMatching(datePattern)
      });

      // Checks the question array
      expect(quiz).toHaveProperty('questions');
      expect(quiz.questions).toBeInstanceOf(Array);
      quiz.questions.forEach(qn => {
        expect(qn).toMatchObject({
          _id: expect.stringMatching(objectIdPattern),
          questionBody: expect.any(String),
          questionType: expect.stringMatching(/MCQ|OEQ/),
          author: expect.any(String),
          dateCreated: expect.stringMatching(datePattern),
          questionAttempts: expect.any(Number),
          noOptions: expect.any(Number)
        })
  
        // Matches the options array depending on type
        if (qn.questionType === 'MCQ') {
          expect(qn).toHaveProperty('options');
          expect(qn.options).toBeInstanceOf(Array);
          qn.options.forEach(option => {
            expect(option).toHaveProperty('answer');
            expect(typeof option.answer).toBe('string');
  
            if (option.hasOwnProperty('isCorrect')) {
              expect(typeof option.isCorrect).toBe('boolean');
            }
          });
  
          // Checks for at least 1 correct answer
          const hasCorrect = qn.options.some(opt => opt.isCorrect);
          expect(hasCorrect).toBe(true);
        } else {
          expect(qn).toHaveProperty('correctOptions');
          expect(qn.correctOptions).toBeInstanceOf(Array);
          qn.correctOptions.forEach(option => {
            expect(typeof option).toBe('string');
          });
        }
  
        // Checks for explainText
        if (qn.hasOwnProperty('explainText')) {
          expect(typeof qn.explainText).toBe('string');
        }
      })
    })
  });
});

describe('Take Quiz', () => {
  var MCQId;
  var OEQId;
  var quizId;

  beforeAll(async () => {
    // Creates the questions
    const MCQData = {
      questionBody: 'Which Polish voivodeship is the most populous?',
      options: [
        {
          answer: 'Greater Poland Voivodeship'
        },
        {
          answer: 'Lesser Poland Voivodeship'
        },
        {
          answer: 'Masovian Voivodeship',
          isCorrect: true
        },
        {
          answer: 'Masurian Voivodeship'
        }
      ],
      author: 'jest',
      explainText: 'The Masovian Voivodeship contains the capital, Warsaw, and has a total of roughly 5.4 million people as of 2019.'
    };
    const MCQResponse = await request(app).post('/quiz/createMCQ').send(MCQData);
    MCQId = MCQResponse.body.questionId;

    const OEQData = {
      questionBody: 'What city has the second largest container port in Poland?',
      correctOptions: ['Gdynia'],
      author: 'jest',
      explainText: 'The nearby city of Gdańsk is the largest container port in Poland. Together with Sopot, they form the Trójmiasto/Trzëgard metropolitan area of Poland.'
    }
    const OEQResponse = await request(app).post('/quiz/createOEQ').send(OEQData);
    OEQId = OEQResponse.body.questionId;

    const quizData = {
      title: 'My Polish Geography Quiz',
      topic: 'Geography',
      author: 'jest',
      isVerified: false,
      questions: [
        {
          questionId: MCQId,
          questionType: 'MCQ',
          questionAttempts: 5,
          noOptions: 4
        },
        {
          questionId: OEQId,
          questionType: 'OEQ',
          questionAttempts: 5,
        }
      ]
    };
    const response = await request(app).post('/quiz/createQuiz').send(quizData);
    quizId = response.body.quizId;
  });

  it('Should return 201 with UserTakenQuiz ObjectID', async () => {
    const takenData = {
      username: 'jest',
      quizId: quizId,
      score: 2,
      breakdown: [
        {
          question: {
            questionId: MCQId,
            questionType: 'MCQ'
          },
          noAttempts: 5,
          responses: ['Masovian Voivodeship'],
          isCorrect: true
        },
        {
          question: {
            questionId: OEQId,
            questionType: 'OEQ'
          },
          noAttempts: 5,
          responses: ['Gdynia'],
          isCorrect: true
        },
      ]
    };
    const response = await request(app).post('/quiz/takeQuiz').send(takenData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('takenQuizId');
    const objectIdPattern = /^[a-f\d]{24}$/i;
    expect(response.body.takenQuizId).toMatch(objectIdPattern);
    
    // Check for change in test
  });

  it('Should return 400 if user not provided', async () => {
    const takenData = {
      quizId: quizId,
      score: 2,
      breakdown: [
        {
          question: {
            questionId: MCQId,
            questionType: 'MCQ'
          },
          noAttempts: 5,
          responses: ['Masovian Voivodeship'],
          isCorrect: true
        },
        {
          question: {
            questionId: OEQId,
            questionType: 'OEQ'
          },
          noAttempts: 5,
          responses: ['Gdynia'],
          isCorrect: true
        },
      ]
    };
    const response = await request(app).post('/quiz/takeQuiz').send(takenData);
    expect(response.status).toBe(400);
  });

  it('Should return 404 if invalid user provided', async () => {
    const takenData = {
      username: 'jerrell',
      quizId: quizId,
      score: 2,
      breakdown: [
        {
          question: {
            questionId: MCQId,
            questionType: 'MCQ'
          },
          noAttempts: 5,
          responses: ['Masovian Voivodeship'],
          isCorrect: true
        },
        {
          question: {
            questionId: OEQId,
            questionType: 'OEQ'
          },
          noAttempts: 5,
          responses: ['Gdynia'],
          isCorrect: true
        },
      ]
    };
    const response = await request(app).post('/quiz/takeQuiz').send(takenData);
    expect(response.status).toBe(404);
  });

  it('Should return 400 if quizId not provided', async () => {
    const takenData = {
      username: 'jest',
      score: 2,
      breakdown: [
        {
          question: {
            questionId: MCQId,
            questionType: 'MCQ'
          },
          noAttempts: 5,
          responses: ['Masovian Voivodeship'],
          isCorrect: true
        },
        {
          question: {
            questionId: OEQId,
            questionType: 'OEQ'
          },
          noAttempts: 5,
          responses: ['Gdynia'],
          isCorrect: true
        },
      ]
    };
    const response = await request(app).post('/quiz/takeQuiz').send(takenData);
    expect(response.status).toBe(400);
  });

  it('Should return 400 if invalid quizId provided', async () => {
    const takenData = {
      username: 'jest',
      quizId: 'lol',
      score: 2,
      breakdown: [
        {
          question: {
            questionId: MCQId,
            questionType: 'MCQ'
          },
          noAttempts: 5,
          responses: ['Masovian Voivodeship'],
          isCorrect: true
        },
        {
          question: {
            questionId: OEQId,
            questionType: 'OEQ'
          },
          noAttempts: 5,
          responses: ['Gdynia'],
          isCorrect: true
        },
      ]
    };
    const response = await request(app).post('/quiz/takeQuiz').send(takenData);
    expect(response.status).toBe(400);
  });

  // TODO: Test remaining validation
})