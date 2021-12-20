'use strict';
import React, {useContext} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { ThemeContext } from "./style"

function useThemedPrevNext(){
    const theme = useContext(ThemeContext);

    return {controlIcons: {
      color: theme.colors.primary
    }};
}

export default function PrevNext(props, {children}){
    const themeStyle = useThemedPrevNext();

    return (<View style={prevNextTheme.view} pointerEvents="box-none">
        <View style={{opacity: props.prev? 1 : 0}} pointerEvents={props.prev?"auto":"none"}>
            <TouchableOpacity key="prev" testID="button-prev" style={prevNextTheme.controlPrev} disabled={!props.prev} onPress={props.prev}>
                <Icon primary large style={prevNextTheme.controlIcons} type="Ionicons" name="chevron-back"/>
            </TouchableOpacity>
        </View>
        {children}
        <View style={{opacity: props.next? 1 : 0, zIndex:props.next? 1:-1}} pointerEvents={props.next?"auto":"none"}>
            <TouchableOpacity key="next" testID="button-next" style={prevNextTheme.controlNext} disabled={!props.next} onPress={props.next}>
                <Icon primary large style={[prevNextTheme.controlIcons, themeStyle.controlIcons]} type="Ionicons" name="chevron-forward"/>
            </TouchableOpacity>
        </View>
    </View>)
}

const prevNextTheme = StyleSheet.create({
    view: {
        flex: 0,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent:'center',
        alignSelf: 'center',
        zIndex: -1
    },
    controlPrev: {
        paddingLeft: 10,
    },
    controlNext: {
        paddingRight: 10,
    },
    controlIcons:{
        fontSize: 60,
        height: 60,
        lineHeight: 60,
        padding: 5,
        fontWeight: "bold"
    },
})
