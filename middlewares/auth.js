module.exports = {
    ensureAuthenticated: (req, res, next) => {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect('/users/login'); // Redirect to login page if not authenticated
    }
  };