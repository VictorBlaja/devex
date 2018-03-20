
// /**
//  * Module dependencies
//  */
var adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller');

module.exports = function (app) {
  // User route registration first. Ref: #713
  require('./users.server.routes.js')(app);

  // Users collection routes
  app.route('/api/users')
    .get(adminPolicy.isAllowed, admin.list);
  app.route('/api/users/registrations')
    .get(adminPolicy.isAllowed, admin.registrations);

  app.route ('/api/listopps').get(adminPolicy.isAllowed, admin.notifyOpportunities);
  app.route ('/api/listmeets').get(adminPolicy.isAllowed, admin.notifyMeetings);

  // Gov. Request
  app.route('/api/approve').post(adminPolicy.isAllowed,admin.approve);

  // Single user routes
  app.route('/api/users/:userId')
    .get(adminPolicy.isAllowed, admin.read)
    .put(adminPolicy.isAllowed, admin.update)
    .delete(adminPolicy.isAllowed, admin.delete);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
