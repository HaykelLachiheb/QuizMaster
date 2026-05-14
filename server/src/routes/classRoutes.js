const { Router } = require('express');
const { create, list, getOne, join } = require('../controllers/classController');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.post('/', authorize('teacher'), create);
router.get('/', list);
router.get('/:id', getOne);
router.post('/join', authorize('student'), join);

module.exports = router;
