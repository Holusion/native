# cache-control

a unified cache control module for [content.holusion.com](https://content.holusion.com).

Uses specific dependencies for electron/react-native applications to manage filesystem interactions.

## Install

platform-specific dependencies are not provided as npmjs doesn't provide a mechanism to do so. They are :

Electron :

```
    firebase
```
Node : 
```
    firebase
    #fetch is required only if upload to the controller is used
    node-fetch # or use --experimental-fetch flag
    abort-controller
    formdata-node
```
node users should also define fetch, AbortController and FormData into the global scope :
```
global.fetch = require("node-fetch");
etc...
```

react-native :

```
    react-native-fs @react-native-firebase/app @react-native-firebase/storage @react-native-firebase/firestore react-native-background-upload
```

## Usage

The caller is responsible to call `firebase.initializeApp()` and to set the module's base path using `setBasePath()` before use.

```
    import {setBasePath, sagaStore} from "@holusion/cache-control";

    setBasePath("/path/to/wherever");
    const [store, task] = sagaStore({defaultProject});
    #store is a redux store, which can be subscribed to.
    # use task.cancel() to abort operations on exit
    task.cancel();
```

The module also exports a _lot_ of useful actions/reducers to modify its behaviour.