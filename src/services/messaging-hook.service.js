import { logger } from '../config/logger.js';

// Stubbed integration points for future messaging module. Keeps side effects centralized.
export class MessagingHookService {
  onUserEmailVerified(user) {
    logger.info('Messaging hook: user email verified', { userId: user.id });
  }

  onUserOnboarded(user) {
    logger.info('Messaging hook: user completed onboarding', { userId: user.id, role: user.role });
  }
}
