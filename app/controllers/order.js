const { product } = require('.');
const responseMessages = require('../middlewares/response-messages');
const db = require('../models');
const validator = require('../validators/order');
const OrderModel = db.order;
const ProductModel = db.products;
const ProfitModel = db.profit;
module.exports = {
    createOrder: async (req, res) => {
        try {
            const { error, validateData } = await validator.validateOrderCrate(req.body);
            if (error) {
                return res.clientError({
                    msg: error
                })
            }
            console.log('req.decoded-----', req.decoded);
            // const checkExists = await OrderModel.findOne({ name: req.body.name });
            // if (checkExists) {
            //     return res.clientError({
            //         msg: `Similar role already exists with name ${req.body.name}`,
            //     });
            // }
            if (req.decoded.role == 'USER') {
                req.body.user = req.decoded.user_id
            }
            console.log('req.body.user------', req.body.user);
            if (!req.body.user) {
                return res.clientError({
                    msg: 'please choose user'
                })
            }
            req.body.orderDate = new Date();

            let totalAmount = 0;
            const products = [];
            req.body.products.map((value) => {
                value.totalRate = value.kg * value.kgRate;
                totalAmount += value.totalRate
                products.push(value.name)
            });
            req.body.totalAmount = totalAmount;
            req.body.totalProducts = req.body.products.length;
            req.body.status = 'orderconfirm'
            const data = await OrderModel.create(req.body);
            if (data && data._id) {
                let totalProfit = 0;
                const findProducts = await ProductModel.find({ _id: { $in: products } });
                data.products.map((proud) => {
                    let profit = 0;
                    findProducts.find((pro) => {
                        if (pro._id.toString() === proud.name.toString()) {
                            const singleProfit = pro.todayRate - pro.modestyPrice;
                            profit = singleProfit * proud.kg
                        }
                    })
                    totalProfit += profit
                });
                const today = new Date(); // Get the current date and time
                // Set the time to the beginning of the day (midnight)
                const createData = { order_id: data._id, amount: totalProfit, date: today };
                console.log('createData------', createData);
                const createProfit = await ProfitModel.create(createData);
                console.log('create profit---', createProfit);
                return res.success({
                    msg: `Order created successfully!!!`,
                    result: data
                });
            } else {
                return res.clientError({
                    msg: `Order creation failed`,
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
    getOrder: async (req, res) => {
        try {
            const _id = req.params.id;
            console.log('get role-------', req.decoded);
            const { error, validateData } = await validator.validateOrderGet(req.query);
            if (error) {
                return res.clientError({
                    msg: error
                })
            }
            const { time, user, date, acknowledged, status } = req.query;
            const filterQuery = { isDeleted: false };
            const populateValues = [
                { path: 'user', select: 'name email mobile ownerName areaName pin_code' },
                { path: 'products.name', select: 'name description img_url thanglishName tamilName' },
            ]
            if (status) filterQuery.status = status
            if (_id) {
                filterQuery._id = _id;
                const data = await OrderModel.findOne(filterQuery).populate(populateValues);
                if (!data) {
                    return res.clientError({
                        msg: 'no data found'
                    })
                };
                return res.success({
                    msg: 'request access',
                    result: data
                })
            }
            if (time === 'today') {
                const today = new Date(); // Get the current date and time

                // Set the time to the beginning of the day (midnight)
                today.setHours(0, 0, 0, 0);

                // Calculate the end of the day by setting the time to 23:59:59.999
                const endOfDay = new Date(today);
                endOfDay.setHours(23, 59, 59, 999);
                filterQuery.orderDate = {
                    $gte: today,
                    $lt: endOfDay,
                }
                // const today = new Date(); // Get today's date
                // today.setHours(0, 0, 0, 0); // Set the time to midnight for accurate comparison
                // console.log('today-----', today);
                // filterQuery.createdAt = today;
            } else if (time === 'yesterday') {
                const yesterday = new Date(); // Get the current date and time

                // Subtract one day from the current date to get yesterday's date
                yesterday.setDate(yesterday.getDate() - 1);

                // Set the time to the beginning of the day (midnight)
                yesterday.setHours(0, 0, 0, 0);

                // Calculate the end of yesterday by setting the time to 23:59:59.999
                const endOfYesterday = new Date(yesterday);
                endOfYesterday.setHours(23, 59, 59, 999);
                filterQuery.orderDate = {
                    $gte: yesterday,
                    $lt: endOfYesterday,
                }
                // const yesterday = new Date();
                // yesterday.setDate(yesterday.getDate() - 1); // Get yesterday's date
                // yesterday.setHours(0, 0, 0, 0);
                // console.log('yesterday-----', yesterday);

                // filterQuery.createdAt = yesterday;
            } else if (time === 'previous') {
                const previousDay = new Date();
                // previousDay.setDate(date.getDate() - 1);
                previousDay.setHours(0, 0, 0, 0);
                filterQuery.createdAt = previousDay
            }
            if (date) {
                const desiredDate = new Date(date)
                desiredDate.setHours(0, 0, 0, 0);

                // Calculate the end of the day by setting the time to 23:59:59.999
                const endOfDesiredDate = new Date(desiredDate);
                endOfDesiredDate.setHours(23, 59, 59, 999);
                filterQuery.orderDate = {
                    $gte: desiredDate,
                    $lt: endOfDesiredDate,
                }
            };

            if (user) {
                filterQuery.user = user
            }
            const unnecessary = {}
            if (req.decoded.role == 'USER') {
                filterQuery.user = req.decoded.user_id
                unnecessary.products = { modestyPrice: 0 }
            }
            console.log('filterQuery---', filterQuery, unnecessary);
            let data = await OrderModel.find(filterQuery, unnecessary).populate(populateValues).sort({ _id: -1 });
            // console.log('data--------', data);
            if (!data.length) {
                return res.success({
                    msg: responseMessages[1012],
                    result: data,
                });
            }
            if (req.decoded.role === 'ADMIN') {
                data = data.map((val) => {
                    val = { ...val._doc }
                    let totalProfit = 0
                    val.products = val.products.map((pro) => {
                        pro = { ...pro._doc };
                        pro.singleProfit = pro.kgRate - pro.modestyPrice
                        pro.ProductProfit = pro.singleProfit * pro.kg
                        totalProfit += pro.ProductProfit
                        return pro
                    });
                    val.totalProfit = totalProfit
                    return val
                })
            }

            console.log('dadata---', data[0]);
            return res.success({
                msg: 'Order list',
                result: data,
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
    updateOrder: async (req, res) => {
        try {
            const filterQuery = { isDeleted: false, _id: req.params.id }
            const { name } = req.body;
            const { error, validateData } = await validator.validateOrderUpdate(req.body);
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
            if (req.decoded.role == 'USER') {
                filterQuery
            };
            const checkExists = await OrderModel.findOne(filterQuery);
            if (!checkExists) {
                return res.clientError({
                    msg: responseMessages[1012],
                });
            }
            const updData = {};

            let totalAmount = 0
            updData.products = req.body.products.map((value) => {
                value.totalRate = value.kg * value.kgRate;
                totalAmount += value.totalRate
                return value;
            });
            updData.totalAmount = totalAmount;
            updData.totalProducts = req.body.products.length;
            console.log('updData---------', updData);
            // if (req.body.name) updData.name = req.body.name;
            // if (req.body.description) updData.description = req.body.description;
            // if (req.body.display) updData.display = req.body.display;
            // const checkUnique = await OrderModel.findOne({ _id: { $ne: _id }, name, isDeleted: false });
            // if (checkUnique) {
            //     return res.clientError({
            //         msg: `this type of Order is Already taken`,
            //     });
            // }
            const data = await OrderModel.updateOne({ _id }, updData);
            if (data.modifiedCount) {
                res.success({
                    result: data,
                    msg: 'Order Updated Successfully',
                });
            } else {
                res.clientError({
                    msg: 'Failed to update Order, pls try again',
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
    deleteOrder: async (req, res) => {
        try {
            const _id = req.params.id;
            if (!_id) {
                return res.clientError({
                    msg: responseMessages[1015],
                });
            }
            const filterQuery = { isDeleted: false, _id }
            const checkExists = await OrderModel.findOne(filterQuery);
            if (!checkExists) {
                return res.clientError({
                    msg: responseMessages[1012],
                });
            }
            const data = await OrderModel.updateOne(filterQuery, { isDeleted: true })
            if (data.modifiedCount) {
                return res.success({
                    msg: 'Order deleted successfully',
                    result: data,
                });
            }
            return res.clientError({
                msg: 'Order deletion failed',
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
    createRating: async (req, res) => {
        try {
            const filterQuery = { isDeleted: false, _id: req.params.id };
            const checkExist = await OrderModel.findOne(filterQuery);
            const findProducts = await ProductModel.find({ isDeleted: false });
            if (!checkExist) {
                return res.clientError({
                    msg: responseMessages[1012]
                })
            };
            const value = checkExist.products.map((value) => {
                findProducts.find((pro) => {
                    if (pro._id.toString() == value.name.toString()) {
                        value.kgRate = pro.todayRate;
                        value.totalRate = value.kg * pro.todayRate;
                    }
                })
                // if (value.kg) {
                //     value.totalRate = value.kg * value.kgRate
                // }
                console.log('value--------', value);
                return value
            });
            checkExist.vegitables = value;
            await checkExist.save();
            return res.success({
                msg: 'Rate Entered Successfully'
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
    delivery: async (req, res) => {
        try {
            const filterQuery = { isDeleted: false, _id: req.params.id };
            const checkExist = await OrderModel.findOne(filterQuery);
            if (!checkExist) {
                return res.clientError({
                    msg: responseMessages[1012]
                })
            }
            const data = await OrderModel.updateOne(filterQuery, { status: 'delivery' });
            if (data.modifiedCount) {
                return res.success({
                    msg: `order deliveryed`,
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
    todayNeededProducts: async (req, res) => {
        try {
            const filterQuery = { isDeleted: false };
            filterQuery.status = { $ne: 'pending' }
            const today = new Date(); // Get the current date and time

            // Set the time to the beginning of the day (midnight)
            today.setHours(0, 0, 0, 0);

            // Calculate the end of the day by setting the time to 23:59:59.999
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);
            filterQuery.orderDate = {
                $gte: today,
                $lt: endOfDay,
            }
            // console.log('-------', filterQuery);
            const data = await OrderModel.find(filterQuery);
            const products = [];
            data.map((ord) => {
                ord.products.map((proud) => {
                    products.push(proud);
                })
            });
            // Create an object to store the sum of 'kg' values grouped by 'name'
            const kgSumByName = {};

            // Calculate the sum of 'kg' values for each 'name'
            products.forEach(item => {
                const { name, kg } = item;
                if (kgSumByName[name]) {
                    kgSumByName[name] += kg;
                } else {
                    kgSumByName[name] = kg;
                }
            });
            const kgSumArray = Object.keys(kgSumByName).map(key => ({
                name: key,
                kg: kgSumByName[key],
            }));
            const necessary = { name: 1, type: 1, status: 1, tamilName: 1, thanglishName: 1, img_url: 1, modestyPrice: 1 };
            const productIds = kgSumArray.map((pr) => pr.name.toString());
            const findProduct = await ProductModel.find({ _id: { $in: productIds } }, necessary);
            let totalAmount = 0;
            const result = findProduct.map((value) => {
                const details = { ...value._doc };
                kgSumArray.find((val) => {
                    if (val.name.toString() == value._id.toString()) {
                        details.need = val.kg
                        console.log('--------', val,);
                        details.amount = value.modestyPrice * val.kg
                        totalAmount += details.amount
                    }
                });
                return details
            })
            if (!data.length) {
                return res.success({
                    msg: responseMessages[1012],
                    result,
                });
            }

            return res.success({
                msg: 'Order list',
                result: { result, totalAmount }
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
    todayAllProductsDelivery: async (req, res) => {
        try {
            const filterQuery = { isDeleted: false };
            const today = new Date(); // Get the current date and time

            // Set the time to the beginning of the day (midnight)
            today.setHours(0, 0, 0, 0);

            // Calculate the end of the day by setting the time to 23:59:59.999
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);
            filterQuery.orderDate = {
                $gte: today,
                $lt: endOfDay,
            }
            console.log('filterQuery-------', filterQuery);
            // const data = await OrderModel.find(filterQuery);
            // const products = data.map( (val) => val._id.toString());
            const result = await OrderModel.updateMany(filterQuery, { status: 'delivery' });
            console.log('result----------', result);
            if (result.modifiedCount) {
                return res.success({
                    msg: 'Order Deliveryed successfully',
                    result
                })
            };
            return res.clientError({
                msg: 'Order Deliveryed failed try again'
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
    addCart: async (req, res) => {
        try {
            const filterQuery = { isDeleted: false };
            const { name, kg, kgRate, } = req.body;
            if (!req.decoded) {
                return res.clientError({
                    msg: 'Please Enter your mobile number and password'
                })
            }
            const kilo = parseInt(kg);
            console.log('kilo------', kilo);
            const { error, validateData } = await validator.validateAddCart(req.body);
            if (error) {
                return res.clientError({
                    msg: error
                })
            };
            const today = new Date(); // Get the current date and time

            // Set the time to the beginning of the day (midnight)
            today.setHours(0, 0, 0, 0);

            // Calculate the end of the day by setting the time to 23:59:59.999
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);
            filterQuery.orderDate = {
                $gte: today,
                $lt: endOfDay,
            };

            const { user_id } = req.decoded;
            filterQuery.user = user_id;
            filterQuery.status = 'pending';
            // const today = new Date(); // Get today's date
            // today.setHours(0, 0, 0, 0); // Set the time to midnight for accurate comparison
            // console.log('today-----', today);
            // filterQuery.createdAt = today;
            const findProcuct = await ProductModel.findOne({ _id: name })
            const checkExist = await OrderModel.findOne(filterQuery);
            const total = kgRate * kilo;
            let already = false;
            if (checkExist) {
                let final = 0;
                const result = checkExist.products.map((value) => {
                    if (value.name.toString() === name.toString()) {
                        console.log('already-------------');
                        already = true;
                        value.kg += kilo;
                        value.totalRate = value.kg * value.kgRate
                    }
                    final += value.totalRate
                    return value
                })
                if (already == true) {
                    checkExist.products = result;
                    checkExist.totalAmount = final;
                    await checkExist.save();
                    return res.success({
                        msg: 'product added',
                        result: checkExist
                    })
                }
                checkExist.products.push({ name, kg: kilo, kgRate, totalRate: total, modestyPrice: findProcuct.modestyPrice });
                checkExist.totalAmount += total;
                console.log('checkExist-----------', checkExist);
                checkExist.totalProducts = checkExist.products.length;
                await checkExist.save();
                return res.success({
                    msg: 'product added',
                    result: checkExist
                })
            };
            const createData = { products: { name, kg: kilo, kgRate, totalRate: total, modestyPrice: findProcuct.modestyPrice }, orderDate: new Date(), totalAmount: total, user: user_id }
            const data = await OrderModel.create(createData);
            if (data) {
                return res.success({
                    msg: 'cart added',
                    result: data
                })
            };
            return res.clientError({
                msg: 'product not added'
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
    lastOrderGet: async (req, res) => {
        try {
            const filterQuery = { isDeleted: false };
            filterQuery.user = req.decoded.user_id;
            filterQuery.status = 'pending';
            const today = new Date(); // Get the current date and time

            // Set the time to the beginning of the day (midnight)
            today.setHours(0, 0, 0, 0);

            // Calculate the end of the day by setting the time to 23:59:59.999
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);
            filterQuery.orderDate = {
                $gte: today,
                $lt: endOfDay,
            };
            const populateValues = [
                { path: 'user', select: 'name email mobile ownerName areaName pin_code' },
                { path: 'products.name', select: 'name description img_url thanglishName tamilName' },
            ]
            const data = await OrderModel.findOne(filterQuery, {}, { sort: { 'createdAt': -1 } }).populate(populateValues);
            if (data) {
                return res.success({
                    msg: 'today orders',
                    result: data
                })
            };
            return res.success({
                msg: 'not there'
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
    orderConfirm: async (req, res) => {
        try {
            const filterQuery = { isDeleted: false, _id: req.params.id };
            const checkExist = await OrderModel.findOne(filterQuery);
            if (!checkExist) {
                return res.clientError({
                    msg: 'something went wrong'
                })
            };
            const data = await OrderModel.updateOne(filterQuery, { status: 'orderconfirm' });
            if (data.modifiedCount) {
                let totalProfit = 0;
                const products = checkExist.products.map((val) => val.name)
                const findProducts = await ProductModel.find({ _id: { $in: products } });
                checkExist.products.map((proud) => {
                    let profit = 0;
                    findProducts.find((pro) => {
                        if (pro._id.toString() === proud.name.toString()) {
                            const singleProfit = pro.todayRate - pro.modestyPrice;
                            profit = singleProfit * proud.kg
                        }
                    })
                    totalProfit += profit
                });
                const today = new Date(); // Get the current date and time
                // Set the time to the beginning of the day (midnight)
                const createData = { order_id: data._id, amount: totalProfit, date: today }
                const createProfit = await ProductModel.create(createData);
                console.log('create profit---', createProfit);
                return res.success({
                    msg: 'order confirmed',
                    result: data
                })
            };
            return res.clientError({
                msg: 'order confirmed failed try again'
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
    cartDelete: async (req, res) => {
        try {
            console.log('req.body--------', req.body);
            const _id = req.params.id;
            const filterQuery = { isDeleted: false, _id };
            const { name } = req.body;
            if (!name) {
                return res.clientError({
                    msg: 'name must be requireed'
                })
            }
            const checkExist = await OrderModel.findOne(filterQuery);
            if (!checkExist) {
                return res.clientError({
                    msg: 'No data found'
                })
            };
            const products = [];
            checkExist.products.map((value) => {
                if (value.name.toString() !== name.toString()) {
                    products.push(value);
                }
            });
            console.log('products-----', products);

            let totalAmount = 0
            products.map((value) => {
                value.totalRate = value.kg * value.kgRate;
                totalAmount += value.totalRate
            });
            const data = await OrderModel.updateOne(filterQuery, { products, totalAmount, totalProducts: products.length });
            if (data.modifiedCount) {
                return res.success({
                    msg: 'Product removed',
                    result: data
                })
            };
            return res.clientError({
                msg: 'try again'
            });
        } catch (error) {

        }
    },
    cartUpdate: async (req, res) => {
        try {
            console.log('req.body--------', req.body);
            const _id = req.params.id;
            const filterQuery = { isDeleted: false, _id };
            const { name } = req.body;
            if (!name) {
                return res.clientError({
                    msg: 'name must be requireed'
                })
            }
            const checkExist = await OrderModel.findOne(filterQuery);
            if (!checkExist) {
                return res.clientError({
                    msg: 'No data found'
                })
            };
            const products = [];
            checkExist.products.map((value) => {
                if (value.name.toString() !== name.toString()) {
                    products.push(value);
                }
            });

            let totalAmount = 0
            products.map((value) => {
                value.totalRate = value.kg * value.kgRate;
                totalAmount += value.totalRate
            });
            const data = await OrderModel.updateOne(filterQuery, { products, totalAmount, totalProducts: products.length });
            if (data.matchedCount) {
                return res.success({
                    msg: 'Product removed',
                    result: data
                })
            };
            return res.clientError({
                msg: 'try again'
            });
        } catch (error) {

        }
    },
    getProfit: async (req, res) => {
        try {

        } catch (error) {
            console.log('error---', error);
        }
    }
};
