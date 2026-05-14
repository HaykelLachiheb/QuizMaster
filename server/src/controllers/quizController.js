const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { calculateScore } = require('../utils/helpers');

exports.create = async (req, res) => {
  try {
    const { title, description, class_id, time_limit, questions } = req.body;

    const classroom = await db('classes').where({ id: class_id }).first();
    if (!classroom) return res.status(404).json({ error: 'Class not found.' });
    if (classroom.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your class.' });
    }

    const quizId = uuidv4();
    await db('quizzes').insert({
      id: quizId,
      title,
      description,
      class_id,
      teacher_id: req.user.id,
      time_limit: time_limit || 0,
    });

    if (questions && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionId = uuidv4();
        await db('questions').insert({
          id: questionId,
          quiz_id: quizId,
          question_text: q.question_text,
          question_type: q.question_type,
          points: q.points || 1,
          sort_order: i,
        });

        if (q.options && q.options.length > 0) {
          const options = q.options.map((opt, idx) => ({
            id: uuidv4(),
            question_id: questionId,
            option_text: opt.option_text,
            is_correct: opt.is_correct || false,
            sort_order: idx,
          }));
          await db('question_options').insert(options);
        }
      }
    }

    const fullQuiz = await exports.getFullQuiz(quizId);
    res.status(201).json(fullQuiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create quiz.' });
  }
};

exports.getFullQuiz = async (quizId) => {
  const quiz = await db('quizzes').where({ id: quizId }).first();
  if (!quiz) return null;

  const questions = await db('questions')
    .where({ quiz_id: quizId })
    .orderBy('sort_order');

  for (let question of questions) {
    question.options = await db('question_options')
      .where({ question_id: question.id })
      .orderBy('sort_order');
  }

  return { ...quiz, questions };
};

exports.listByClass = async (req, res) => {
  try {
    const quizzes = await db('quizzes')
      .where({ class_id: req.params.classId })
      .orderBy('created_at', 'desc');

    for (let quiz of quizzes) {
      const questionCount = await db('questions')
        .where({ quiz_id: quiz.id })
        .count('id as count')
        .first();
      quiz.question_count = parseInt(questionCount.count);
    }

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quizzes.' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const quiz = await exports.getFullQuiz(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    if (req.user.role === 'student') {
      quiz.questions = quiz.questions.map(q => ({
        ...q,
        options: q.options.map(o => ({
          id: o.id,
          option_text: o.option_text,
          sort_order: o.sort_order,
        })),
      }));
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, time_limit, published, questions } = req.body;
    const quiz = await db('quizzes').where({ id: req.params.id }).first();
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
    if (quiz.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your quiz.' });
    }

    await db('quizzes').where({ id: req.params.id }).update({
      title: title || quiz.title,
      description: description !== undefined ? description : quiz.description,
      time_limit: time_limit !== undefined ? time_limit : quiz.time_limit,
      published: published !== undefined ? published : quiz.published,
      updated_at: db.fn.now(),
    });

    if (questions) {
      const oldQuestions = await db('questions').where({ quiz_id: quiz.id });
      for (let oldQ of oldQuestions) {
        await db('question_options').where({ question_id: oldQ.id }).del();
      }
      await db('questions').where({ quiz_id: quiz.id }).del();

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionId = uuidv4();
        await db('questions').insert({
          id: questionId,
          quiz_id: quiz.id,
          question_text: q.question_text,
          question_type: q.question_type,
          points: q.points || 1,
          sort_order: i,
        });

        if (q.options && q.options.length > 0) {
          const options = q.options.map((opt, idx) => ({
            id: uuidv4(),
            question_id: questionId,
            option_text: opt.option_text,
            is_correct: opt.is_correct || false,
            sort_order: idx,
          }));
          await db('question_options').insert(options);
        }
      }
    }

    const updated = await exports.getFullQuiz(quiz.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update quiz.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const quiz = await db('quizzes').where({ id: req.params.id }).first();
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
    if (quiz.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your quiz.' });
    }

    await db('quizzes').where({ id: req.params.id }).del();
    res.json({ message: 'Quiz deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete quiz.' });
  }
};

