const responseMessages = require('../middlewares/response-messages');
const db = require('../models');
const { updateMany } = require('../models/user');
const validator = require('../validators/product');

const ProductModel = db.products;
module.exports = {
    createProduct: async (req, res) => {
        try {

            const { error, validateData } = await validator.validateCreate(req.body);
            if (error) {
                return res.clientError({
                    msg: error
                })
            }
            const checkExists = await ProductModel.findOne({ name: req.body.name });
            if (checkExists) {
                return res.clientError({
                    msg: `Similar Product Already Exists With Name ${req.body.name}`,
                });
            };
            const data = await ProductModel.create(req.body);
            if (data && data._id) {
                res.success({
                    msg: `${req.body.name} Product created successfully!!!`,
                    result: data
                });
            } else {
                res.clientError({
                    msg: `${req.body.name} Product creation failed`,
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
    getProduct: async (req, res) => {
        try {

            const { type } = req.query;
            console.log('req.query---------', req.query);
            const _id = req.params.id;
            const { error, validateData } = await validator.validateGet(req.query);
            if (error) {
                return res.clientError({
                    msg: error
                })
            }
            const filterQuery = { isDeleted: false };
            const unnecessary = {};
            if (req.decoded?.role != 'USER') {
                filterQuery.status = 'active'
                unnecessary.modestyPrice = 0
                unnecessary.yesterdayModestyPrice = 0
                unnecessary.dayBeforeDayModestyPrice = 0
            }
            if (type) filterQuery.type = type;
            if (_id) {
                filterQuery._id = _id;
                const data = await ProductModel.findOne(filterQuery, unnecessary);
                if (data) {
                    return res.success({ msg: 'request access', result: data })
                };
                return res.clientError({ msg: responseMessages[1012] })
            }
            const data = await ProductModel.find(filterQuery, unnecessary);
            if (!data.length) {
                return res.success({
                    msg: responseMessages[1012],
                    result: data,
                });
            }
            const vegetables = [];
            const fruits = [];
            data.map((val) => {
                if (val.type === 'vegetables') {
                    vegetables.push(val)
                } else {
                    fruits.push(val)
                }
            })
            const concate = vegetables.concat(fruits);
            return res.success({
                msg: 'Product list',
                result: concate,
            });
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
    updateProduct: async (req, res) => {
        try {
            const { name, description, img_url, todayRate, yesterDayRate, dayBeforeDay, type, status } = req.body;
            const _id = req.params.id;
            if (!_id) {
                return res.clientError({
                    msg: responseMessages[1015],
                });
            }
            const { error, validateData } = await validator.validateUpdate(req.body);
            if (error) {
                return res.clientError({
                    msg: error
                })
            }
            const checkExists = await ProductModel.findOne({ _id, isDeleted: false });
            if (!checkExists) {
                return res.clientError({
                    msg: responseMessages[1012],
                });
            }
            const updData = {};
            if (name) updData.name = name;
            if (type) updData.type = type;
            if (description) updData.description = description;
            if (img_url) updData.img_url = img_url;
            if (todayRate) updData.todayRate = todayRate;
            if (yesterDayRate) updData.yesterDayRate = yesterDayRate;
            if (dayBeforeDay) updData.dayBeforeDay = dayBeforeDay;
            if (status) updData.status = status;
            const checkUnique = await ProductModel.findOne({ _id: { $ne: _id }, name, isDeleted: false });
            if (checkUnique) {
                return res.clientError({
                    msg: `${name} this type of Product is Already taken`,
                });
            }

            const data = await ProductModel.updateOne({ _id }, updData);
            if (data.modifiedCount) {
                res.success({
                    result: data,
                    msg: 'Product Updated Successfully',
                });
            } else {
                res.clientError({
                    msg: 'Failed to update Product, pls try again',
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
    deleteProduct: async (req, res) => {
        try {
            const _id = req.params.id;
            if (!_id) {
                return res.clientError({
                    msg: responseMessages[1015],
                });
            }
            const checkExists = await ProductModel.findOne({ _id, isDeleted: false });
            if (!checkExists) {
                return res.clientError({
                    msg: responseMessages[1012],
                });
            }
            const data = await ProductModel.updateOne({ _id }, { isDeleted: true });
            if (data.modifiedCount) {
                res.success({
                    msg: 'Product deleted successfully',
                    result: data,
                });
            } else {
                res.clientError({
                    msg: 'Product deletion failed',
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
    rateUpdate: async (req, res) => {
        try {
            console.log('-------', req.body);
            const _id = req.params.id;
            const { todayRate, modestyPrice } = req.body;
            const { error, validateData } = await validator.validateRatetUpdate(req.body);
            if (error) {
                return res.clientError({
                    msg: error
                })
            }
            const filterQuery = { isDeleted: false, _id };
            const checkExist = await ProductModel.findOne(filterQuery);
            if (!checkExist) {
                return res.clientError({
                    msg: responseMessages[1012]
                })
            };
            const updData = { todayRate, yesterDayRate: checkExist.todayRate, dayBeforeDay: checkExist.yesterDayRate }
            if (modestyPrice) {
                updData.modestyPrice = modestyPrice;
                updData.yesterdayModestyPrice = checkExist.modestyPrice;
                updData.dayBeforeDayModestyPrice = checkExist.yesterdayModestyPrice
            };
            const data = await ProductModel.updateOne(filterQuery, updData);
            if (data.modifiedCount) {
                return res.success({
                    msg: 'Rate Updated'
                })
            };
            return res.clientError({
                msg: 'Rate Updated Failed try again'
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
    },
    statusUpdate: async (req, res) => {
        try {
            const filterQuery = { isDeleted: false, _id: req.params.id };
            const checkExist = await ProductModel.findOne(filterQuery);
            if (!checkExist) {
                return res.clientError({
                    msg: responseMessages[1012]
                })
            }
            const status = checkExist.status == 'active' ? 'inactive' : 'active';
            const data = await ProductModel.updateOne(filterQuery, { status });
            if (data.modifiedCount) {
                return res.success({
                    msg: `product ${status}`,
                    result: data
                })
            };
            return res.clientError({
                msg: 'status update failed'
            });

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
