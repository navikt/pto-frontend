import helmet from 'helmet';

const ALLOWED_DOMAINS = ["*.nav.no", "*.adeo.no"];
const GOOGLE_ANALYTICS_DOMAIN = "*.google-analytics.com";
const GOOGLE_TAG_MANAGER_DOMAIN = "*.googletagmanager.com";
const ACCOUNT_PSPLUGIN_DOMAIN = "account.psplugin.com";
const NAV_PSPLUGIN_DOMAIN = "nav.psplugin.com";
const HOTJAR_DOMAIN = "*.hotjar.com";
const VARS_HOTJAR_DOMAIN = "vars.hotjar.com";
const VIDEO_QBRICK_DOMAIN = "video.qbrick.com";

/**
 * Det hadde vært best å fjerne 'unsafe-inline' fra scriptSrc, men NAV dekoratøren kjører inline scripts som ikke vil fungere uten dette.
 * Denne reglen vil også treffe applikasjoner som bruker create-react-app siden den lager et inline script for å bootstrape appen.
 * Dette kan fikses med å sette "INLINE_RUNTIME_CHUNK=false" i en .env fil.
 *
 * unsafe-eval i scriptSrc blir brukt av account.psplugin.com. Hvis vi ikke trenger psplugin så bør dette fjernes.
 */

export function helmetMiddleware() {
	return helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				connectSrc: ["'self'"].concat(ALLOWED_DOMAINS, GOOGLE_ANALYTICS_DOMAIN, NAV_PSPLUGIN_DOMAIN),
				baseUri: ["'self'"],
				blockAllMixedContent: [],
				fontSrc: ["'self'", "https:", "data:"].concat(ALLOWED_DOMAINS),
				frameAncestors: ["'self'"],
				frameSrc: [VARS_HOTJAR_DOMAIN, VIDEO_QBRICK_DOMAIN],
				objectSrc: ["'none'"],
				scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"].concat(
					ALLOWED_DOMAINS, GOOGLE_ANALYTICS_DOMAIN,
					GOOGLE_TAG_MANAGER_DOMAIN, ACCOUNT_PSPLUGIN_DOMAIN, HOTJAR_DOMAIN
				),
				scriptSrcAttr: ["'none'"],
				styleSrc: ["'self'", "https:", "'unsafe-inline'"].concat(ALLOWED_DOMAINS),
				imgSrc: ["'self'", "data:"].concat(ALLOWED_DOMAINS, GOOGLE_ANALYTICS_DOMAIN), // analytics sends information by loading images with query params
				upgradeInsecureRequests: []
			}
		}
	});
}

