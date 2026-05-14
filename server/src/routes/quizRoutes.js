const { Router } = require('express');
const {
  create, listByClass, getOne, update, delete: deleteQuiz,
  publish, submit, results, myResults,
} = require('../controllers/quizController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.post('/', authorize('teacher'), create);
router.get('/my-results', myResults);
router.get('/class/:classId', listByClass);
router.get('/:id', getOne);
router.put('/:id', authorize('teacher'), update);
router.delete('/:id', authorize('teacher'), deleteQuiz);
router.post('/:id/publish', authorize('teacher'), publish);
router.post('/:id/submit', authorize('student'), submit);
router.get('/:id/results', authorize('teacher'), results);

module.exports = router;
