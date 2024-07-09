const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  questions: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, refPath: 'questions.questionType', required: true },
    questionType: { type: String, required: true, enum: ['MCQ', 'OEQ'], },
    questionAttempts: { type: Number, required: true, default: 1, },
    noOptions: { type: Number, required: true, },
  }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
  rating: { type: Number, required: true, default: 0 },
  timesRated: { type: Number, required: true, default: 0 },
  timesTaken: { type: Number, required: true, default: 0 },
  isVerified: { type: Boolean, required: true, default: false },
  dateCreated: { type: Date, default: Date.now, immutable: true, },
});

// Ensures questions have unique questionIds
QuizSchema.path('questions').validate(function (questions) {
  const questionIds = questions.map(q => q.questionId.toString());
  const uniqueQuestionIds = new Set(questionIds);
  return questionIds.length === uniqueQuestionIds.size;
}, 'Quiz cannot contain the same question multiple times.');

// Ensures correct capitalisation of quiz topic upon fetching
const capitaliseTopicFindOne = async function(doc, next) {
  if (doc && (doc.topic.charAt(0) < 'A' || doc.topic.charAt(0) > 'Z')) {
    console.log(`Capitalising quiz topic of quizId: ${doc._id}`);
    doc.topic = doc.topic.charAt(0).toUpperCase() + doc.topic.slice(1).toLowerCase();
    await doc.save().then(doc => console.log(`Quiz ID: ${doc._id} updated with topic: ${doc.topic}`))
                    .catch(error => console.log(error));
  }
  next();
}
QuizSchema.post('findOne', capitaliseTopicFindOne);

const capitaliseTopic = async function(docs, next) {
  const updates = [];

  docs.forEach(doc => {
    if ((doc.topic.charAt(0) < 'A' || doc.topic.charAt(0) > 'Z')) {
      console.log(`Capitalising quiz topic of quizId; ${doc._id}`);
      doc.topic = doc.topic.charAt(0).toUpperCase() + doc.topic.slice(1).toLowerCase();
      updates.push(doc.save().then(doc => {
        console.log(`Quiz with id: ${doc._id} saved with topic: ${doc.topic}`);
        return doc;
      }).catch(error => console.error(error)));
    }
  });

  if (updates.length > 0) {
    await Promise.all(updates);
  };

  next();
};
QuizSchema.post('find', capitaliseTopic);

const Quiz = mongoose.model('Quiz', QuizSchema);
module.exports = Quiz;