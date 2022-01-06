import React from 'react';
import {View, Text, ScrollView} from "react-native"
import * as stackTraceParser from "stacktrace-parser";
import { H1, H2 } from '../components/style';

export class ErrorHandler extends React.Component {
  constructor(props){
    super(props);
    this.state = {hasError: false};
  }
  /**
   * Try to (safely) make errors more readable. Heavily inspired by react-native dev-mode error reporting
   * Some stack trace symbolication not available in JS mode are skipped.
   * @param {Error} error 
   * @see https://github.com/facebook/react-native/blob/0.67-stable/Libraries/Core/ExceptionsManager.js#L54
   * @see https://github.com/facebook/react-native/blob/0.67-stable/Libraries/Core/Devtools/parseErrorStack.js#L41
   */
  static getDerivedStateFromError(error){
    const parsedStack = Array.isArray(error.stack)? error.stack: stackTraceParser.parse(error.stack).map(frame => ({
      ...frame,
      column: frame.column != null ? frame.column - 1 : null,
    }));
    let message = error.message;
    const namePrefix = error.name == null || error.name === '' ? '' : `${error.name}: `;
    if (!message.startsWith(namePrefix)) {
      message = namePrefix + message;
    }
    return {hasError: true, message, componentStack: error.componentStack, stack: parsedStack }
  }
  render(){
    if (!this.state.hasError) return <React.Fragment>{this.props.children}</React.Fragment>;
    return (<ScrollView>
        <H1 testID="errorHandler-title">Erreur</H1>
        <Text style={{color:"#DC3545FF", fontSize: 24}} testID="errorHandler-message">{this.state.message}</Text>
        <View style={{paddingLeft:8}}>
          {this.state.componentStack? <View>
            <H2 style={{paddingTop:10}}>Emplacement : </H2>
            <Text style={{fontSize:13, lineHeight: 13}} testID="errorHandler-componentStack">
              {this.state.componentStack}
            </Text>
          </View>: null}
          <View>
            <H2 style={{paddingTop:10}}>Stack :</H2>
            <Text style={{fontSize:13, lineHeight: 13}} testID="errorHandler-stack">
              {this.state.stack.map((frame)=>(`  in ${frame.methodName}`)).join("\n")}
            </Text>
          </View>
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