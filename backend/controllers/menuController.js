const Menu = require("../models/menuModel");
const Category = require("../models/categoryModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

/**
 * @desc    Add new menu item
 * @route   POST /api/menu
 */
const addMenuItem = async (req, res, next) => {
  try {
    const { name, category, price } = req.body;

    if (!name || !category || !price) {
      return next(
        createHttpError(400, "Please provide name, category, and price!")
      );
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return next(createHttpError(400, "Invalid category id"));
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return next(createHttpError(404, "Category not found"));
    }

    const isMenuItemPresent = await Menu.findOne({ name, category });
    if (isMenuItemPresent) {
      return next(createHttpError(400, "Menu item already exists!"));
    }

    const newMenuItem = new Menu(req.body);
    await newMenuItem.save();
    await newMenuItem.populate("category");

    res.status(201).json({
      success: true,
      message: "Menu item added successfully",
      data: newMenuItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all menu items
 * @route   GET /api/menu
 */
const getMenuItems = async (req, res, next) => {
  try {
    const { category, available } = req.query;
    let query = {};

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return next(createHttpError(400, "Invalid category id"));
      }
      query.category = category;
    }

    if (available !== undefined) {
      query.available = available === "true";
    }

    const menuItems = await Menu.find(query).populate("category");

    res.status(200).json({
      success: true,
      data: menuItems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single menu item
 * @route   GET /api/menu/:id
 */
const getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid menu id"));
    }

    const menuItem = await Menu.findById(id).populate("category");

    if (!menuItem) {
      return next(createHttpError(404, "Menu item not found"));
    }

    res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update menu item
 * @route   PUT /api/menu/:id
 */
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid menu id"));
    }

    const updatedMenu = await Menu.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category");

    if (!updatedMenu) {
      return next(createHttpError(404, "Menu item not found"));
    }

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      data: updatedMenu,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete menu item
 * @route   DELETE /api/menu/:id
 */
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid menu id"));
    }

    const deletedMenu = await Menu.findByIdAndDelete(id);

    if (!deletedMenu) {
      return next(createHttpError(404, "Menu item not found"));
    }

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get menu grouped by category
 * @route   GET /api/menu/by-category
 */
const getMenuByCategory = async (req, res, next) => {
  try {
    const categories = await Category.find();
    const menuByCategory = {};

    for (const category of categories) {
      const items = await Menu.find({
        category: category._id,
        available: true,
      }).populate("category");

      menuByCategory[category.name] = items;
    }

    res.status(200).json({
      success: true,
      data: menuByCategory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  getMenuByCategory,
};
