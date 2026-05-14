const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.seed = async function (knex) {
  await knex('attempt_answers').del();
  await knex('quiz_attempts').del();
  await knex('question_options').del();
  await knex('questions').del();
  await knex('quizzes').del();
  await knex('class_students').del();
  await knex('classes').del();
  await knex('users').del();

  const password = await bcrypt.hash('password123', 12);

  const teacherId = uuidv4();
  const studentId = uuidv4();
  const classId = uuidv4();
  const quizId = uuidv4();

  await knex('users').insert([
    { id: teacherId, name: 'Dr. Smith', email: 'teacher@example.com', password, role: 'teacher' },
    { id: studentId, name: 'Alice Johnson', email: 'student@example.com', password, role: 'student' },
  ]);

  await knex('classes').insert({
    id: classId,
    name: 'Computer Science 101',
    description: 'Introduction to Computer Science',
    code: 'CS101ABC',
    teacher_id: teacherId,
  });

  await knex('class_students').insert({
    id: uuidv4(),
    class_id: classId,
    student_id: studentId,
  });

  await knex('quizzes').insert({
    id: quizId,
    title: 'Intro to Programming Quiz',
    description: 'Test your knowledge of basic programming concepts.',
    class_id: classId,
    teacher_id: teacherId,
    time_limit: 10,
    published: true,
  });

  const question1Id = uuidv4();
  const question2Id = uuidv4();

  await knex('questions').insert([
    {
      id: question1Id, quiz_id: quizId,
      question_text: 'What does HTML stand for?',
      question_type: 'multiple_choice', points: 2, sort_order: 0,
    },
    {
      id: question2Id, quiz_id: quizId,
      question_text: 'JavaScript is a compiled language.',
      question_type: 'true_false', points: 1, sort_order: 1,
    },
  ]);

  await knex('question_options').insert([
    { id: uuidv4(), question_id: question1Id, option_text: 'Hyper Text Markup Language', is_correct: true, sort_order: 0 },
    { id: uuidv4(), question_id: question1Id, option_text: 'High Tech Modern Language', is_correct: false, sort_order: 1 },
    { id: uuidv4(), question_id: question1Id, option_text: 'Hyper Transfer Markup Language', is_correct: false, sort_order: 2 },
    { id: uuidv4(), question_id: question1Id, option_text: 'Home Tool Markup Language', is_correct: false, sort_order: 3 },
    { id: uuidv4(), question_id: question2Id, option_text: 'True', is_correct: false, sort_order: 0 },
    { id: uuidv4(), question_id: question2Id, option_text: 'False', is_correct: true, sort_order: 1 },
  ]);
};
