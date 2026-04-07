const jwt = require('jsonwebtoken');
const { error } = require('../helpers/response');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json(error('NO_TOKEN', 'Authentication required'));
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.familyId = decoded.familyId;
    req.isParent = decoded.isParent || false;
    next();
  } catch {
    return res.status(401).json(error('INVALID_TOKEN', 'Invalid or expired token'));
  }
};

module.exports = auth;
