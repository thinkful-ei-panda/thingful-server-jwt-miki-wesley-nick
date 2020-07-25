const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';

  let bearerToken;

  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  } else {
    bearerToken = authToken.slice('bearer '.length, authToken.length);
  }

  try {
    const payload = jwt.verify(bearerToken, process.env.JWT_SECRET);

    req.app.get('db')('thingful_users').select('*').where({ user_name: payload.sub }).first()
      .then(user => {
        if (!user)
          return res.status(401).json({ error: 'Unauthorized request' });

        req.user = user;
        next();
      })
      .catch(err => {
        console.error(err);
        next(err);
      });

  } catch (error) {
    res.status(401).json({ error: 'Unauthorized request' });
  }

}

module.exports = {
  requireAuth,
};