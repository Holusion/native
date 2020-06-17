# cache-control

a unified cache control module for [content.holusion.com](https://content.holusion.com).

Uses specific dependencies for electron/react-native applications to manage filesystem interactions.

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

##### dispatch (object {config?:{}, items?:{}})

exports an object with updated key `config`or `items` to be consumed by the state manager (redux or react context).

##### progress (string)

dispatch progression messages for long running operations (ie. file downloads).