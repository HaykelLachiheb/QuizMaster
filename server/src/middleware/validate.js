const { body, validationResult } = require('express-validator');

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role').optional().isIn(['student', 'teacher']).withMessage('Role must be student or teacher.'),
  handleErrors,
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
  handleErrors,
];

const createClassRules = [
  body('name').trim().notEmpty().withMessage('Class name is required.'),
  handleErrors,
];

const joinClassRules = [
  body('code').trim().notEmpty().withMessage('Class code is required.'),
  handleErrors,
];

const createQuizRules = [
  body('title').trim().notEmpty().withMessage('Quiz title is required.'),
  body('class_id').notEmpty().withMessage('Class ID is required.'),
  handleErrors,
];

const submitQuizRules = [
  body('answers').isArray({ min: 1 }).withMessage('Answers array is required.'),
  body('answers.*.question_id').notEmpty().withMessage('Question ID is required for each answer.'),
  body('answers.*.selected_option_id').notEmpty().withMessage('Selected option ID is required for each answer.'),
  handleErrors,
];

module.exports = {
  registerRules,
  loginRules,
  createClassRules,
  joinClassRules,
  createQuizRules,
  submitQuizRules,
};
