# react-native-holusion : a react-native API to build applications for holusion products

## Introduction

This API gives some tools to create applications which can control holusion products. the functionnalities are tested on iOS, for android, it should works but be careful.
The project is divide by 2 main folder:

- components - abtraction for components to help creation of react-native components
- flux - contains module for flux pattern
- utils - all util modules are store here

## Components

For the moment, their is only three components that can help to create react-native application:

- Playlist: gives some helper functions to create object with al information about remote playlist and additionnal data from init contents

### Playlist

#### playlistFromContents(url, content)
**Usage**
Get an object that represents a playlist from *url* restricted by *content*

**Param**
- url: url of the product from the correcponding playlist
- content: custom playlist which can be fetch differenty than basic playlist getting (for example with json file, or set of yaml files) 

#### playlistFromNetwork(url)

**Usage**
Get an object that represents a playlist from *url*

**Param**
- url: product ip to fetch the playlist

## Utils

The util modules are :

- assetManager: module that can read yaml files from the app folder, and give the possibility to access of each elements
- network: detect products with zeroconf and control all network transmission (like getPlaylist, etc...)
- FirebaseController: a class that give method to download files from a collection

### Spec

#### assetManager

##### manage()
**Usage**:
Find all yaml files, parse all yamlFile, store contents in dictionnary with key equals to file name (without .yaml).

##### getObjectFromType(type, content)
**Usage**:
Get all yaml content that have a key named _type_ with value _content_

**Param**:
- type: the key value to search
- content: the expected content

#### network

##### connect(callbackAdd, callbackRemove)
**Usage**:
Search all product in the network, when it find a product, callbackAdd is called, when a product is removed, callbackRemoved is called

##### getUrl()
**Usage**:
Get the first url found by the module

##### getPlaylist(url)
**Usage**:
Get the playlist of a product given by its _url_

##### desactiveAll(url)
**Usage**:
Desactive all medias from the product given by the _url_

##### desactive(url, name)
**Usage**:
Desactive a medias given by its _name_ from the product given by the _url_

##### activeAll(url)
**Usage**:
Active all medias from the product given by the the _url_

##### active(url, name)
**Usage**:
Active a media given by its _name_ from the product given by its _url_

##### activeWithPredicate(url, predicate, active)
**Usage**:
Will activate of desactivate (it depends of _active_) all medias that correspond to the _predicate_ from the product given by the _url_
**Params**:
- predicate: Function with a parameters corresponding to a medias and return a boolean
- active: a boolean that control if the medias medias will be activated (true) or desactivated (false)

##### play(url, name)
**Usage**:
Launch the media given by its _name_ from the product given by its _url_ 

#### FirebaseController

You can found the documentation of react-native-firebase at: https://rnfirebase.io/docs/v5.x.x/getting-started

| Properties | Description |
| ---------- | ----------- |
| projectName | The name of the firebase project |
| collection | the path of the database where datas for all files are stored |

##### constructor(projectName)
**Usage**:
Construct a FirebaseController and init the collection properties

**Param**
- projectName: the name of the Firebase project

##### downloadFile(ref, name)
**Usage**:
Return a promise which will be resolved when the file passed in parameter is downloaded without error, else throw an error

**Param**
- ref: a DocumentReference that represent the file to download
- name: the name of the document (the file stored will have this name)

##### getFiles(collections)
**Usage**:
Return an error list occured while trying to download files targeted by the *collections* param

**Param**
- collections: array of object representing the firebase collection to download, the objects have this shape: {name: $collectionName, properties: [$field1, $field2, etc...]}

## Flux pattern

The flux pattern is a pattern used to store the state of an application, to do that, we use reducers.
Reducers are functions with two parameters, the currentState and the action to occure when the reducer is called.
In our case, if we have multiple reducers, we will combine them into one reducer and create a store with this reducer.
We can subscribe listener function to a store, when we want to dispatch an action, the store will dispatch to all listener the state change. In react-native, we will use this mechanism to update our view and change the state of a component for example.

### store

- subscribe(listener): add the listener to list of listener to call when dispatch is called, return a function to unsubscribe the listener
- dispatch(action): update the state and dispatch the action to all listeners
- getState(): get the current state of the application

### reducer

- combineReducers(reducers): combine all reducers given in parameter (from the shape: {reducer1, reducer2})

## Testing

To launch the unit tests, use this command : 

```sh
npm test
```