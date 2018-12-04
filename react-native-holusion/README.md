# react-native-holusion : a react-native API to build applications for holusion products

## Introduction

This API gives some tools to create applications which can control holusion products. the functionnalities are tested on iOS, for android, it should works but be careful.
The project is divide by 2 main folder:

- components - all react-native components are store here
- utils - all util modules are store here

## Components

For the moment, their is only three components that can help to create react-native application:

- IconCard: a card that can have an icon, it's used for menu or to create playlist
- ListItem: a colored list item that swap its color between white and the color given in parameters
- Playlist: a colection of cards that show the content given in parameters

### Properties

### IconCard

| Properties | Usage                                                                                | Value type |
| ---------- |:------------------------------------------------------------------------------------:| ----------:|
| source     | the icon (use require or {uri:})                                                     | Object     |
| content    | the title of the card                                                                | String     |

### ListItem

| Properties | Usage                                                                                | Value type |
| ---------- |:------------------------------------------------------------------------------------:| ----------:|
| onPress    | the action function when the item is pressed                                         | Function   |

### Playlist

| Properties | Usage                                                                                | Value type   |
| ---------- |:------------------------------------------------------------------------------------:| ------------:|
| content    | the list of the video name you want to display                                       | String Array |
| titles     | the list of title card (optionnal)                                                   | String Array |
| actionItem | function called when an item is pressed [param: i -> content index]                  | Function     |
| url        | url of the product (if you want to use remote thumbnail)                             | String       |
| localImage | if specified, use local image                                                        | Boolean      |

## Utils

Their is two util modules :

- assetManager: module that can read yaml files from the app folder, and give the possibility to access of each elements
- network: detect products with zeroconf and control all network transmission (like getPlaylist, etc...)

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