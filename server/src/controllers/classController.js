const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { generateClassCode } = require('../utils/helpers');

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    let code;
    let exists = true;

    while (exists) {
      code = generateClassCode();
      const existing = await db('classes').where({ code }).first();
      exists = !!existing;
    }

    const classId = uuidv4();
    await db('classes').insert({
      id: classId,
      name,
      description,
      code,
      teacher_id: req.user.id,
    });
    const classroom = await db('classes').where({ id: classId }).first();

    res.status(201).json(classroom);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create class.' });
  }
};

exports.list = async (req, res) => {
  try {
    let classes;
    if (req.user.role === 'teacher') {
      classes = await db('classes')
        .where({ teacher_id: req.user.id })
        .select('*')
        .orderBy('created_at', 'desc');
    } else {
      classes = await db('classes')
        .join('class_students', 'classes.id', 'class_students.class_id')
        .where('class_students.student_id', req.user.id)
        .select('classes.*', 'class_students.joined_at')
        .orderBy('class_students.joined_at', 'desc');
    }
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch classes.' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const classroom = await db('classes').where({ id: req.params.id }).first();
    if (!classroom) return res.status(404).json({ error: 'Class not found.' });

    const students = await db('class_students')
      .join('users', 'class_students.student_id', 'users.id')
      .where('class_students.class_id', req.params.id)
      .select('users.id', 'users.name', 'users.email', 'class_students.joined_at');

    res.json({ ...classroom, students });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch class.' });
  }
};

exports.join = async (req, res) => {
  try {
    const { code } = req.body;
    const classroom = await db('classes').where({ code }).first();
    if (!classroom) return res.status(404).json({ error: 'Invalid class code.' });

    const existing = await db('class_students')
      .where({ class_id: classroom.id, student_id: req.user.id })
      .first();
    if (existing) return res.status(400).json({ error: 'Already joined.' });

    await db('class_students').insert({
      id: uuidv4(),
      class_id: classroom.id,
      student_id: req.user.id,
    });

    res.json({ message: 'Joined class successfully.', class: classroom });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join class.' });
  }
};
