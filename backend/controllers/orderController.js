const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const { default: mongoose } = require("mongoose");

const addOrder = async (req, res, next) => {
  try {
    console.log("ORDER BODY:", req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
      return next(createHttpError(400, "Request body is empty"));
    }

    const tenantId = req.user.tenantId;

    if (!tenantId) {
      return next(createHttpError(400, "User is not associated with a tenant"));
    }

    if (req.body.table && !mongoose.Types.ObjectId.isValid(req.body.table)) {
      return next(createHttpError(400, "Invalid table id"));
    }

    const order = new Order({
      ...req.body,
      tenantId,
      orderDate: new Date(),
    });

    await order.save();

    if (order.table) {
      await Table.findOneAndUpdate(
        { _id: order.table, tenantId },
        {
          status: "Occupied",
          currentOrder: order._id,
        },
        { new: true }
      );
    }

    res.status(201).json({
      success: true,
      message: "Order created",
      data: order,
    });
  } catch (error) {
    console.error("ADD ORDER ERROR:", error);
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    if (!tenantId) {
      return next(createHttpError(400, "User is not associated with a tenant"));
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(404, "Invalid id!");
      return next(error);
    }

    const order = await Order.findOne({ _id: id, tenantId });
    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;

    if (!tenantId) {
      return next(createHttpError(400, "User is not associated with a tenant"));
    }

    const orders = await Order.find({ tenantId }).populate("table");
    res.status(200).json({ data: orders });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    if (!tenantId) {
      return next(createHttpError(400, "User is not associated with a tenant"));
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(404, "Invalid id!");
      return next(error);
    }

    const order = await Order.findOneAndUpdate(
      { _id: id, tenantId },
      { orderStatus },
      { new: true }
    );

    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    if (orderStatus === "Completed" && order.table) {
      await Table.findOneAndUpdate(
        { _id: order.table, tenantId },
        {
          status: "Available",
          currentOrder: null,
        }
      );
    }

    res
      .status(200)
      .json({ success: true, message: "Order updated", data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { addOrder, getOrderById, getOrders, updateOrder };