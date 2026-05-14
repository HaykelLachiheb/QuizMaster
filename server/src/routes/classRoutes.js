const { Router } = require('express');
const { create, list, getOne, join } = require('../controllers/classController');
const { authenticate, authorize } = require('../middleware/auth');
const { createClassRules, joinClassRules } = require('../middleware/validate');

const router = Router();

router.use(authenticate);

router.post('/', authorize('teacher'), createClassRules, create);
router.get('/', list);
router.get('/:id', getOne);
router.post('/join', authorize('student'), joinClassRules, join);

module.exports = router;
