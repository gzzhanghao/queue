'use strict';

var assign = require('object-assign');

var symStatus = Symbol('state');
var symOpts = Symbol('symOpts');
var symPromise = Symbol('promise');

function Task(opts) {
	this[symStatus] = Task.WAITING;
	this[symOpts] = opts;
}

assign(Task, { WAITING: 0, RUNNING: 1, RESOLVED: 2, REJECTED: 3 });

assign(Task.prototype, {

	run: function(resource) {

		if (this[symStatus] === Task.RUNNING || this[symStatus] === Task.RESOLVED) {
			return this[symPromise];
		}

		this[symStatus] = Task.RUNNING;
		this[symPromise] = Promise.resolve(this[symOpts].run(resource));
		this[symPromise].then(
			() => this[symStatus] = Task.RESOLVED,
			() => this[symStatus] = Task.REJECTED
		);
		return this[symPromise];
	},

	reset: function() {
		this[symStatus] = Task.WAITING;
		this[symPromise] = null;
	},

	abort: function() {
		this[symStatus] = Task.REJECTED;
		this[symOpts].abort();
	},

	status: function() {
		return this[symStatus];
	}
});

module.exports = Task;
