import React, { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";


import {StyleSheet} from "react-native";
import { Icon, Text, Header, Button, Left, Right, Body } from "native-base";

export default function SettingsHeader({back, children}){
  const {goBack} = useNavigation();
  const onDismiss = useCallback(()=>goBack(), [goBack]);
  return (<Header>
    <Left style={styles.left}>
      {back ?<Button transparent onPress={onDismiss}>
        <Icon style={{fontSize:17}} name="chevron-back-outline" /><Text>Retour</Text>
      </Button>:<Text>&nbsp;</Text>}
    </Left>
    <Body style={styles.body}>{typeof children === "string"? <Text style={{fontWeight: "bold"}}>{children}</Text>: children}</Body>
    <Right style={styles.right}>
      {back ? <Text>&nbsp;</Text> : <Button transparent onPress={onDismiss}>
        <Text style={styles.headerDoneBtn}>ok</Text>
      </Button>}
    </Right>
  </Header>)
}


const styles = StyleSheet.create({
  headerDoneBtn: {
    color: '#007aff',
    fontSize: 16,
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
