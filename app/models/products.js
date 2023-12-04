const { mongoose } = require('../services/imports');

module.exports = mongoose.model(
    'products',
    new mongoose.Schema(
        {
            name: { type: String, uppercase: true },
            type: { type: String, enum: ['vegetables', 'fruits'] },
            description: String,
            status: { type: String, enum: ['active', 'inactive'], default: 'active' },
            img_url: String,
            todayRate: Number,
            yesterDayRate: Number,
            dayBeforeDay: Number,
            boxRate: Number,
            boxQuantity: Number,
            thanglishName: String,
            tamilName: String,
            modestyPrice: Number,
            yesterdayModestyPrice: Number,
            dayBeforeDayModestyPrice: Number,
            isDeleted: { type: Boolean, default: false },

        },
        { timestamps: true, versionKey: false }
    ),
    'products'
);
