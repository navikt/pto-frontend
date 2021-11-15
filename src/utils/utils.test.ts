import { hoursToMs, hoursToSeconds, isRequestingFile, minutesToSeconds, removeQueryParams, stripPrefix } from './utils';
import {createAppConfig, substituteEnvVariables} from "../config/app-config";

describe('hoursToMs', () => {
	it('should convert hours to milliseconds', () => {
		expect(hoursToMs(1)).toBe(3600000);
	})
});

describe('hoursToSeconds', () => {
	it('should convert hours to seconds', () => {
		expect(hoursToSeconds(2)).toBe(7200);
	})
});

describe('minutesToSeconds', () => {
	it('should convert minutes to seconds', () => {
		expect(minutesToSeconds(5)).toBe(300);
	})
});

describe('isRequestingFile', () => {
	it('should check if path is requesting file', () => {
		expect(isRequestingFile('/some/path/img.png')).toBe(true);
	});

	it('should check if path is requesting file with query params', () => {
		expect(isRequestingFile('/some/path/img.png?hello=world')).toBe(true);
	});

	it('should check if path is NOT requesting file', () => {
		expect(isRequestingFile('')).toBe(false);
		expect(isRequestingFile('/some/path/img')).toBe(false);
	});
});

describe('removeQueryParams', () => {
	it('should remove query params', () => {
		expect(removeQueryParams('/some/path/test?hello=world')).toBe('/some/path/test');
	});

	it('should not change if no query params', () => {
		expect(removeQueryParams('/some/path/test')).toBe('/some/path/test');
	});
});

describe('stripPrefix', () => {
	it('should strip prefix', () => {
		expect(stripPrefix('/test/path', '/test')).toBe('/path');
		expect(stripPrefix('/test/path', '/test1')).toBe('/test/path');
	})
});

describe('substituteEnvVariables', () => {
	it('should not substitute environment variables', () => {
		let key = 'to';
		let value = 'http://aktivitetsplan.nav.no/';
		expect(substituteEnvVariables(key, value)).toBe('http://aktivitetsplan.nav.no/');
	});
	it('should not substitute environment variables when missing environment variable', () => {
		let key = 'to';
		let value = '{{AKTIVITETSPLAN_URL}}';
		expect(substituteEnvVariables(key, value)).toBe('{{AKTIVITETSPLAN_URL}}');
	});
	it('should substitute environment variables', () => {
		let key = 'to';
		let value = '{{AKTIVITETSPLAN_URL}}';
		process.env.AKTIVITETSPLAN_URL = 'test';
		expect(substituteEnvVariables(key, value)).toBe('test');
	});
});

describe('createAppConfig', () => {
	it('create app config with substituions', () => {
		process.env.JSON_CONFIG = '{' +
			'"redirects": [' +
			'              {' +
			'                "from": "/api/auth",' +
			'                "to": "/auth/info"' +
			'              },' +
			'              {' +
			'                "from": "/aktivitetsplan",' +
			'                "to": "{{AKTIVITETSPLAN_URL}}"' +
			'              },' +
			'              {' +
			'                "from": "/dittnav",' +
			'                "to": "{{DITTNAV_LINK_URL}}"' +
			'              }' +
			'	]' +
			'}';
		process.env.AKTIVITETSPLAN_URL = 'http://aktivitetsplan.nav.no/';
		process.env.DITTNAV_LINK_URL = 'http://dittnav.nav.no/';
		let appConfig = createAppConfig();
		if (appConfig.redirects) {
			expect(appConfig.redirects[1].to).toBe('http://aktivitetsplan.nav.no/');
			expect(appConfig.redirects[2].to).toBe('http://dittnav.nav.no/');
		}
	});
});