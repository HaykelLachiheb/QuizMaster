const crypto = require('crypto');

function generateClassCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 8);
}

function calculateScore(answers, questions) {
  const questionMap = {};
  questions.forEach(q => { questionMap[q.id] = q; });

  let score = 0;
  let totalPoints = 0;

  answers.forEach(answer => {
    const question = questionMap[answer.question_id];
    if (question) {
      totalPoints += question.points;
      if (answer.is_correct) {
        score += question.points;
      }
    }
  });

  return { score, totalPoints };
}

module.exports = { generateClassCode, calculateScore };
