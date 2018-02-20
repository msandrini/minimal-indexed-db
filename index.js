/* global window */

const _getArguments = (args) => {
	if (typeof args[0] === 'string') {
		const [name, key, data] = args;
		return { name, key, data };
	}
	return args[0];
};

export default class DB {

	constructor(...args) {
		this.db = null;
		this.objectStore = null;
		this.initResolve = () => {};
		this.initReject = () => {};

		const { name, key, data } = _getArguments(args);

		this.primaryKey = key;
		this.storeName = `store_${name}`;

		this.openDBRequest = window.indexedDB.open(name, 1);

		if (key) {
			this.openDBRequest.onupgradeneeded = this._firstBuild.bind(this);
			this.openDBRequest.onsuccess = this._afterFirstBuild(data).bind(this);
		} else {
			this.openDBRequest.onsuccess = this._rebuild.bind(this);
		}
		this.openDBRequest.onerror = this._loadError.bind(this);

		this.getEntry = this.getEntry.bind(this);
		this.getAll = this.getAll.bind(this);
		this.put = this.put.bind(this);

		return new Promise((resolve, reject) => {
			this.initResolve = resolve;
			this.initReject = reject;
		});
	}

	_firstBuild() {
		this.db = this.openDBRequest.result;

		// has to check this for uniqueness
		this.objectStore = this.db.createObjectStore(this.storeName, { keyPath: this.primaryKey });
		// this.objectStore.createIndex('date', 'date', { unique: true });
	}

	_afterFirstBuild(data = null) {
		return () => {
			this.db = this.openDBRequest.result;
			const transaction = this.db.transaction(this.storeName, 'readwrite');
			const store = transaction.objectStore(this.storeName);

			transaction.oncomplete = () => {
				this.initResolve(this);
			};
			transaction.onerror = () => {
				this.initResolve(this);
			};
			data.forEach((entry) => {
				store.add(entry);
			});
		};
	}

	_rebuild() {
		this.db = this.openDBRequest.result;
	}

	_loadError(event) {
		this.initReject(event.target.message);
	}

	_query(method, param = null) {
		const permission = method.substr(0, 3) !== 'get' ? 'readwrite' : 'readonly';
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

	getEntry(key) {
		return this._query('get', key);
	}

	getAll() {
		return this._query('getAll');
	}

	put(data) {
		return this._query('put', data);
	}

	delete(key) {
		return this._query('delete', key);
	}

}
