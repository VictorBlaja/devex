'use strict';
/*

Notes about programs

Roles:
------
Membership in a program is defined by the user having various roles attached to their
user record. There are only three possible states: admin, member, or request.
When a user requests membership they get the request role only, once accepted that
simply gets changed to the member role. Roles are simply the program code with suffixes.

member  : <code>
admin   : <code>-admin
request : <code>-request

*/

'use strict';


/**
 * Module dependencies
 */
var path = require('path'),
	mongoose = require('mongoose'),
	Program = mongoose.model('Program'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	helpers = require(path.resolve('./modules/core/server/controllers/core.server.helpers')),
	_ = require('lodash')
	;

// -------------------------------------------------------------------------
//
// set a program role on a user
//
// -------------------------------------------------------------------------
var adminRole = function (program) {
	return program.code+'-admin';
};
var memberRole = function (program) {
	return program.code;
};
var requestRole = function (program) {
	return program.code+'-request';
};
var setProgramMember = function (program, user) {
	user.addRoles ([memberRole(program)]);
};
var setProgramAdmin = function (program, user) {
	user.addRoles ([memberRole(program), adminRole(program)]);
};
var setProgramRequest = function (program, user) {
	user.addRoles ([requestRole(program)]);
};
var unsetProgramMember = function (program, user) {
	user.removeRoles ([memberRole(program)]);
};
var unsetProgramAdmin = function (program, user) {
	user.removeRoles ([memberRole(program), adminRole(program)]);
};
var unsetProgramRequest = function (program, user) {
	console.log ('remove role ', requestRole(program));
	user.removeRoles ([requestRole(program)]);
};
var ensureAdmin = function (program, user, res) {
	if (!~user.roles.indexOf (adminRole(program)) && !~user.roles.indexOf ('admin')) {
		console.log ('NOT admin');
		res.status(422).send({
			message: 'User Not Authorized'
		});
		return false;
	} else {
		console.log ('Is admin');
		return true;
	}
};
// -------------------------------------------------------------------------
//
// this takes a program model, serializes it, and decorates it with what
// relationship the user has to the program, and returns the JSON
//
// -------------------------------------------------------------------------
var decorate = function (programModel, roles) {
	var program = programModel ? programModel.toJSON () : {};
	program.userIs = {
		admin   : !!~roles.indexOf (adminRole(program)) || !!~roles.indexOf ('admin'),
		member  : !!~roles.indexOf (memberRole(program)),
		request : !!~roles.indexOf (requestRole(program)),
		gov     : !!~roles.indexOf ('gov')
	};
	return program;
};
// -------------------------------------------------------------------------
//
// decorate an entire list of programs
//
// -------------------------------------------------------------------------
var decorateList = function (programModels, roles) {
	return programModels.map (function (programModel) {
		return decorate (programModel, roles);
	});
};
// -------------------------------------------------------------------------
//
// get a list of all my programs, but only ones I have access to as a normal
// member or admin, just not as request
//
// -------------------------------------------------------------------------
exports.my = function (req, res) {
	var me = helpers.myStuff (req.user.roles);
	var search = me.isAdmin ? {} : { code: { $in: me.programs.member } };
	Program.find (search)
	.select ('code title short')
	.exec (function (err, programs) {
		if (err) {
			return res.status(422).send ({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json (programs);
		}
	});
};
exports.myadmin = function (req, res) {
	var me = helpers.myStuff (req.user.roles);
	var search = me.isAdmin ? {} : { code: { $in: me.programs.admin } };
	Program.find (search)
	.select ('code title short')
	.exec (function (err, programs) {
		if (err) {
			return res.status(422).send ({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json (programs);
		}
	});
};
// -------------------------------------------------------------------------
//
// return a list of all program members. this means all members NOT
// including users who have requested access and are currently waiting
//
// -------------------------------------------------------------------------
exports.members = function (program, cb) {
	mongoose.model ('User').find ({roles: memberRole(program)}).exec (cb);
};

// -------------------------------------------------------------------------
//
// return a list of all users who are currently waiting to be added to the
// program member list
//
// -------------------------------------------------------------------------
exports.requests = function (program, cb) {
	mongoose.model ('User').find ({roles: requestRole(program)}).exec (cb);
};

// -------------------------------------------------------------------------
//
// create a new program. the user doing the creation will be set as the
// administrator
//
// -------------------------------------------------------------------------
exports.create = function (req, res) {
	console.log ('Creating a new program');
	var program = new Program(req.body);
	//
	// set the code, this is used for setting roles and other stuff
	//
	Program.findUniqueCode (program.title, null, function (newcode) {
		program.code = newcode;
		//
		// set the audit fields so we know who did what when
		//
		helpers.applyAudit (program, req.user)
		//
		// save and return
		//
		program.save(function (err) {
			if (err) {
				return res.status(422).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				setProgramAdmin (program, req.user);
				req.user.save ();
				res.json(program);
			}
		});
	});
};

// -------------------------------------------------------------------------
//
// this just takes the already queried object and pass it back
//
// -------------------------------------------------------------------------
exports.read = function (req, res) {
	res.json (decorate (req.program, req.user ? req.user.roles : []));
};

// -------------------------------------------------------------------------
//
// update the document, make sure to apply audit. We don't mess with the
// code if they change the title as that would mean reworking all the roles
//
// -------------------------------------------------------------------------
exports.update = function (req, res) {
	if (ensureAdmin (req.program, req.user, res)) {
		//
		// copy over everything passed in. This will overwrite the
		// audit fields, but they get updated in the following step
		//
		var program = _.assign (req.program, req.body);
		//
		// set the audit fields so we know who did what when
		//
		helpers.applyAudit (program, req.user)
		//
		// save
		//
		program.save(function (err) {
			if (err) {
				return res.status(422).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json (decorate (program, req.user ? req.user.roles : []));
				// res.json(program);
			}
		});
	}
};

// -------------------------------------------------------------------------
//
// delete the program
//
// -------------------------------------------------------------------------
exports.delete = function (req, res) {
	console.log ('Deleting');
	if (ensureAdmin (req.program, req.user, res)) {
		console.log ('Deleting');

		var program = req.program;
		program.remove(function (err) {
			if (err) {
				return res.status(422).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.json(program);
			}
		});
	}
};

// -------------------------------------------------------------------------
//
// return a list of all programs
//
// -------------------------------------------------------------------------
exports.list = function (req, res) {
	var me = helpers.myStuff (req.user.roles);
	var search = me.isAdmin ? {} : {$or: [{isPublished:true}, {code: {$in: me.programs.admin}}]}
	Program.find(search).sort('title')
	.populate('createdBy', 'displayName')
	.populate('updatedBy', 'displayName')
	.exec(function (err, programs) {
		if (err) {
			return res.status(422).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json (decorateList (programs, req.user ? req.user.roles : []));
			// res.json(programs);
		}
	});
};

// -------------------------------------------------------------------------
//
// this is the service front to the members call
//
// -------------------------------------------------------------------------
exports.listMembers = function (req, res) {
	exports.members (req.program, function (err, users) {
		if (err) {
			return res.status (422).send ({
				message: errorHandler.getErrorMessage (err)
			});
		} else {
			res.json (users);
		}
	});
};

// -------------------------------------------------------------------------
//
// this is the service front to the members call
//
// -------------------------------------------------------------------------
exports.listRequests = function (req, res) {
	exports.requests (req.program, function (err, users) {
		if (err) {
			return res.status (422).send ({
				message: errorHandler.getErrorMessage (err)
			});
		} else {
			res.json (users);
		}
	});
};

// -------------------------------------------------------------------------
//
// have the current user request access
//
// -------------------------------------------------------------------------
exports.request = function (req, res) {
	setProgramRequest (req.program, req.user);
	req.user.save ();
	res.json ({ok:true});
}

// -------------------------------------------------------------------------
//
// deal with members
//
// -------------------------------------------------------------------------
exports.confirmMember = function (req, res) {
	var user = req.model;
	console.log ('++++ confirm member ', user.username, user._id);
	unsetProgramRequest (req.program, user);
	setProgramMember (req.program, user);
	user.save (function (err, result) {
		if (err) {
			return res.status (422).send ({
				message: errorHandler.getErrorMessage (err)
			});
		} else {
			console.log ('---- member roles ', result.roles);
			res.json (result);
		}
	});
};
exports.denyMember = function (req, res) {
	var user = req.model;
	console.log ('++++ deny member ', user.username, user._id);
	unsetProgramRequest (req.program, user);
	unsetProgramMember (req.program, user);
	user.save (function (err, result) {
		if (err) {
			return res.status (422).send ({
				message: errorHandler.getErrorMessage (err)
			});
		} else {
			console.log ('---- member roles ', result.roles);
			res.json (result);
		}
	});
};

// -------------------------------------------------------------------------
//
// new empty program
//
// -------------------------------------------------------------------------
exports.new = function (req, res) {
	console.log ('get a new program set up and return it');
	var p = new Program ();
	res.json(p);
};

// -------------------------------------------------------------------------
//
// magic that populates the program on the request
//
// -------------------------------------------------------------------------
exports.programByID = function (req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Program is invalid'
		});
	}

	Program.findById(id)
	.populate('createdBy', 'displayName')
	.populate('updatedBy', 'displayName')
	.exec(function (err, program) {
		if (err) {
			return next(err);
		} else if (!program) {
			return res.status(404).send({
				message: 'No program with that identifier has been found'
			});
		}
		req.program = program;
		next();
	});
};

