const Category = require("../models/categoryModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

// Create a new category
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const tenantId = req.user.tenantId;

    if (!tenantId) {
      return next(createHttpError(400, "User is not associated with a tenant"));
    }

    if (!name) {
      return next(createHttpError(400, "Category name is required"));
    }

    const category = new Category({ name, description, tenantId });
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// Get all categories
const getAllCategories = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;

    if (!tenantId) {
      return next(createHttpError(400, "User is not associated with a tenant"));
    }

    const categories = await Category.find({ tenantId });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// Update a category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const tenantId = req.user.tenantId;

    if (!tenantId) {
      return next(createHttpError(400, "User is not associated with a tenant"));
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid category ID"));
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id, tenantId },
      { name, description },
      { new: true }
    );

    if (!updatedCategory) {
      return next(createHttpError(404, "Category not found"));
    }

    res.status(200).json({ success: true, data: updatedCategory });
  } catch (error) {
    next(error);
  }
};

// Delete a category
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    if (!tenantId) {
      return next(createHttpError(400, "User is not associated with a tenant"));
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid category ID"));
    }

    const deletedCategory = await Category.findOneAndDelete({ _id: id, tenantId });

    if (!deletedCategory) {
      return next(createHttpError(404, "Category not found"));
    }

    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
