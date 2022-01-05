import React from 'react';
import {View, Text, ScrollView} from "react-native"

export class ErrorHandler extends React.Component {
  constructor(props){
    super(props);
    this.state = {hasError: false};
  }
  static getDerivedStateFromError(error){
    return {hasError: true, message: error.message, stack: error.stack }
  }

  render(){
    if (!this.state.hasError) return <React.Fragment>{this.props.children}</React.Fragment>;
    return (<ScrollView>
        <Text style={{fontWeight: "bold", fontSize: 16}} testID="errorHandler-title">Erreur</Text>
        <Text style={{color:"#DC3545FF"}} testID="errorHandler-message">{this.state.message}</Text>
        <View style={{paddingLeft:8}}>
          <Text style={{fontSize:14}}>Origine de l'erreur :</Text>
          <Text style={{fontSize:13, lineHeight: 13}} testID="errorHandler-stack">{this.state.stack}</Text>
        </View>
    </ScrollView>)
  }
}

export function withErrorHandler(Component){
  return function WithErrorHandler(props){
    return (<ErrorHandler>
      <Component {...props}/>
    </ErrorHandler>);
  }
}