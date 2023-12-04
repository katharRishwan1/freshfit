const responseMessages = require('../middlewares/response-messages');
const db = require('../models');
const { validateUserUpdate } = require('../validators/user');

const UserModel = db.user;
const OrderModel = db.order;
module.exports = {
    // createVegitables: async (req, res) => {
    //     try {

    //         const { error, validateData } = await validateUserUpdate(req.body);
    //         if (error) {
    //             return res.clientError({
    //                 msg: error
    //             })
    //         }
    //         const checkExists = await UserModel.findOne({ name: req.body.name });
    //         if (checkExists) {
    //             return res.clientError({
    //                 msg: `Similar role already exists with name ${req.body.name}`,
    //             });
    //         }
    //         const data = await UserModel.create(req.body);
    //         if (data && data._id) {
    //             res.clientError({
    //                 msg: `${req.body.name} Vegitables created successfully!!!`,
    //             });
    //         } else {
    //             res.clientError({
    //                 msg: `${req.body.name} Vegitables creation failed`,
    //             });
    //         }
    //     } catch (error) {
    //         console.log('error.status', error);
    //         if (error.status) {
    //             if (error.status < 500) {
    //                 return res.clientError({
    //                     ...error.error,
    //                     statusCode: error.status,
    //                 });
    //             }
    //             return res.internalServerError({ ...error.error });
    //         }
    //         return res.internalServerError({ error });
    //     }
    // },
    getUsers: async (req, res) => {
        try {
            const _id = req.params.id;
            const filterQuery = { isDeleted: false };
            const unnecessary = {
                password: 0, mobileVerified: 0,
                emailVerified: 0,
                isDeleted: 0,
                createdAt: 0,
                updatedAt: 0
            }
            if (_id) {
                filterQuery._id = _id;
                const data = await UserModel.findOne(filterQuery, unnecessary).populate('role', 'name')
                if (data) {
                    return res.success({
                        msg: 'request access',
                        result: data,
                    });
                }
                return res.clientError({
                    msg: responseMessages[1012]
                })
            }
            const data = await UserModel.find(filterQuery, unnecessary).populate('role', 'name');
            const users = [];
            data.forEach((val) => {
                if (val.role.name == 'USER') {
                    users.push(val._id.toString())
                }
            });
            const orders = await OrderModel.find({ user: { $in: users }, status: 'delivery' });

            const ids = orders.map((val) => {
                return val.user.toString()
            });

            const result = data.map((value) => {

            })
            if (!data.length) {
                return res.success({
                    msg: responseMessages[1012],
                    result: data,
                });
            } else {
                return res.success({
                    msg: 'users list',
                    result: data,
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
    updateUser: async (req, res) => {
        try {
            const { name, ownerName, mobile, alternativeMobileNumber, areaName, pin_code, status, email } = req.body;
            const _id = req.params.id;
            if (!_id) {
                return res.clientError({
                    msg: responseMessages[1015],
                });
            };
            const { error, validateData } = await validateUserUpdate(req.body);
            if (error) {
                return res.clientError({
                    msg: error
                })
            };
            const checkExists = await UserModel.findOne({ _id, isDeleted: false });
            if (!checkExists) {
                return res.clientError({
                    msg: responseMessages[1012],
                });
            }
            const updData = {};
            if (name) updData.name = name;
            if (ownerName) updData.ownerName = ownerName;
            if (mobile) updData.mobile = mobile;
            if (alternativeMobileNumber) updData.alternativeMobileNumber = alternativeMobileNumber;
            if (areaName) updData.areaName = areaName;
            if (pin_code) updData.pin_code = pin_code;
            if (status) updData.status = status;
            if (email) updData.email = email;
            const checkUnique = await UserModel.findOne({ _id: { $ne: _id }, name, areaName, isDeleted: false });
            if (checkUnique) {
                return res.clientError({
                    msg: `${name} this type of user is Already taken`,
                });
            }

            const data = await UserModel.updateOne({ _id }, updData);
            if (data.modifiedCount) {
                res.success({
                    result: data,
                    msg: 'User Updated Successfully',
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
    deleteUser: async (req, res) => {
        try {
            const _id = req.params.id;
            if (!_id) {
                return res.clientError({
                    msg: responseMessages[1015],
                });
            }
            const checkExists = await UserModel.findOne({ _id, isDeleted: false });
            if (!checkExists) {
                return res.clientError({
                    msg: responseMessages[1012],
                });
            }
            const data = await UserModel.updateOne({ _id }, { isDeleted: true });
            if (data.modifiedCount) {
                res.success({
                    msg: 'User deleted successfully',
                    result: data,
                });
            } else {
                res.clientError({
                    msg: 'User deletion failed',
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
    myProfile: async (req, res) => {
        try {
            const filterQuery = { isDeleted: false };
            const _id = req.decoded.user_id;
            filterQuery._id = _id;
            const unnecessary = {
                password: 0, mobileVerified: 0,
                emailVerified: 0,
                isDeleted: 0,
                createdAt: 0,
                updatedAt: 0
            }
            const data = await UserModel.findOne(filterQuery, unnecessary).populate('role', 'name');
            if (data) {
                return res.success({
                    msg: 'request access',
                    result: data
                })
            }
            return res.clientError({
                msg: 'user not found'
            })

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
    }
};
