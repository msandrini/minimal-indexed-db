/* global window */

const DB = {

	create: function createDB(dbName, key = 'id') {
		return new Promise((resolve, reject) => {
			this.openDBRequest = window.indexedDB.open(dbName, 1);
			this.storeName = `${dbName}_store`;

			const _firstBuild = () => {
				this.db = this.openDBRequest.result;
				this.objectStore = this.db.createObjectStore(this.storeName, { keyPath: key });
			};

			const _successBuild = () => {
				resolve(this);
			};

			const _errorBuild = (e) => {
				reject(new Error(e));
			};

			this.openDBRequest.onupgradeneeded = _firstBuild.bind(this);
			this.openDBRequest.onsuccess = _successBuild.bind(this);
			this.openDBRequest.onerror = _errorBuild.bind(this);
		});
	},

	use: function useDB(dbName) {
		return new Promise((resolve, reject) => {
			this.openDBRequest = window.indexedDB.open(dbName, 1);

			const _query = (method, readOnly = true, param = null) => {
				const permission = readOnly ? 'readonly' : 'readwrite';
				if (this.db.objectStoreNames.contains(this.storeName)) {
					const transaction = this.db.transaction(this.storeName, permission);
					const store = transaction.objectStore(this.storeName);
					const request = store[method](param);
					return new Promise((resolve, reject) => {
						request.onsuccess = (event) => {
							resolve(event.target.result);
						};
						request.onerror = (event) => {
							reject(event);
						};
					});
				}
				return Promise.reject(new Error('Store not found'));
			};

			const methods = {
				getEntry: key => _query('get', true, key),
				getAll: () => _query('getAll', true),
				put: entryData => _query('put', false, entryData),
				delete: key => _query('delete', false, key)
			};

			const _successBuild = () => {
				this.db = this.openDBRequest.result;
				resolve(methods);
			};

			const _errorBuild = (e) => {
				reject(new Error(e));
			};

			this.openDBRequest.onsuccess = _successBuild.bind(this);
			this.openDBRequest.onerror = _errorBuild.bind(this);

		});
	}

};

export default DB;
