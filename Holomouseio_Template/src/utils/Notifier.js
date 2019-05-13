let listeners = [];
let tasks = new Map();

const setTask = (name, type, message, retry) => {
    let task = {type: type, message: message, retry: retry} 
    tasks.set(name, task)
    for(let l of listeners) {
        l(task);
    }
}

export const setErrorTask = (name, message, retry) => {
    setTask(name, 'danger', message, retry);
}

export const setInfoTask = (name, message) => {
    setTask(name, 'info', message);
}

export const setWarningTask = (name, message, retry) => {
    setTask(name, 'warn', message, retry);
}

export const setSuccessTask = (name, message) => {
    setTask(name, 'success', message,);
}

export const subscribe = (fn) => {
    if(listeners.indexOf(fn) < 0) {
        listeners.push(fn);
        return () => {
            delete listeners[fn];
            listeners = listeners.filter(el => el != null);
        }
    }
}

export const getTasks = () => {
    return tasks;
}
