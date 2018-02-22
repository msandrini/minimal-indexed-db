import DB from './index';

/* globals jest, describe, it, expect, window */

describe('MinimalIndexedDB', () => {

	it('the service should have two methods', () => {
		expect(DB).toEqual(expect.any(Object));
		expect(DB.create).toBeDefined();
		expect(DB.use).toBeDefined();
	});

	describe('create DB flow', () => {

		const open = () => ({
			onupgradeneeded: jest.fn(),
			onsuccess: jest.fn(),
			onerror: jest.fn(),
			result: {
				createObjectStore: jest.fn((storeName, providedOptions) => ({
					storeName,
					providedOptions
				}))
			}
		});

		window.indexedDB = { open };

		it('should return a promise', () => {
			expect(DB.create('sample')).toBeInstanceOf(Promise);
		});
		it('should make a DB and a store', () => {
			DB.create('sample');
			DB.openDBRequest.onupgradeneeded();
			expect(DB.db).toMatchSnapshot();
			expect(DB.objectStore).toMatchSnapshot();
		});
		it('should resolve when successful', (done) => {
			const dbInstance = DB.create('sample');
			dbInstance.then(() => {
				expect(true).toBe(true);
				done();
			});
			DB.openDBRequest.onsuccess();
		});
		it('should reject when having an error', (done) => {
			const dbInstance = DB.create('sample');
			dbInstance.catch((e) => {
				expect(e.message).toBe('error');
				done();
			});
			DB.openDBRequest.onerror('error');
		});

	});

	describe('use DB flow', () => {

		it('should return promise');
		it('should reject on error');
		it('should resolve with 4 methods');

		describe('should the DB handling methods do what they mean', () => {

			it('getEntry');
			it('getAll');
			it('put');
			it('delete');

		});

	});

});
