const { mongoose } = require('../services/imports');

module.exports = mongoose.model(
    'profit',
    new mongoose.Schema(
        {
            order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'order' },
            amount: Number,
            date: Date,
        },
        { timestamps: true, versionKey: false }
    ),
    'profit'
);
