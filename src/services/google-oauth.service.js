import { OAuth2Client } from 'google-auth-library';
import { getConfig } from '../config/env.js';
import { BadRequestError } from '../utils/errors.js';

const GOOGLE_USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v2/userinfo';

export class GoogleOAuthService {
  constructor({ client, config = getConfig() } = {}) {
    const { clientId, clientSecret, redirectUri } = config.googleOAuth ?? {};

    if (!clientId) {
      throw new Error('Google OAuth clientId is required. Check env configuration.');
    }

    this.client = client ?? new OAuth2Client(clientId, clientSecret, redirectUri);
    this.config = config;
  }

  async verifyIdToken(idToken) {
    if (!idToken) {
      throw new BadRequestError('Google ID token is required');
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.config.googleOAuth.clientId,
      });

      return this.#mapPayload(ticket.getPayload());
    } catch (error) {
      throw new BadRequestError('Invalid Google ID token');
    }
  }

  generateAuthUrl({ state } = {}) {
    const params = {
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'openid',
      ],
      prompt: 'consent',
    };

    if (state) {
      params.state = state;
    }

    return this.client.generateAuthUrl(params);
  }

  async getUserFromCode(code) {
    if (!code) {
      throw new BadRequestError('Google authorization code is required');
    }

    try {
      const { tokens } = await this.client.getToken(code);
      await this.client.setCredentials(tokens);
      const { data } = await this.client.request({ url: GOOGLE_USERINFO_ENDPOINT });
      return this.#mapPayload({
        sub: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture,
        email_verified: data.verified_email,
      });
    } catch (error) {
      throw new BadRequestError('Failed to exchange Google authorization code');
    }
  }

  #mapPayload(payload) {
    if (!payload?.email) {
      throw new BadRequestError('Google account email is required');
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      fullName: payload.name,
      profileImageUrl: payload.picture,
      emailVerified: Boolean(payload.email_verified),
    };
  }
}
