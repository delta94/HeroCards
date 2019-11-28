import { Platform } from 'react-native';
import Config from 'react-native-config';
import * as Keychain from 'react-native-keychain';
import { authorize, refresh, revoke, prefetchConfiguration, AuthorizeResult, RefreshResult } from 'react-native-app-auth';

const config: any = {
  clientId: Config.OAUTH_CLIENT_ID,
  clientSecret: Config.OAUTH_CLIENT_SECRET,
  redirectUrl: 'arkhamcards://auth/redirect',
  serviceConfiguration: {
    authorizationEndpoint: `${Config.OAUTH_SITE}oauth/v2/auth`,
    tokenEndpoint: `${Config.OAUTH_SITE}oauth/v2/token`,
    revocationEndpoint: `${Config.OAUTH_SITE}oauth/v2/revoke`,
  },
};

function saveAuthResponse(response: AuthorizeResult | RefreshResult) {
  const serialized = JSON.stringify(response);
  return Keychain.setGenericPassword('MarvelCDB', serialized)
    .then(() => {
      return response.accessToken;
    });
}

export function getRefreshToken() {
  return Keychain.getGenericPassword()
    .then(creds => {
      if (creds) {
        const data = JSON.parse(creds.password);
        return data.refreshToken;
      }
      return null;
    });
}

export function getAccessToken() {
  return Keychain.getGenericPassword()
    .then(creds => {
      if (creds) {
        const data = JSON.parse(creds.password);
        const nowSeconds = (new Date()).getTime() / 1000;
        const expiration = new Date(data.accessTokenExpirationDate).getTime() / 1000;
        if (data.refreshToken && expiration < nowSeconds) {
          return refresh(config, { refreshToken: data.refreshToken })
            .then(
              saveAuthResponse,
              () => {
                // Null token will produce an error where it is used.
                return null;
              });
        }
        return data.accessToken;
      }
      return null;
    });
}

interface SignInResult {
  success: boolean;
  error?: string | Error;
}

export function prefetch(): Promise<void> {
  if (Platform.OS === 'android') {
    return prefetchConfiguration({
      warmAndPrefetchChrome: true,
      ...config,
    });
  }
  return Promise.resolve();
}

export function signInFlow(): Promise<SignInResult> {
  return authorize(config)
    .then(saveAuthResponse)
    .then(() => {
      return {
        success: true,
      };
    }, (error: Error) => {
      return {
        success: false,
        error: error.message || error,
      };
    });
}

export function signOutFlow() {
  return getAccessToken().then(accessToken => {
    if (accessToken) {
      revoke(config, { tokenToRevoke: accessToken });
    }
  }, () => {
    // Ignore error.
  }).then(() => {
    return getRefreshToken().then(refreshToken => {
      if (refreshToken) {
        revoke(config, { tokenToRevoke: refreshToken });
      }
    });
  }, () => {
    // Ignore error;
  }).then(() => {
    Keychain.resetGenericPassword();
  });
}

export default {
  prefetch,
  signInFlow,
  signOutFlow,
  getAccessToken,
};
