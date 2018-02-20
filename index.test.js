import { IDBFactory, reset } from 'shelving-mock-indexeddb';

import DB from './index';

/* globals jest, describe, it, expect, beforeEach, afterEach, window */

window.indexedDB = new IDBFactory();

beforeEach(() => reset());
afterEach(() => reset());
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.runAllTimers());

const sampleDBInit = {
	name: 'sample',
	key: 'key',
	data: [
		{ id: 1, value: 'one' },
		{ id: 2, value: 'two' },
		{ id: 3, value: 'three' }
	]
};

describe('MinimalIndexedDB', () => {

	it('the class should be instantiated', () => {
		const dbPromise = new DB('sample', 'key', []);
		expect(typeof dbPromise === 'object').toBeTruthy();
	});

	// it('the class should be instantiated (alternative init)', () => {
	// 	const dbPromise = new DB(sampleDBInit);
	// 	expect(typeof dbPromise === 'object').toBeTruthy();
	// });

});
