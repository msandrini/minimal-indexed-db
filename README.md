# minimalIndexedDB

Library to handle the simplest possible application of native IndexedDB (a basic CRUD), with none of indexedDB complexities, in a super lightweight fashion.

## installation

`npm i minimal-indexed-db` with `--save-dev` if desired


## usage

This lib is based on an instantiable class. This class is meant to be instantiated in the first use together with the initial data to populate the database and the key, as in the example below:

```javascript
const db = DB.init({ 
    dbName: 'sample', 
    key: 'id', // key is optional, defaults to "id"
    initialData: [ // initial data is also optional, defaults to an empty array
        { id: 1, name: 'John' }, 
        { id: 2, name: 'Terry' }
    ]});
```

This code above returns a promise that resolves (with the instantiated class provided) when the action is done and rejects in case of any error.

You can also use parameters:

```javascript
const db = DB.init('sample', 'id', [ /* initial data, can be omitted to be empty */ ]);
```

After that, you can use the instantiated class or you can instantiate again the class *without the key and data* to query and modify the database. Look at the examples below:

```javascript
const db = new DB('sample');
db.getEntry(1); // returns { id: 1, name: 'John' } if initiated as stated in the first example.
```

So, one can get a single entry queried by the key (as in the example above), or do as following:

```javascript
db.getAll();
db.put({ id: 3, name: 'Brian' }); // inserts an entry (or updates it, if the key exists)
db.delete(3); // delete the record for the key provided
```

All those methods above return a promise that resolves when the process is done (with the result of the query, when it is a query) and rejects in case of any error.
## testing and linting

```
npm test
```
Tests include linting, but when only the linting is desired the command `npm run lint` can be run.