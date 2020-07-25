const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');

describe('Auth Endpoints', function () {
  let db;

  const {
    testThings,
    testUsers,
  } = helpers.makeThingsFixtures();

  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  beforeEach(() =>
    helpers.seedThingsTables(db, testUsers, testThings)
  );

  // no user
  // no password
  // invalid user
  // invalid password
  // token


  const requiredFields = ['user_name', 'password'];

  requiredFields.forEach(field => {
    const loginAttemptBody = {
      user_name: testUser.user_name,
      password: testUser.password,
    };
    delete loginAttemptBody[field];

    it(`responds with 400 when ${field} is missing`, () => {
      return supertest(app)
        .post('/api/auth/login')
        .send(loginAttemptBody)
        .expect(400, { error: `Missing '${field}' in request body` });

    });
  });

  it('responds with 401 when invalid user_name', () => {
    const badUserName = { user_name: 'bad-user-name', password: 'bad-password' };

    return supertest(app)
      .post('/api/auth/login')
      .send(badUserName)
      .expect(400, { error: 'Invalid username or password' });
  });

  it('responds with 401 when invalid password', () => {
    const badPassword = { user_name: testUser.user_name, password: 'bad-password' };

    return supertest(app)
      .post('/api/auth/login')
      .send(badPassword)
      .expect(400, { error: 'Invalid username or password' });
  });

  it('responds with 200 and a token', () => {
    const expectedToken = jwt.sign({ user_id: testUser.id }, process.env.JWT_SECRET, { subject: testUser.user_name });
    return supertest(app)
      .post('/api/auth/login')
      .send(testUser)
      .expect(200, { authToken: expectedToken });
  });

});