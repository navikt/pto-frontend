import { NextFunction, Request, Response } from 'express';
import {
	createJwksClient,
	createKeyRetriever,
	createVerifyOptions,
	getCookieValue,
	getJwksUrlFromDiscoveryEndpoint,
	verifyJwtToken
} from '../utils/auth-utils';
import { getFullUrl } from '../utils/utils';
import { AppConfig } from '../config/app-config';

export interface AuthMiddlewareConfig {
	oidcDiscoveryUrl: string;
	oidcClientId: string;
	loginRedirectUrl: string;
	tokenCookieName: string;
	loginLevel: number;
}

const RETURN_TO = '{RETURN_TO_URL}';

function createLoginRedirectUrl(returnToUrl: string, loginRedirectUrl: string, minLoginLevel: number): string {
	let lenke = loginRedirectUrl.replace(RETURN_TO, encodeURIComponent(returnToUrl));
	let url = new URL(lenke);
	url.searchParams.set('level', 'Level'+ minLoginLevel);
	return url.toString()
}

export function createAuthConfig(config: AppConfig): AuthMiddlewareConfig {
	if (!config.loginRedirectUrl) {
		throw new Error('Cannot enforce login. Login redirect url is missing');
	}

	if (!config.oidcDiscoveryUrl) {
		throw new Error('Cannot enforce login. OIDC discovery url is missing');
	}

	if (!config.oidcClientId) {
		throw new Error('Cannot enforce login. OIDC client id is missing');
	}

	if (!config.tokenCookieName) {
		throw new Error('Cannot enforce login. Token cookie name is missing');
	}

	return {
		oidcClientId: config.oidcClientId,
		oidcDiscoveryUrl: config.oidcDiscoveryUrl,
		loginRedirectUrl: config.loginRedirectUrl,
		tokenCookieName: config.tokenCookieName,
		loginLevel: config.loginLevel
	};
}

function hasMinLevel(acr: string, level: number) {
	return acr === 'Level4' || level === 3 && acr === 'Level3';
}

export const authenticationWithLoginRedirect = async (config: AuthMiddlewareConfig) => {
	const discoveryData = await getJwksUrlFromDiscoveryEndpoint(config.oidcDiscoveryUrl);
	const jwksClient = createJwksClient(discoveryData.jwks_uri);
	const verifyOptions = createVerifyOptions(config.oidcClientId, discoveryData.issuer);
	const keyRetriever = createKeyRetriever(jwksClient);
	const redirectToLogin = (req: Request, res: Response) => res.redirect(createLoginRedirectUrl(getFullUrl(req), config.loginRedirectUrl, config.loginLevel));

	return (req: Request, res: Response, next: NextFunction) => {
		const token = getCookieValue(req, config.tokenCookieName);

		if (!token) {
			redirectToLogin(req, res);
		} else {
			verifyJwtToken(token, keyRetriever, verifyOptions)
				.then(decodeed => {
					if(!hasMinLevel(decodeed.acr, config.loginLevel)) {
						redirectToLogin(req, res)
					} else {
						next();
					}
				})
				.catch(() => redirectToLogin(req, res));
		}

	}
};

