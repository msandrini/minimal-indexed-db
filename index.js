export default class DB {

	constructor(data = null) {
		this.db = null;
		this.objectStore = null;
		this.initResolve = () => {};
		this.initReject = () => {};

		this.openDBRequest = window.indexedDB.open('dailyEntries', 1);

		if (data) {
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
		this.objectStore = this.db.createObjectStore('entriesStore', { keyPath: 'date' });
		// this.objectStore.createIndex('date', 'date', { unique: true });
	}

	_afterFirstBuild(data = null) {
		return () => {
			this.db = this.openDBRequest.result;
			const transaction = this.db.transaction('entriesStore', 'readwrite');
			const store = transaction.objectStore('entriesStore');

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
		const permission = method === 'put' ? 'readwrite' : 'readonly';
		const transaction = this.db.transaction('entriesStore', permission);
		const store = transaction.objectStore('entriesStore');
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

	getEntry(date) {
		return this._query('get', date);
	}

	getAll() {
		return this._query('getAll');
	}

	put(data) {
		return this._query('put', data);
	}

	delete(key)

}