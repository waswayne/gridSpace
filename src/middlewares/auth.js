import jwt from 'jsonwebtoken';
import { getConfig } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { UserModel } from '../models/user.model.js';

const config = getConfig();

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing');
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, config.auth.jwtSecret);

    const user = await UserModel.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new UnauthorizedError(error.message));
  }
};

export const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    return next();
  };
};
