const Table = require("../models/tableModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose")

const addTable = async (req, res, next) => {
  try {
    const { tableNo, seats } = req.body;
    const tenantId = req.user.tenantId;

    if (!tenantId) {
      return next(createHttpError(400, "User is not associated with a tenant"));
    }

    if (!tableNo) {
      const error = createHttpError(400, "Please provide table No!");
      return next(error);
    }

    const isTablePresent = await Table.findOne({ tableNo, tenantId });

    if (isTablePresent) {
      const error = createHttpError(400, "Table already exist!");
      return next(error);
    }

    const newTable = new Table({ tableNo, seats, tenantId });
    await newTable.save();
    res
      .status(201)
      .json({ success: true, message: "Table added!", data: newTable });
  } catch (error) {
    next(error);
  }
};

const getTables = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;

    if (!tenantId) {
      return next(createHttpError(400, "User is not associated with a tenant. Please ensure you're logged in with a restaurant account, not a super admin account. If you're a restaurant admin, your account may need to be recreated."));
    }

    const tables = await Table.find({ tenantId }).populate({
      path: "currentOrder",
      select: "customerDetails"
    });
    res.status(200).json({ success: true, data: tables });
  } catch (error) {
    next(error);
  }
};

const updateTable = async (req, res, next) => {
  try {
    const { tableNo, seats, status, orderId } = req.body;
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    if (!tenantId) {
      return next(createHttpError(400, "User is not associated with a tenant"));
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(404, "Invalid id!");
      return next(error);
    }

    const updateData = {};
    if (tableNo) updateData.tableNo = tableNo;
    if (seats) updateData.seats = seats;
    if (status) updateData.status = status;
    if (orderId) updateData.orderId = orderId;
    if (orderId === null) updateData.currentOrder = null;


    const table = await Table.findOneAndUpdate(
      { _id: id, tenantId },
      updateData,
      { new: true }
    );

    if (!table) {
      const error = createHttpError(404, "Table not found!");
      return next(error);
    }

    res
      .status(200)
      .json({ success: true, message: "Table updated!", data: table });
  } catch (error) {
    next(error);
  }
};

const deleteTable = async (req, res, next) => {
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

    const table = await Table.findOneAndDelete({ _id: id, tenantId });

    if (!table) {
      const error = createHttpError(404, "Table not found!");
      return next(error);
    }

    res
      .status(200)
      .json({ success: true, message: "Table deleted!", data: table });
  } catch (error) {
    next(error);
  }
};

module.exports = { addTable, getTables, updateTable, deleteTable };