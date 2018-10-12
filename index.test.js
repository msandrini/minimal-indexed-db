const DB = require('./index');

/* globals jest, describe, it, expect, window */

describe('MinimalIndexedDB', () => {

	it('the service should be a function', () => {
		expect(DB).toEqual(expect.any(Function));
	});

	const listener = {
		oncomplete: null,
		onsuccess: null,
		onerror: null
	};

	const store = {
		get: jest.fn(() => listener),
		getAll: jest.fn(() => listener),
		put: jest.fn(() => listener),
		delete: jest.fn(() => listener),
		clear: jest.fn(() => listener),
		count: jest.fn(() => listener)
	};

	const transaction = {
		objectStore: jest.fn(() => store),
		oncomplete: null,
		onsuccess: null,
		onerror: null
	};

	const openObj = {
		onupgradeneeded: jest.fn(),
		onsuccess: jest.fn(),
		onerror: jest.fn(),
		result: {
			createObjectStore: jest.fn((storeName, providedOptions) => ({
				storeName,
				providedOptions
			})),
			objectStoreNames: {
				contains: jest.fn(() => true)
			},
			transaction: jest.fn(() => transaction)
		}
	};

	window.indexedDB = { open: () => openObj };

	it('should return a promise', () => {
		expect(DB('sample', 'id')).toBeInstanceOf(Promise);
	});

	it('should resolve when successful (with all handling methods)', (done) => {
		const dbInstance = DB('sample', 'id');
		dbInstance.then((methods) => {
			expect(methods).toMatchSnapshot();
			done();
		});
		openObj.onupgradeneeded();
		openObj.onsuccess();
	});

	it('should reject when having an error', (done) => {
		const dbInstance = DB('sample');
		dbInstance.catch((e) => {
			expect(e.message).toBe('error');
			done();
		});
		openObj.onerror('error');
	});

	describe('should the DB handling methods do what they mean', () => {

		const testHandlingMethods = (done, testCallback) => {
			const dbInstance = DB('sample', 'id');
			dbInstance.then((methods) => {
				testCallback(methods);
				done();
			});
			openObj.onupgradeneeded();
			openObj.onsuccess();
		};

		it('store names check', (done) => {
			testHandlingMethods(done, (methods) => {
				methods.getEntry();
				expect(openObj.result.objectStoreNames.contains)
					.toHaveBeenCalledWith('sample_store');
			});
		});
		it('init store', (done) => {
			testHandlingMethods(done, (methods) => {
				methods.getEntry();
				expect(transaction.objectStore).toHaveBeenCalledWith('sample_store');
			});
		});

		it('getEntry', (done) => {
			testHandlingMethods(done, (methods) => {
				methods.getEntry(1);
				expect(openObj.result.transaction)
					.toHaveBeenCalledWith('sample_store', 'readonly');
				expect(store.get).toHaveBeenCalledWith(1);
			});
		});

		it('getAll', (done) => {
			testHandlingMethods(done, (methods) => {
				methods.getAll();
				expect(openObj.result.transaction)
					.toHaveBeenCalledWith('sample_store', 'readonly');
				expect(store.getAll).toHaveBeenCalledWith(null);
			});
		});
		it('put', (done) => {
			testHandlingMethods(done, (methods) => {
				methods.put({ id: 2, name: 'John' });
				expect(openObj.result.transaction)
					.toHaveBeenCalledWith('sample_store', 'readwrite');
				expect(store.put).toHaveBeenCalledWith({ id: 2, name: 'John' });
			});
		});
		it('put (with multiple values)', (done) => {
			store.put.mockReset();
			testHandlingMethods(done, (methods) => {
				methods.put([{ id: 3, name: 'Ted' }, { id: 4, name: 'Brian' }]);
				expect(openObj.result.transaction)
					.toHaveBeenCalledWith('sample_store', 'readwrite');
				expect(store.put).toHaveBeenCalledWith({ id: 3, name: 'Ted' });
				expect(store.put).toHaveBeenCalledWith({ id: 4, name: 'Brian' });
				expect(store.put).toHaveBeenCalledTimes(2);
			});
		});
		it('add (alias for put)', (done) => {
			testHandlingMethods(done, (methods) => {
				methods.add({ id: 2, name: 'John' });
				expect(openObj.result.transaction)
					.toHaveBeenCalledWith('sample_store', 'readwrite');
				expect(store.put).toHaveBeenCalledWith({ id: 2, name: 'John' });
			});
		});
		it('deleteEntry', (done) => {
			testHandlingMethods(done, (methods) => {
				methods.deleteEntry(2);
				expect(openObj.result.transaction)
					.toHaveBeenCalledWith('sample_store', 'readwrite');
				expect(store.delete).toHaveBeenCalledWith(2);
			});
		});
		it('deleteAll', (done) => {
			testHandlingMethods(done, (methods) => {
				methods.deleteAll();
				expect(openObj.result.transaction)
					.toHaveBeenCalledWith('sample_store', 'readwrite');
				expect(store.clear).toHaveBeenCalledWith(null);
			});
		});
		it('flush (alias for deleteAll)', (done) => {
			testHandlingMethods(done, (methods) => {
				methods.flush();
				expect(openObj.result.transaction)
					.toHaveBeenCalledWith('sample_store', 'readwrite');
				expect(store.clear).toHaveBeenCalledWith(null);
			});
		});
		it('count', (done) => {
			testHandlingMethods(done, (methods) => {
				methods.count();
				expect(openObj.result.transaction)
					.toHaveBeenCalledWith('sample_store', 'readonly');
				expect(store.count).toHaveBeenCalledWith(null);
			});
		});

		describe('listeners to the handling methods', () => {
			it('onsuccess', (done) => {
				const dbInstance = DB('sample', 'id');
				dbInstance.then((methods) => {
					methods.getEntry(1).then((result) => {
						expect(result).toEqual('sample result');
						done();
					});
					listener.onsuccess({ target: { result: 'sample result' } });
				});
				openObj.onupgradeneeded();
				openObj.onsuccess();
			});

			it('oncomplete', (done) => {
				const dbInstance = DB('sample', 'id');
				dbInstance.then((methods) => {
					methods.getAll().then((result) => {
						expect(result).toEqual('sample result 2');
						done();
					});
					listener.oncomplete({ target: { result: 'sample result 2' } });
				});
				openObj.onupgradeneeded();
				openObj.onsuccess();
			});

			it('onerror', (done) => {
				const dbInstance = DB('sample', 'id');
				dbInstance.then((methods) => {
					methods.getEntry(1).catch((error) => {
						expect(error.message).toEqual('sample error');
						done();
					});
					listener.onerror(new Error('sample error'));
				});
				openObj.onupgradeneeded();
				openObj.onsuccess();
			});
		});
	});

	it('should reject when store is not found (after its initialization)', (done) => {
		const dbInstance = DB('sample');
		dbInstance.then((methods) => {
			openObj.result.objectStoreNames.contains = () => false;
			methods.getEntry().catch((error) => {
				expect(error.message).toEqual('Store not found');
				done();
			});
		});
		openObj.onupgradeneeded();
		openObj.onsuccess();
	});

});
