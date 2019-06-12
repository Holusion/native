const checkReducers = (reducers) => {
    return Object.entries(reducers).filter(e => typeof e[1] !== "function" || e[1].name !== e[0]);
}

export const combineReducers = (reducers = {}) => {
    const badReducers = checkReducers(reducers);
    if(badReducers.length !== 0) throw new TypeError(`${badReducers[0][0]} is not a reducer function (should be: (state, option) => {})`)
    
    return (state = {}, action) => Object.keys(reducers).reduce((acc, elem) => {
        acc[elem] = reducers[elem](state[elem], action)
        return acc;
    }, {})
}