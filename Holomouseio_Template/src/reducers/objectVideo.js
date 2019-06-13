import {SetObjectVideo} from '../actions'

export const objectVideo = (state={}, action) => {
    if(action.videos) {
        const length = action.videos.length;
        let index = action.index;
        switch(action.type) {
            case SetObjectVideo.NEXT_VIDEO:
                index = (state.index + 1) % length;
                return {video: action.videos[index], videos: action.videos, index}
            case SetObjectVideo.PREVIOUS_VIDEO:
                index = state.index == 0 ? length - 1 : state.index - 1
                return {video: action.videos[index], videos: action.videos, index}
            case SetObjectVideo.SET_VIDEO:
                return {video: action.videos[index], videos: action.videos, index}
            default:
                return state;
        }
    }
}