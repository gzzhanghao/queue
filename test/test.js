var EventEmitter = require('events');
var Task = require('../src/task');
var Queue = require('../src/queue');

var queue = new Queue;
var res = new EventEmitter;

queue.addResource(res);

var task = new Task({ run: () => console.log(0), abort: () => console.log('abort') });
queue.run(task).then(() => console.log('resolved'), (error) => console.log('rejected', error)).then(() => res.emit('ready'));

var task = new Task({ run: () => console.log(0), abort: () => console.log('abort') });
queue.run(task).then(() => console.log('resolved'), (error) => console.log('rejected', error));
