import React, { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

import Icon from 'react-native-vector-icons/Ionicons';
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";

export default function SettingsHeader({back, children}){
  const {goBack} = useNavigation();
  const onDismiss = useCallback(()=>goBack(), [goBack]);
  return (<View style={styles.header}>
    <View style={styles.left}>
      {back ? <TouchableOpacity transparent onPress={onDismiss}>
        <View style={{diplay:"flex", flexDirection:"row"}}><Icon style={{fontSize:17}} name="chevron-back-outline" /><Text>Retour</Text></View>
      </TouchableOpacity>:<Text>&nbsp;</Text>}
    </View>
    <View style={styles.body}>{typeof children === "string"? <Text style={{fontWeight: "bold"}}>{children}</Text>: children}</View>
    <View style={styles.right}>
      {back ? <Text>&nbsp;</Text> : <TouchableOpacity transparent onPress={onDismiss}>
        <Text style={styles.headerDoneBtn}>ok</Text>
      </TouchableOpacity>}
    </View>
  </View>)
}


const styles = StyleSheet.create({
  header:{
    padding: 15,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerDoneBtn: {
    color: '#007aff',
    fontSize: 16,
    textAlign:"right"
  },
  left: {
    flex: 1,
  },
  body: {
    flex: 0,
  },
  right: {
    flex: 1,
  }
});
