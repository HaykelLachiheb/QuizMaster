exports.up = function (knex) {
  const isSQLite = knex.client.config.client === 'better-sqlite3';

  if (isSQLite) {
    return knex.schema
      .createTable('users', (table) => {
        table.text('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('role').notNullable().defaultTo('student');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      })
      .createTable('classes', (table) => {
        table.text('id').primary();
        table.string('name').notNullable();
        table.text('description');
        table.string('code').notNullable().unique();
        table.text('teacher_id').references('id').inTable('users').onDelete('CASCADE');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      })
      .createTable('class_students', (table) => {
        table.text('id').primary();
        table.text('class_id').references('id').inTable('classes').onDelete('CASCADE');
        table.text('student_id').references('id').inTable('users').onDelete('CASCADE');
        table.timestamp('joined_at').defaultTo(knex.fn.now());
        table.unique(['class_id', 'student_id']);
      })
      .createTable('quizzes', (table) => {
        table.text('id').primary();
        table.string('title').notNullable();
        table.text('description');
        table.text('class_id').references('id').inTable('classes').onDelete('CASCADE');
        table.text('teacher_id').references('id').inTable('users').onDelete('CASCADE');
        table.integer('time_limit').defaultTo(0);
        table.boolean('published').defaultTo(false);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      })
      .createTable('questions', (table) => {
        table.text('id').primary();
        table.text('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE');
        table.text('question_text').notNullable();
        table.string('question_type').notNullable();
        table.integer('points').defaultTo(1);
        table.integer('sort_order').defaultTo(0);
        table.timestamp('created_at').defaultTo(knex.fn.now());
      })
      .createTable('question_options', (table) => {
        table.text('id').primary();
        table.text('question_id').references('id').inTable('questions').onDelete('CASCADE');
        table.text('option_text').notNullable();
        table.boolean('is_correct').defaultTo(false);
        table.integer('sort_order').defaultTo(0);
      })
      .createTable('quiz_attempts', (table) => {
        table.text('id').primary();
        table.text('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE');
        table.text('student_id').references('id').inTable('users').onDelete('CASCADE');
        table.timestamp('started_at').defaultTo(knex.fn.now());
        table.timestamp('submitted_at');
        table.integer('score').defaultTo(0);
        table.integer('total_points').defaultTo(0);
        table.unique(['quiz_id', 'student_id']);
      })
      .createTable('attempt_answers', (table) => {
        table.text('id').primary();
        table.text('attempt_id').references('id').inTable('quiz_attempts').onDelete('CASCADE');
        table.text('question_id').references('id').inTable('questions').onDelete('CASCADE');
        table.text('selected_option_id').references('id').inTable('question_options');
        table.boolean('is_correct');
        table.integer('points_earned').defaultTo(0);
      });
  }

  return knex.schema
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.string('password').notNullable();
      table.string('role').notNullable().defaultTo('student');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('classes', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.text('description');
      table.string('code').notNullable().unique();
      table.uuid('teacher_id').references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('class_students', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('class_id').references('id').inTable('classes').onDelete('CASCADE');
      table.uuid('student_id').references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('joined_at').defaultTo(knex.fn.now());
      table.unique(['class_id', 'student_id']);
    })
    .createTable('quizzes', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('title').notNullable();
      table.text('description');
      table.uuid('class_id').references('id').inTable('classes').onDelete('CASCADE');
      table.uuid('teacher_id').references('id').inTable('users').onDelete('CASCADE');
      table.integer('time_limit').defaultTo(0);
      table.boolean('published').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('questions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE');
      table.text('question_text').notNullable();
      table.string('question_type').notNullable();
      table.integer('points').defaultTo(1);
      table.integer('sort_order').defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('question_options', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('question_id').references('id').inTable('questions').onDelete('CASCADE');
      table.text('option_text').notNullable();
      table.boolean('is_correct').defaultTo(false);
      table.integer('sort_order').defaultTo(0);
    })
    .createTable('quiz_attempts', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE');
      table.uuid('student_id').references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('started_at').defaultTo(knex.fn.now());
      table.timestamp('submitted_at');
      table.integer('score').defaultTo(0);
      table.integer('total_points').defaultTo(0);
      table.unique(['quiz_id', 'student_id']);
    })
    .createTable('attempt_answers', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('attempt_id').references('id').inTable('quiz_attempts').onDelete('CASCADE');
      table.uuid('question_id').references('id').inTable('questions').onDelete('CASCADE');
      table.uuid('selected_option_id').references('id').inTable('question_options');
      table.boolean('is_correct');
      table.integer('points_earned').defaultTo(0);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('attempt_answers')
    .dropTableIfExists('quiz_attempts')
    .dropTableIfExists('question_options')
    .dropTableIfExists('questions')
    .dropTableIfExists('quizzes')
    .dropTableIfExists('class_students')
    .dropTableIfExists('classes')
    .dropTableIfExists('users');
};
