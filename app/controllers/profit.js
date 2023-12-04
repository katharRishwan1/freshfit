const responseMessages = require('../middlewares/response-messages');
const db = require('../models');
const ProfitModel = db.profit;
const OrderModel = db.order;
module.exports = {
    getProfit: async (req, res) => {
        try {
            const { startDate, endDate, status, date } = req.query;
            // const { error, validateData } = await validator.validateOrderGet(req.query);
            // if (error) {
            //     return res.clientError({
            //         msg: error
            //     })
            // }
            if (req.decoded.role !== 'ADMIN') {
                return res.clientError({
                    msg: 'something went wrong'
                })
            }
            const filterQuery = {};
            if (status === 'today') {
                // console.log('t0ady-------------');
                // const currentDate = new Date();
                // // Set the start and end times for today (midnight to 11:59:59 PM)
                // const startOfDay = new Date(currentDate);
                // startOfDay.setHours(0, 0, 0, 0); // Set to midnight
                // const endOfDay = new Date(currentDate);
                // endOfDay.setHours(23, 59, 59, 999);
                // filterQuery.date = { $gte: startOfDay, $lte: endOfDay }
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
            } else if (date) {
                const today = new Date(date); // Get the current date and time
                // Set the time to the beginning of the day (midnight)
                today.setHours(0, 0, 0, 0);

                // Calculate the end of the day by setting the time to 23:59:59.999
                const endOfDay = new Date(today);
                endOfDay.setHours(23, 59, 59, 999);
                filterQuery.orderDate = {
                    $gte: today,
                    $lt: endOfDay,
                }
            } else if (startDate && endDate) {
                // const today = new Date(date); // Get the current date and time
                // // Set the time to the beginning of the day (midnight)
                // today.setHours(0, 0, 0, 0);

                // // Calculate the end of the day by setting the time to 23:59:59.999
                // const endOfDay = new Date(today);
                const from = new Date(startDate);
                const to = new Date(endDate);
                from.setHours(0, 0, 0, 0);
                to.setHours(23, 59, 59, 999);
                filterQuery.orderDate = { $gte: from, $lte: to }
            }

            console.log('filterQuery---', filterQuery);
            // const data = await ProfitModel.find(filterQuery);
            // console.log('date-----', data);
            let data = await OrderModel.find(filterQuery);
            console.log('date-----', data.length);
            if (!data.length) {
                return res.success({
                    msg: 'orders not found',
                    result: 0,
                });
            }
            let totalProfitAmount = 0
            data = data.map((val) => {
                val = { ...val._doc }
                let totalProfit = 0
                val.products = val.products.map((pro) => {
                    pro = { ...pro._doc };
                    pro.singleProfit = pro?.kgRate - pro?.modestyPrice
                    // console.log('modestyprc-----', pro.kg, '---modesty', pro.modestyPrice);
                    pro.ProductProfit = pro.singleProfit * pro.kg
                    totalProfit += pro.ProductProfit
                    return pro
                });
                val.totalProfit = totalProfit
                totalProfitAmount += val.totalProfit
                // return totalProfit
            })
            // let amount = 0;
            // data.map((val) => {
            //     amount += val.amount
            // })
            if (!totalProfitAmount) totalProfitAmount = 0
            return res.success({
                msg: `profit is`,
                result: totalProfitAmount,
            });

        } catch (error) {
            console.log('error-', error);
        }
    },
    profitWithProducts: async (req, res) => {
        try {
            const filterQuery = {}
            // const data = await ProfitModel.find(filterQuery).populate('order_id');
            const data = await ProfitModel.find(filterQuery)
                .populate({
                    path: 'order_id',
                    select: 'user',
                    populate: {
                        path: 'user',
                        select: 'firstName mobile email'
                    },
                })
                .populate({
                    path: 'order_id',
                    select: 'products',
                    populate: {
                        path: 'products',
                        populate: {
                            path: 'name',
                            select: 'type img_url tamilName modestyPrice'
                        },
                    },
                });
            // console.log('progit model---', data);
            if (data.length) {
                return res.success({
                    msg: 'data fetched successfully',
                    result: data
                })
            };
            return res.success({
                msg: 'not data found'
            })
        } catch (error) {

        }
    }
}