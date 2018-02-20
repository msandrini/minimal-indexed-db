import DB from './index';

/* globals jest, describe, it, expect, window */

window.indexedDB = {
	open: jest.fn(() => ({
		onsuccess: jest.fn(),
		onupgradeneeded: jest.fn()
	}))
};

describe('MinimalIndexedDB', () => {

	it('the class should be instantiated', () => {
		const db = new DB('sample', 'key', [{ key: 1, value: 1 }]);
		expect(typeof db === 'object').toBeTruthy();
	});

	it('the class should be instantiated (alternative init)', () => {
		const db = new DB({ name: 'sample', key: 'key', data: [{ key: 1, value: 1 }] });
		expect(typeof db === 'object').toBeTruthy();
	});

});
