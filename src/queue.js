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

	addResource: function(res) {
		var ready = () => {
			if (this[symQueue].length) {
				return this[symQueue].shift().resolve(res);
			}
			this[symRes].push(res);
		};
		res.on('ready', () => ready());
		ready();
	},

	run: function(task, priority) {
		var resolvers = this[symTaskMap].get(task);
		if (resolvers) {
			if (resolvers.priority < priority) {
				this.prioritize(task, priority);
			}
			return resolvers.promise;
		}

		var promise;
		this[symTaskMap].set(task, resolvers = {});

		if (this[symRes].length) {
			promise = new Promise((resolve, reject) => {
				priority = priority || 0;
				assign(resolvers, { resolve, reject, priority });
				this._insertQueue(resolvers, priority);
			});
		} else {
			promise = Promise.resolve(this[symRes].shift());
		}

		resolvers.promise = promise.then(res =>
			task.run(res)
		).then(() =>
			this[symTaskMap].delete(task)
		);

		return resolvers.promise;
	},

	abort: function(task) {
		var resolvers = this[symTaskMap].get(task);
		var index = this[symQueue].indexOf(resolvers);

		this[symTaskMap].delete(task);

		if (index >= 0) {
			resolvers.reject(new Error('aborted'));
			this[symQueue].splice(index, 1);
		}
		task.abort();
	},

	prioritize: function(task, priority) {
		var resolvers = this[symTaskMap].get(task);
		if (priority === resolvers.priority) {
			return;
		}
		var index = this[symQueue].indexOf(resolvers);
		if (index >= 0) {
			this[symQueue].splice(index, 1);
			resolvers.priority = priority;
			this._insertQueue(resolvers, priority);
		}
	},

	_insertQueue: function(resolvers, priority) {
		for (var index = this[symQueue].length - 1; index >= 0; index--) {
			if (this[symQueue][index].priority >= priority) {
				break;
			}
		}
		this[symQueue].splice(index + 1, 0, resolvers);
	}
});

module.exports = Queue;
