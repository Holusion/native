'use strict';
import React from 'react';

import { ActivityIndicator } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';

export default function StatusIcon(props){
    switch(props.status){
        case "loading":
            return <ActivityIndicator/>
        case "error":
            return <Icon name="ios-bug"/>;
        case "idle":
        default:
            return <Icon primary name="ios-paper-plane"/>;
    }
}