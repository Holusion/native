'use strict';
import React from 'react';

import {Spinner, Icon} from "native-base";

export default function StatusIcon(props){
    switch(props.status){
        case "loading":
            return <Spinner/>
        case "error":
            return <Icon name="ios-bug"/>;
        case "idle":
        default:
            return <Icon primary name="ios-paper-plane"/>;
    }
}