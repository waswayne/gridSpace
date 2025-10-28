import { logger } from '../config/logger.js';
import { ForbiddenError, BadRequestError } from '../utils/errors.js';

const MAX_ACTIVE_SPACES_PER_HOST = 10;

let workspaceServiceRef = null;

export const initHostMiddleware = ({ workspaceService } = {}) => {
  if (workspaceService) {
    workspaceServiceRef = workspaceService;
  }
};

const ensureWorkspaceService = () => {
  if (!workspaceServiceRef) {
    throw new Error('Host middleware requires workspaceService. Call initHostMiddleware first.');
  }
};

export const verifyHostStatus = (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ForbiddenError('Access denied. Authentication required.'));
    }

    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.role !== 'host') {
      return next(new ForbiddenError('Access denied. Host role required for this action.'));
    }

    if (!req.user.onboardingCompleted) {
      return next(
        new ForbiddenError('Please complete your host onboarding before performing this action.')
      );
    }

    logger.info('Host status verified', {
      userId: req.user._id,
      role: req.user.role,
      onboardingCompleted: req.user.onboardingCompleted,
    });

    return next();
  } catch (error) {
    return next(error);
  }
};

export const checkSpaceLimit = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'host') {
      return next();
    }

    ensureWorkspaceService();

    const activeCount = await workspaceServiceRef.countActiveHostWorkspaces(req.user._id);

    if (activeCount >= MAX_ACTIVE_SPACES_PER_HOST) {
      logger.warn('Host space limit exceeded', {
        hostId: req.user._id,
        activeCount,
        maxSpaces: MAX_ACTIVE_SPACES_PER_HOST,
      });

      return next(
        new BadRequestError(
          `You have reached the maximum limit of ${MAX_ACTIVE_SPACES_PER_HOST} active spaces. Please deactivate some spaces before creating new ones.`
        )
      );
    }

    logger.info('Host space limit check passed', {
      hostId: req.user._id,
      activeCount,
      maxSpaces: MAX_ACTIVE_SPACES_PER_HOST,
    });

    return next();
  } catch (error) {
    return next(error);
  }
};

export const checkHostPaymentEligibility = (req, res, next) => {
  try {
    if (req.user?.role !== 'host') {
      return next();
    }

    // Placeholder for future payment setup verification.
    const paymentSetupComplete = true;

    if (!paymentSetupComplete) {
      return next(
        new ForbiddenError(
          'Please complete your payment setup to receive bookings and payments.'
        )
      );
    }

    logger.info('Host payment eligibility verified', {
      userId: req.user._id,
    });

    return next();
  } catch (error) {
    return next(error);
  }
};

export const verifyHostSpaceAccess = async (req, res, next) => {
  try {
    const spaceId = req.params?.id;

    if (!spaceId) {
      return next(new BadRequestError('Space ID is required.'));
    }

    if (req.user?.role === 'admin') {
      return next();
    }

    ensureWorkspaceService();

    const space = await workspaceServiceRef.getWorkspaceById(spaceId);

    if (!space || String(space.hostId?._id ?? space.hostId) !== String(req.user._id)) {
      logger.warn('Host space access verification failed', {
        hostId: req.user?._id,
        spaceId,
      });

      return next(
        new ForbiddenError("Access denied. You don't own this space or it's not active.")
      );
    }

    logger.info('Host space access verified', {
      hostId: req.user._id,
      spaceId,
    });

    req.space = space;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const validateHostSpaceCreation = [
  verifyHostStatus,
  checkSpaceLimit,
  checkHostPaymentEligibility,
];

export const validateHostSpaceManagement = [verifyHostStatus, verifyHostSpaceAccess];
