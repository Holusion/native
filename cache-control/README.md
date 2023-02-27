# cache-control

a unified cache control module for [content.holusion.com](https://content.holusion.com).

Uses specific dependencies for electron/react-native applications to manage filesystem interactions.

## Install

platform-specific dependencies are not provided as npmjs doesn't provide a mechanism to do so. They are :

Electron :

```
    @firebase/app @firebase/storage
```
Node : 
```
    @firebase/app @firebase/storage
    #Those ones only if upload is used
    node-fetch
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

The caller is responsible to call `firebase.initializeApp()` and to set the module's base path using `setBasePath()` before use.

```
    import {setBasePath} from "@holusion/cache-control";

    setBasePath("/path/to/wherever");
```


## Interface

This module mainly exposes a `WatchFiles` EventEmitter

### WatchFiles

#### Methods

##### watch()

start listening for snapshot changes

##### close()

stop listening for snapshot changes

#### Events

##### error (Error)

when any error happens during snapshots processing. No error is fatal but `dispatch`events will not fire if there was failures

##### start ("config"|"item")


##### dispatch (object {config?:{}, items?:{}})

exports an object with updated key `config`or `items` to be consumed by the state manager (redux or react context).
