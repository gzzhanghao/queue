# Queue

A simple async queue based on producer and consumer model.

## API

### Queue()

Create a empty queue with no tasks and resources.

### Queue#addResource(resource)

Add a resource to the queue, the resource must be an EventEmitter that emits `ready` event. The resource will be automatically reused when receiving the `ready` event.

### Queue#run(task, priority = 0)

Push a task into the queue with given priority.

### Queue#abort(task)

Abort the task if it is not resolved yet.

### Queue#prioritize(task, priority)

Prioritize the task with given priority.

### Task(opts)

Create a task with given options. The opts parameter must provides following methods:

- run(resource) Invoked when the resource is present and the task should be running
- abort() Invoked when the user wants to abort the task

### Task#run(resource)

Run the task with given resource, this method is a proxy for opts#run. The result will be cached until the task was reset.

### Task#reset()

Clear the cached result and reset the task status to Task.WAITING.

### Task#abort()

Abort the task if it is not resolved yet, the task status will be set to Task.REJECTED.

### Task#status()

Return the current status of the task. The return value should be one of the followings:

- Task.WAITING
- Task.RUNNING
- Task.RESOLVED
- Task.REJECTED
