import reducers from '../reducers'

export default class Store {
    
    constructor(reducer) {
        this.listeners = [];
        this.state = {};
        this.reducer = reducer;
    }
    
    dispatch = (action) => {
        this.state = this.reducer(this.getState(), action);
        for(let listener of this.listeners) {
            listener();
        }
    }
    
    getState = () => {
        return this.state;
    }
    
    listenerAlreadyExist = (listener) => {
        for(let i = 0; i < this.listeners.length; i++) {
            if(this.listeners[i] === listener) return true;
        }
        return false;
    }

    subscribe = (listener) => {
        if(!this.listenerAlreadyExist()) {
            this.listeners.push(listener);
            return () => {
                delete this.listeners[listener];
                this.listeners = this.listeners.filter(el => el != null);
            }
        }
        return false;
    }
}

export const store = new Store(reducers);
