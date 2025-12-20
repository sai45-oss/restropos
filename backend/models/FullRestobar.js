const mongoose = require('mongoose');

// ----------------------
// 🏨 Restaurant Model
// ----------------------
const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: String,
    phone: String,
    cuisine: [String],
    image: String
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);


// ----------------------
// 🍽 Menu Model
// ----------------------
const menuSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    name: { type: String, required: true },
    description: String,
    category: { type: String, required: true },  // e.g. Pizza, Drinks, Breakfast
    price: { type: Number, required: true },
    image: String,
    availability: { type: Boolean, default: true }
}, { timestamps: true });

const Menu = mongoose.model('Menu', menuSchema);


// Export both
module.exports = {
    Restaurant,
    Menu
};
