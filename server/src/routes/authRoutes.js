const { Router } = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { registerRules, loginRules } = require('../middleware/validate');

const router = Router();

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.get('/me', authenticate, getMe);

module.exports = router;
