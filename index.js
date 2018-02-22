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
				resolve(this._getMethods);
			};

			const _errorBuild = (e) => {
				reject(new Error(e));
			};

			this.openDBRequest.onupgradeneeded = _firstBuild.bind(this);
			this.openDBRequest.onsuccess = _successBuild.bind(this);
			this.openDBRequest.onerror = _errorBuild.bind(this);
		});
	},

	check: function checkDB() {
		return Boolean(this.db && this.db.objectStoreNames.include(this.storeName));
	},

	_query: function _queryDB(method, readOnly = true, param = null) {
		const permission = readOnly ? 'readonly' : 'readwrite';
		if (this.db.objectStoreNames.contains(this.storeName)) {
			const transaction = this.db.transaction(this.storeName, permission);
			const store = transaction.objectStore(this.storeName);
			const isMultiplePut = method === 'put' && param && typeof param.length !== 'undefined';
			let listener;
			if (isMultiplePut) {
				listener = transaction;
				param.forEach((entry) => {
					store.put(entry);
				});
			} else {
				listener = store[method](param);
			}
			return new Promise((resolve, reject) => {
				listener.oncomplete = (event) => {
					resolve(event.target.result);
				};
				listener.onsuccess = (event) => {
					resolve(event.target.result);
				};
				listener.onerror = (event) => {
					reject(event);
				};
			});
		}
		return Promise.reject(new Error('Store not found'));
	},

	_getMethods: function _getMethodsForDB() {
		return {
			getEntry: key => this._query('get', true, key),
			getAll: () => this._query('getAll', true),
			put: entryData => this._query('put', false, entryData),
			deleteEntry: key => this._query('delete', false, key)
		};
	},

	use: function useDB(dbName) {
		return new Promise((resolve, reject) => {
			this.openDBRequest = window.indexedDB.open(dbName, 1);

			const _successBuild = () => {
				this.db = this.openDBRequest.result;
				this.storeName = `${dbName}_store`;
				resolve(this._getMethods);
			};

			const _errorBuild = (e) => {
				reject(new Error(e));
			};

			this.openDBRequest.onsuccess = _successBuild.bind(this);
			this.openDBRequest.onerror = _errorBuild.bind(this);

		});
	},

	delete: function deleteDB() {
		this.db.deleteObjectStore(this.storeName);
	}

};

export default DB;
