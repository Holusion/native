import React from 'react';
import { Container, Content, Text, H2, H4, View} from 'native-base';

export class ErrorHandler extends React.Component {
  constructor(props){
    super(props);
    this.state = {hasError: false};
  }
  static getDerivedStateFromError(error){
    return {hasError: true, message: error.message, stack: error.stack }
  }

  render(){
    if (!this.state.hasError) return this.props.children; 
    return <Container>
      <Content>
        <H2 testID="errorHandler-title">Erreur</H2>
        <Text style={{color:"#DC3545FF"}} testID="errorHandler-message">{this.state.message}</Text>
        <View style={{paddingLeft:8}}>
          <Text style={{fontSize:14}}>Origine de l'erreur :</Text>
          <Text style={{fontSize:13, lineHeight: 13}} testID="errorHandler-stack">{this.state.stack}</Text>
        </View>
      </Content>
    </Container>
  }
}

export function withErrorHandler(Component){
  return function WithErrorHandler(props){
    return <ErrorHandler>
      <Component {...props}/>
    </ErrorHandler>

  }
}