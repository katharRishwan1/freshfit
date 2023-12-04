const { mongoose } = require('../services/imports');

module.exports = mongoose.model(
    'order',
    new mongoose.Schema(
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
            products: [
                {
                    name: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
                    kg: Number,
                    kgRate: Number,
                    totalRate: Number,
                    modestyPrice: Number,
                    box: { type: Boolean, default: false },
                }
            ],
            totalAmount: Number,
            totalModestyAmount: Number,
            rateVerified: { type: Boolean, default: true },
            orderDate: { type: Date },
            deliveryDate: { type: Date },
            acknowledged: { type: Boolean, default: false },
            // orderConfirm: { type: Boolean, default: false },
            status: { type: String, enum: ['delivery', 'process', 'orderconfirm', 'reject', 'pending',], default: 'pending' },
            totalProducts: Number,
            isDeleted: { type: Boolean, default: false }
        },
        { timestamps: true, versionKey: false }
    ),
    'order'
);
