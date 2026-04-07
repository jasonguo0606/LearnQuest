const { error } = require('../helpers/response');

const parent = (req, res, next) => {
  if (!req.isParent) {
    return res.status(403).json(error('NOT_PARENT', 'Parent permission required'));
  }
  next();
};

module.exports = parent;
