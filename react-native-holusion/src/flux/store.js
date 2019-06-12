export default class Store {
    
    constructor(reducer) {
        this.listeners = [];
        this.reducer = reducer;
        this.state = undefined;
    }
    
    dispatch = (action) => {
        this.state = this.reducer(this.state, action);
        for(let listener of this.listeners) {
            listener(action);
        }
    }
    
    getState = () => {
        return this.state || {};
    }
    
    listenerAlreadyExist = (listener) => {
        return this.listeners.indexOf(listener) != -1
    }

    subscribe = (listener) => {
        if(typeof listener === "function" && listener.length <= 1 && !this.listenerAlreadyExist(listener)) {
            this.listeners.push(listener);
            return () => {
                this.listeners = this.listeners.filter(el => el !== listener);
            }
        }
        return false;
    }
}