exports.publish = async (req, res) => {
  try {
    const quiz = await db('quizzes').where({ id: req.params.id }).first();
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
    if (quiz.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your quiz.' });
    }

    const questionCount = await db('questions')
      .where({ quiz_id: quiz.id })
      .count('id as count')
      .first();

    if (parseInt(questionCount.count) === 0) {
      return res.status(400).json({ error: 'Cannot publish quiz with no questions.' });
    }

    await db('quizzes').where({ id: quiz.id }).update({ published: true });
    res.json({ message: 'Quiz published.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish quiz.' });
  }
};

exports.submit = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await exports.getFullQuiz(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    const existingAttempt = await db('quiz_attempts')
      .where({ quiz_id: quiz.id, student_id: req.user.id })
      .first();
    if (existingAttempt && existingAttempt.submitted_at) {
      return res.status(400).json({ error: 'Quiz already submitted.' });
    }

    const questionMap = {};
    const correctAnswers = {};
    quiz.questions.forEach(q => {
      questionMap[q.id] = q;
      const correctOption = q.options.find(o => o.is_correct);
      if (correctOption) correctAnswers[q.id] = correctOption.id;
    });

    const gradedAnswers = answers.map(a => {
      const correct = correctAnswers[a.question_id] === a.selected_option_id;
      const question = questionMap[a.question_id];
      return {
        question_id: a.question_id,
        selected_option_id: a.selected_option_id,
        is_correct: correct,
        points_earned: correct ? (question ? question.points : 0) : 0,
      };
    });

    const { score, totalPoints } = calculateScore(gradedAnswers, quiz.questions);

    let attempt;
    if (existingAttempt) {
      await db('quiz_attempts')
        .where({ id: existingAttempt.id })
        .update({ score, total_points: totalPoints, submitted_at: db.fn.now() });
      await db('attempt_answers').where({ attempt_id: existingAttempt.id }).del();
      attempt = existingAttempt;
    } else {
      const attemptId = uuidv4();
      await db('quiz_attempts').insert({
        id: attemptId,
        quiz_id: quiz.id,
        student_id: req.user.id,
        score,
        total_points: totalPoints,
        submitted_at: db.fn.now(),
      });
      attempt = { id: attemptId };
    }

    const attemptAnswers = gradedAnswers.map(ga => ({
      id: uuidv4(),
      ...ga,
      attempt_id: attempt.id,
    }));
    await db('attempt_answers').insert(attemptAnswers);

    res.json({ attempt_id: attempt.id, score, total_points: totalPoints });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit quiz.' });
  }
};

exports.results = async (req, res) => {
  try {
    const attempts = await db('quiz_attempts')
      .join('users', 'quiz_attempts.student_id', 'users.id')
      .where('quiz_attempts.quiz_id', req.params.id)
      .whereNotNull('quiz_attempts.submitted_at')
      .select(
        'quiz_attempts.id',
        'quiz_attempts.score',
        'quiz_attempts.total_points',
        'quiz_attempts.submitted_at',
        'users.id as student_id',
        'users.name as student_name',
        'users.email as student_email'
      )
      .orderBy('quiz_attempts.score', 'desc');

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results.' });
  }
};

exports.myResults = async (req, res) => {
  try {
    const attempts = await db('quiz_attempts')
      .join('quizzes', 'quiz_attempts.quiz_id', 'quizzes.id')
      .join('classes', 'quizzes.class_id', 'classes.id')
      .where('quiz_attempts.student_id', req.user.id)
      .whereNotNull('quiz_attempts.submitted_at')
      .select(
        'quiz_attempts.id',
        'quiz_attempts.score',
        'quiz_attempts.total_points',
        'quiz_attempts.submitted_at',
        'quizzes.id as quiz_id',
        'quizzes.title as quiz_title',
        'classes.id as class_id',
        'classes.name as class_name'
      )
      .orderBy('quiz_attempts.submitted_at', 'desc');

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results.' });
  }
};
