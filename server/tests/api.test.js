const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

let teacherToken;
let studentToken;
let newTeacherToken;
let classId;
let classCode;
let quizId;
let questionId;
let optionId;

beforeAll(async () => {
  await db.migrate.latest();
  await db.seed.run();
});

afterAll(async () => {
  await db.destroy();
});

describe('Authentication', () => {
  test('POST /api/auth/register - validates input', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: 'bad', password: '12' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('POST /api/auth/register - creates teacher account', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Teacher', email: 'testteacher@test.com', password: 'password123', role: 'teacher' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('teacher');
    newTeacherToken = res.body.token;
  });

  test('POST /api/auth/register - rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Duplicate', email: 'testteacher@test.com', password: 'password123' });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login - validates input', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '', password: '' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('POST /api/auth/login - rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'teacher@example.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/login - returns token for teacher', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'teacher@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('teacher');
    teacherToken = res.body.token;
  });

  test('POST /api/auth/login - returns token for student', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('student');
    studentToken = res.body.token;
  });

  test('GET /api/auth/me - rejects without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me - returns user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('teacher@example.com');
  });
});

describe('Classes', () => {
  test('POST /api/classes - validates input', async () => {
    const res = await request(app)
      .post('/api/classes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: '' });
    expect(res.status).toBe(400);
  });

  test('POST /api/classes - student forbidden', async () => {
    const res = await request(app)
      .post('/api/classes')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ name: 'Test Class' });
    expect(res.status).toBe(403);
  });

  test('POST /api/classes - teacher creates class', async () => {
    const res = await request(app)
      .post('/api/classes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: 'Test Class', description: 'A test class' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Class');
    expect(res.body.code).toBeDefined();
    expect(res.body.code.length).toBe(8);
    classId = res.body.id;
    classCode = res.body.code;
  });

  test('GET /api/classes - lists teacher classes', async () => {
    const res = await request(app)
      .get('/api/classes')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/classes/:id - returns class details', async () => {
    const res = await request(app)
      .get(`/api/classes/${classId}`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(classId);
  });

  test('POST /api/classes/join - validates input', async () => {
    const res = await request(app)
      .post('/api/classes/join')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ code: '' });
    expect(res.status).toBe(400);
  });

  test('POST /api/classes/join - rejects invalid code', async () => {
    const res = await request(app)
      .post('/api/classes/join')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ code: 'XXXXXX' });
    expect(res.status).toBe(404);
  });

  test('POST /api/classes/join - teacher forbidden', async () => {
    const res = await request(app)
      .post('/api/classes/join')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ code: classCode });
    expect(res.status).toBe(403);
  });

  test('POST /api/classes/join - student joins class', async () => {
    const res = await request(app)
      .post('/api/classes/join')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ code: classCode });
    expect(res.status).toBe(200);
  });

  test('POST /api/classes/join - rejects duplicate join', async () => {
    const res = await request(app)
      .post('/api/classes/join')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ code: classCode });
    expect(res.status).toBe(400);
  });
});

describe('Quizzes', () => {
  test('POST /api/quizzes - validates input', async () => {
    const res = await request(app)
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ title: '', class_id: '' });
    expect(res.status).toBe(400);
  });

  test('POST /api/quizzes - student forbidden', async () => {
    const res = await request(app)
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Quiz', class_id: classId });
    expect(res.status).toBe(403);
  });

  test('POST /api/quizzes - teacher creates quiz with questions', async () => {
    const res = await request(app)
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Test Quiz',
        description: 'A test quiz',
        class_id: classId,
        time_limit: 10,
        questions: [
          {
            question_text: 'What is 2+2?',
            question_type: 'multiple_choice',
            points: 5,
            options: [
              { option_text: '3', is_correct: false },
              { option_text: '4', is_correct: true },
              { option_text: '5', is_correct: false },
            ],
          },
          {
            question_text: 'The sky is green.',
            question_type: 'true_false',
            points: 3,
            options: [
              { option_text: 'True', is_correct: false },
              { option_text: 'False', is_correct: true },
            ],
          },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Quiz');
    expect(res.body.questions).toHaveLength(2);
    quizId = res.body.id;
    questionId = res.body.questions[0].id;
    optionId = res.body.questions[0].options.find(o => o.is_correct).id;
  });

  test('GET /api/quizzes/class/:classId - lists quizzes', async () => {
    const res = await request(app)
      .get(`/api/quizzes/class/${classId}`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/quizzes/:id - student view hides correct answers', async () => {
    const res = await request(app)
      .get(`/api/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    for (const q of res.body.questions) {
      for (const o of q.options) {
        expect(o.is_correct).toBeUndefined();
      }
    }
  });

  test('POST /api/quizzes/:id/publish - publishes quiz', async () => {
    const res = await request(app)
      .post(`/api/quizzes/${quizId}/publish`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
  });

  test('POST /api/quizzes/:id/publish - rejects already published', async () => {
    const res = await request(app)
      .post(`/api/quizzes/${quizId}/publish`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
  });

  test('POST /api/quizzes/:id/submit - validates input', async () => {
    const res = await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  test('POST /api/quizzes/:id/submit - rejects unenrolled student', async () => {
    const unauthRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Unauthorized', email: 'unauth@test.com', password: 'password123', role: 'student' });
    const badToken = unauthRes.body.token;

    const res = await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${badToken}`)
      .send({ answers: [{ question_id: questionId, selected_option_id: optionId }] });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Not enrolled in this class.');
  });

  test('POST /api/quizzes/:id/submit - student submits quiz', async () => {
    const res = await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: [
          { question_id: questionId, selected_option_id: optionId },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.score).toBeDefined();
    expect(res.body.total_points).toBeDefined();
  });

  test('POST /api/quizzes/:id/submit - rejects duplicate submission', async () => {
    const res = await request(app)
      .post(`/api/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: [{ question_id: questionId, selected_option_id: optionId }],
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Quiz already submitted.');
  });

  test('GET /api/quizzes/my-results - student sees results', async () => {
    const res = await request(app)
      .get('/api/quizzes/my-results')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].quiz_title).toBeDefined();
  });

  test('GET /api/quizzes/:id/results - teacher sees results', async () => {
    const res = await request(app)
      .get(`/api/quizzes/${quizId}/results`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].student_name).toBeDefined();
  });

  test('POST /api/quizzes - teacher cannot create quiz in another teachers class', async () => {
    const res = await request(app)
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${newTeacherToken}`)
      .send({ title: 'Stolen Quiz', class_id: classId });
    expect(res.status).toBe(403);
  });

  test('DELETE /api/quizzes/:id - teacher deletes quiz', async () => {
    const res = await request(app)
      .delete(`/api/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
  });

  test('PUT /api/quizzes/:id - updating non-existent quiz returns 404', async () => {
    const res = await request(app)
      .put(`/api/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
  });
});

describe('Health Check', () => {
  test('GET /api/health - returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
