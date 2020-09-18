import React from "react";

import {render, act, cleanup} from '@testing-library/react-native'
import { NavigationContainer, ServerContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from "react-redux";

import {configureStore} from "../../persistentStore";
import {useAutoPlay} from ".";
import { addProduct, setActive, setData } from "../../actions";
import { View } from "react-native";

const Stack = createStackNavigator();

function Wrapper(){
    const [video, url, isActive ] = useAutoPlay();
    return <View>{video} {url} {isActive? "active":"inactive"}</View>;
}
function doWrap({store, initialRouteName="Home", initialParams }){
  return render((<Provider store={store}>
    <NavigationContainer>
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen name={"Foo"} component={View}/>
      <Stack.Screen initialParams={initialParams} name={"Home"} component={Wrapper}/>
    </Stack.Navigator>
    </NavigationContainer>
  </Provider>))
}

describe("useAutoPlay", ()=>{
  let onFetch;
  let store;
  beforeAll(()=>{
    onFetch = jest.fn(()=>Promise.resolve({code: 200, message: "OK"}));
    fetch.doMock((req)=>onFetch(req.url));
  })
  
  afterAll(()=>{
    fetch.resetMocks()
  })

  beforeEach(()=>{
    store = configureStore();
  })
  afterEach(()=>{
    cleanup();
    onFetch.mockClear();
  })


  it("accepts the default store", async ()=>{
    doWrap({store});
    await act(async () => {});
    expect(onFetch).not.toHaveBeenCalled();
  });
  describe("with an active target", ()=>{
    beforeEach(()=>{
      store.dispatch(addProduct({name: "holobox-01", url: "192.168.1.2"}));
      store.dispatch(setActive({name: "holobox-01"}));
    });

    it("set video as soon as a video is set", async ()=>{
      
      doWrap({store});
      await act(async ()=>{
        store.dispatch(setData({config:{video: "/path/to/foo.mp4"}}));
      })
      expect(onFetch).toHaveBeenCalledTimes(1);
      expect(onFetch).toHaveBeenCalledWith("http://192.168.1.2/control/current/foo.mp4");
    });

    it("Do nothing if mounted screen is not active", async ()=>{
      store.dispatch(setData({config:{video: "/path/to/foo.mp4"}}));
      doWrap({store, initialRouteName: "Foo"});
      await act(async ()=>{})
      expect(onFetch).not.toHaveBeenCalled();
    });

    it("dispatch a category video if params.category is set", async()=>{
      store.dispatch(setData({
        config:{
          video: "/path/to/foo.mp4",
          categories: [
            {name: "cat1", video:"/path/to/bar.mp4"}
          ]
        },
      }));

      doWrap({store, initialParams:{category:"cat1"}});
      await act(async ()=>{})
      expect(onFetch).toHaveBeenCalledTimes(1);
      expect(onFetch).toHaveBeenCalledWith("http://192.168.1.2/control/current/bar.mp4");
    });

    it("prefer an item video if params.id is set", async ()=>{
      store.dispatch(setData({
        config:{
          video: "/path/to/foo.mp4",
          categories: [
            {name: "cat1", video:"/path/to/bar.mp4"}
          ]
        }, 
        items: {
          "item1": {video: "/path/to/baz.mp4"}
        }
      }));

      doWrap({store, initialParams:{category:"cat1", id: "item1"}});
      await act(async ()=>{});
  
      expect(onFetch).toHaveBeenCalledTimes(1);
      expect(onFetch).toHaveBeenCalledWith("http://192.168.1.2/control/current/baz.mp4");
    });
  });
})