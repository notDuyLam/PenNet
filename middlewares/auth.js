module.exports = {
    ensureAuthenticated: (req, res, next) => {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect('/users/login'); // Redirect to login page if not authenticated
    },
    checkBan: (req, res, next) => {
      if (req.user && req.user.isBanned) {
        return res.redirect('/ban'); // Redirect to ban page if user is banned
      }
      next();
    },
  };