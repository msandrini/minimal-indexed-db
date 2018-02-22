/* global window */

const DB = {

	use: function useDB(dbName, key = 'id') {
		return new Promise((resolve, reject) => {
			const openDBRequest = window.indexedDB.open(dbName, 1);
			this.storeName = `${dbName}_store`;

			const _firstBuild = () => {
				this.db = openDBRequest.result;
				this.objectStore = this.db.createObjectStore(this.storeName, { keyPath: key });
			};

			const _successBuild = () => {
				resolve(this._getMethods());
			};

			const _errorBuild = (e) => {
				reject(new Error(e));
			};

			openDBRequest.onupgradeneeded = _firstBuild.bind(this);
			openDBRequest.onsuccess = _successBuild.bind(this);
			openDBRequest.onerror = _errorBuild.bind(this);
		});
	},

	check: function checkDB(dbName) {
		return new Promise((resolve, reject) => {
			const openDBRequest = window.indexedDB.open(dbName, 1);
			const _afterOpenCheck = () => {
				this.db = openDBRequest.result;
				const dbExists = Boolean(this.db && this.db.objectStoreNames.length);
				if (dbExists) {
					window.indexedDB.deleteDatabase(dbName);
				}
				resolve(dbExists);
			};
			const _errorCheck = (e) => {
				reject(new Error(e));
			};
			openDBRequest.onsuccess = _afterOpenCheck.bind(this);
			openDBRequest.onerror = _errorCheck.bind(this);
		});
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

	delete: function deleteDB() {
		this.db.deleteObjectStore(this.storeName);
	}

};

export default DB;
