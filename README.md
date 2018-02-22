# minimalIndexedDB

Library to handle the simplest possible application of native IndexedDB (a basic CRUD), with none of indexedDB complexities, in a super lightweight fashion.

## installation

`npm i minimal-indexed-db` with `--save-dev` if desired


## usage

The DB is meant to be created and then it will be ready to be used. As the IndexedDB lib is asynchronous, so this is as well. 

To create the DB, do it as in the example below. The first parameter is the DB name, the second is the primary key (which is optional and defaults to _"id"_)

```javascript
const dbPromise = DB.create('sample', 'id');
```

This code above returns a promise that resolves with the DB handling methods (see below) when the DB is created and rejects in case of any error.

```javascript
DB.create('sample', 'id').then((db) => {
    db.put({ id: 1, name: 'John' });
});
```

After that, you can access the database anytime through `DB.use` to have access to the handling methods. Look at the examples below:

```javascript
DB.use('sample').then((db) => {
    db.put({ id: 1, name: 'John' });
    db.getEntry(1); // returns { id: 1, name: 'John' }
});
```

After the use you can optionally delete the database, which may be relevant for cleaning user info, for example. To do it, just use the `delete` method (this method has no return and is synchronous):

```javascript
// with db as a database created:
DB.delete('sample');
```

### Handling methods

- `<instance>.getEntry(key)`: gets the entry by the primary key provided (or undefined if nothing was found)
- `<instance>.getAll()`: gets an array with all entries
- `<instance>.put()`: inserts an entry or updates it, if the key provided in the entry object already exists. An array can be provided to insert many entries at once.
- `<instance>.deleteEntry(key)`: deletes the entry with the primary key provided

All those methods above return a promise that resolves when the process is done (with the result of the query, when it is a query) and rejects in case of any error. Follow the examples above:

```javascript
await db = DB.use('sample');
await db.put([
    { id: 1, name: 'John' },
    { id: 3, name: 'Brian' }
]);
await db.getEntry(3); // returns { id: 3, name: 'Brian' }
await db.deleteEntry(3); // delete the record for the key provided
await db.getEntry(3); // returns undefined
```

## testing and linting

```
npm test
```
Tests include linting, but when only the linting is desired the command `npm run lint` can be run.