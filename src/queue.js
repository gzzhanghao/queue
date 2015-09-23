'use strict';

var assign = require('object-assign');

var symRes = Symbol('resources');
var symQueue = Symbol('queue');
var symTaskMap = Symbol('taskMap');
var symAddRes = Symbol('addRes');

function Queue() {
	this[symRes] = [];
	this[symQueue] = [];

	this[symTaskMap] = new WeakMap();
}

assign(Queue.prototype, {

	addResource: function(resource) {
		var ready = () => {
			if (this[symQueue].length) {
				return this[symQueue].shift().resolve(resource);
			}
			this[symRes].push(resource);
		};
		resource.on('ready', () => ready());
		ready();
	},

	run: function(task, priority) {
		if (this[symRes].length) {
			return task.run(this[symRes].shift());
		}
		return new Promise((resolve, reject) => {

			let resolvers = { resolve, reject, priority };
			this[symTaskMap].set(task, resolvers);
			this._insertQueue(resolvers, priority);

		}).then(resource => {

			this[symTaskMap].delete(task);
			return task.run(resource);
		});
	},

	abort: function(task) {
		var resolvers = this[symTaskMap].get(task);
		var index = this[symQueue].indexOf(resolvers);
		if (index >= 0) {
			resolvers.reject(new Error('aborted'));
			this[symQueue].splice(index, 1);
		}
		task.abort();
	},

	prioritize: function(task, priority) {
		var resolvers = this[symTaskMap].get(task);
		var index = this[symQueue].indexOf(resolvers);
		if (index >= 0) {
			this[symQueue].splice(index, 1);
			resolvers.priority = priority;
			this._insertQueue(resolvers, priority);
		}
	},

	_insertQueue: function(resolvers, priority) {
		for (var index = this[symQueue].length - 1; index >= 0; index--) {
			if (this[symQueue][index].priority > priority) {
				break;
			}
		}
		this[symQueue].splice(index + 1, 0, resolvers);
	}
});

module.exports = Queue;