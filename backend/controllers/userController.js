const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const Tenant = require('../models/tenantModel');

const register = async (req, res, next) => {
    try {
        const { name, phone, email, password, role } = req.body;

        if (!name || !phone || !email || !password || !role) {
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        if (role === 'admin') {
            const error = createHttpError(403, "Cannot create another admin user.");
            return next(error);
        }

        const isUserPresent = await User.findOne({ email });
        if (isUserPresent) {
            const error = createHttpError(400, "User with this email already exists!");
            return next(error);
        }

        const { tenantId } = req.user;

        const user = { name, phone, email, password, role, tenantId };
        const newUser = new User(user);
        await newUser.save();

        res.status(201).json({ success: true, message: "New user created!", data: newUser });
    } catch (error) {
        next(error);
    }
};


const login = async (req, res, next) => {
    try {
        const { email, password, tenantId, tenantSlug } = req.body;

        if(!email || !password) {
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        const isUserPresent = await User.findOne({email});
        if(!isUserPresent){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        if (tenantId || tenantSlug) {
            let tenant = null;
            if (tenantId) tenant = await Tenant.findById(tenantId).lean();
            if (!tenant && tenantSlug) tenant = await Tenant.findOne({ slug: tenantSlug }).lean();
            if (!tenant) {
                const error = createHttpError(404, 'Tenant not found');
                return next(error);
            }

            const isOwner = tenant.owner && tenant.owner.toString() === isUserPresent._id.toString();
            const isMember = isUserPresent.tenantId && isUserPresent.tenantId.toString() === tenant._id.toString();
            if (!isOwner && !isMember) {
                const error = createHttpError(403, 'User does not belong to the specified tenant');
                return next(error);
            }
        }

        const isMatch = await bcrypt.compare(password, isUserPresent.password);
        if(!isMatch){
            const error = createHttpError(401, "Invalid Credentials");
            return next(error);
        }

        const accessToken = jwt.sign({_id: isUserPresent._id}, config.accessTokenSecret, {
            expiresIn : '1d'
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 *24 * 30,
            httpOnly: true,
            sameSite: 'none',
            secure: true
        })

        res.status(200).json({success: true, message: "User login successfully!", 
            data: isUserPresent
        });
    } catch (error) {
        next(error);
    }
}

const getUserData = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({success: true, data: user});
    } catch (error) {
        next(error);
    }
}

const logout = async (req, res, next) => {
    try {
        res.clearCookie('accessToken');
        res.status(200).json({success: true, message: "User logout successfully!"});
    } catch (error) {
        next(error);
    }
}

const getAllUsers = async (req, res, next) => {
    try {
        const { tenantId } = req.user;
        if (!tenantId) {
            return next(createHttpError(400, "Admin user is not associated with a tenant."));
        }
        const users = await User.find({ tenantId: tenantId });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getUserData, logout, getAllUsers }