var EventEmitter = require('events');
var Task = require('../src/task');
var Queue = require('../src/queue');

var queue = new Queue;
var res = new EventEmitter;

queue.addResource(res);

var response = {};

var task = new Task({ run: () => console.log('run') }); // Log once

queue.run(task).then(() => {
	console.log(1);
	res.emit('ready')
});

queue.run(task).then(() => {
	console.log(2);
	res.emit('ready')
});

queue.run(task).then(() => {
	console.log(3);
	res.emit('ready');
});
