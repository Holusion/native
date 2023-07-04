# cache-control

a unified cache control module for [content.holusion.com](https://content.holusion.com).

Uses specific dependencies for electron/react-native applications to manage filesystem interactions.

## Install

platform-specific dependencies are not provided as npmjs doesn't provide a mechanism to do so. They are :

### Electron / node :

```
    npm i firebase
```
 > in **Electron**, it's best to use it in the main thread, then dispatch state changes through [ipcRenderer](https://www.electronjs.org/fr/docs/latest/api/ipc-renderer#ipcrenderersendchannel-args)

 > If using **node <18.x**, `node-fetch`, `abort-controller` and `formdata-node` are also required when syncing with a product

when using node-fetch, define AbortController and FormData into the global scope :

```
global.fetch = require("node-fetch");
etc...
```

### react-native :

```
    react-native-fs @react-native-firebase/app @react-native-firebase/storage @react-native-firebase/firestore react-native-background-upload
```


## Usage

The caller is responsible to call `firebase.initializeApp()` and to set the module's base path using `setBasePath()` before use.

```
    import {setBasePath, sagaStore} from "@holusion/cache-control";

    setBasePath("/path/to/wherever");
    const [store, task] = sagaStore();
    #store is a redux store, which can be subscribed to.
    # use task.cancel() to abort operations on exit
    task.cancel();
```

The module also exports a _lot_ of useful actions/reducers to modify its behaviour. See the `features/` folder for reference.

The most basic configuration is to just override some store defaults like this : 

```
    sagaStore({projectName: "My-project", autoClean: true});
```
See `features/conf` for all local-stored properties to configure

It can also be useful to dispatch some user-events, to trigger the eventLoop. See `lib/features/index.js:rootSaga()`.

## Changelog

### 3.5.0

 - uses `projectName` instead of `defaultProject` to configure initial project name when calling `sagaStore()`
 - allow manual `signIn` retry with the `trySignIn` action
 - some bugfixes