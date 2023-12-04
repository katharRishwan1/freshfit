const responseMessages = require('../middlewares/response-messages');
const db = require('../models');
const validator = require('../validators/role');
const RolesModel = db.role;
module.exports = {
    createRole: async (req, res) => {
        try {
            const { error, validateData } = await validator.validateRoleCrate(req.body);
            if (error) {
                return res.clientError({
                    msg: error
                })
            }
            const checkExists = await RolesModel.findOne({ name: req.body.name });
            if (checkExists) {
                return res.clientError({
                    msg: `Similar role already exists with name ${req.body.name}`,
                });
            }
            const data = await RolesModel.create(req.body);
            if (data && data._id) {
                res.clientError({
                    msg: `${req.body.name} role created successfully!!!`,
                });
            } else {
                res.clientError({
                    msg: `${req.body.name} role creation failed`,
                });
            }
        } catch (error) {
            console.log('error.status', error);
            if (error.status) {
                if (error.status < 500) {
                    return res.clientError({
                        ...error.error,
                        statusCode: error.status,
                    });
                }
                return res.internalServerError({ ...error.error });
            }
            return res.internalServerError({ error });
        }
    },
    getRole: async (req, res) => {
        try {
            const _id = req.params.id;
            console.log('get role-------', req.decoded);
            const filter = { isDeleted: false };
            if (_id) {
                filter._id = _id;
                const data = await RolesModel.findOne(filter);
                if (data) {
                    return res.success({
                        msg: 'request access',
                        result: data
                    })
                }
                return res.clientError({
                    msg: responseMessages[1012]
                })
            }
            const getRoles = await RolesModel.find(filter);
            if (!getRoles.length) {
                res.success({
                    msg: responseMessages[1012],
                    result: getRoles,
                });
            } else {
                res.success({
                    msg: 'Roles list',
                    result: getRoles,
                });
            }
        } catch (error) {
            console.log('error.status', error);
            if (error.status) {
                if (error.status < 500) {
                    return res.clientError({
                        ...error.error,
                        statusCode: error.status,
                    });
                }
                return res.internalServerError({ ...error.error });
            }
            return res.internalServerError({ error });
        }
    },
    updateRole: async (req, res) => {
        try {
            const { name } = req.body;
            const { error, validateData } = await validator.validateRoleUpdate(req.body);
            if (error) {
                return res.clientError({
                    msg: error
                })
            }
            const _id = req.params.id;
            if (!_id) {
                return res.clientError({
                    msg: responseMessages[1015],
                });
            }
            const checkExists = await RolesModel.findOne({ _id, isDeleted: false });
            if (!checkExists) {
                return res.clientError({
                    msg: responseMessages[1012],
                });
            }
            const updData = {};
            if (req.body.name) updData.name = req.body.name;
            if (req.body.description) updData.description = req.body.description;
            if (req.body.display) updData.display = req.body.display;
            const checkUnique = await RolesModel.findOne({ _id: { $ne: _id }, name, isDeleted: false });
            if (checkUnique) {
                return res.clientError({
                    msg: `${name} this type of role is Already taken`,
                });
            }

            const data = await RolesModel.updateOne({ _id }, updData);
            if (data.modifiedCount) {
                res.success({
                    result: data,
                    msg: 'Roles Updated Successfully',
                });
            } else {
                res.clientError({
                    msg: 'Failed to update role, pls try again',
                });
            }
        } catch (error) {
            console.log('error.status', error);
            if (error.status) {
                if (error.status < 500) {
                    return res.clientError({
                        ...error.error,
                        statusCode: error.status,
                    });
                }
                return res.internalServerError({ ...error.error });
            }
            return res.internalServerError({ error });
        }
    },
    deleteRole: async (req, res) => {
        try {
            const _id = req.params.id;
            if (!_id) {
                return res.clientError({
                    msg: responseMessages[1015],
                });
            }
            const checkExists = await RolesModel.findOne({ _id, isDeleted: false });
            if (!checkExists) {
                return res.clientError({
                    msg: responseMessages[1012],
                });
            }
            const data = await RolesModel.updateOne({ _id }, { isDeleted: true });
            if (data.modifiedCount) {
                res.success({
                    msg: 'Role deleted successfully',
                    result: data,
                });
            } else {
                res.clientError({
                    msg: 'Role deletion failed',
                });
            }
        } catch (error) {
            console.log('error.status', error);
            if (error.status) {
                if (error.status < 500) {
                    return res.clientError({
                        ...error.error,
                        statusCode: error.status,
                    });
                }
                return res.internalServerError({ ...error.error });
            }
            return res.internalServerError({ error });
        }
    },
};
