import Cookies from 'universal-cookie';
import { getAuthService } from '@edx/frontend-platform/auth';

export const getJwtToken = async () => {
  try {
    // Make sure token is up-to-date by get token and refresh if needed, after this, cookie will be updated
    const authService = getAuthService();
    await authService.jwtTokenService.getJwtToken();

    const cookies = new Cookies();
    return cookies.get(authService.jwtTokenService.tokenCookieName);
  } catch (error) {
    // If something went wrong during token refreshing or authentication, the service will throw an error
    // In that case, we return null here
    return null;
  }
};
