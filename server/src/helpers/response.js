const success = (data) => ({
  success: true,
  data,
  error: null,
});

const error = (code, message) => ({
  success: false,
  data: null,
  error: { code, message },
});

module.exports = { success, error };
