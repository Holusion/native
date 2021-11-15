import React from "react";
import {connect} from "react-redux";
import { Container, Content, Header, Title, Text, Separator, Body, Input, ListItem, Right, Form, Item, Label, Icon, Button, View, Left, Toast, Spinner } from "native-base";
import { Keyboard } from "react-native";

import {firebase} from "@react-native-firebase/app";
import { getDeviceName } from "react-native-device-info";

import {getConfig} from "@holusion/cache-control";

class ButtonPicker extends React.PureComponent {
  onPress(v){
    Keyboard.dismiss();
    this.props.onChange(this.props.name, v);
  }
  render() {
    const { onChange, name, value, items = [], children } = this.props;
    return <View style={{ paddingTop: 10, alignItems: "center" }}>
      <Text muted>{children}</Text>
      <View style={{ flex: 1, width: "100%", flexDirection: "row", justifyContent: "space-evenly" }}>
        {items.map((v) => (<Button key={v} light={value != v} onPress={this.onPress.bind(this, v)}><Text>{v}</Text></Button>))}
      </View>
    </View>;
  }
}


class FormInput extends React.PureComponent {
  state = {
    valid: undefined
  }
  onBlur = (e) => {
    const value = e.nativeEvent.text;
    if (this.props.validate) {
      const re = new RegExp(this.props.validate);
      this.setState({ valid: re.test(value) });
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.focus && !prevProps.focus) {
      this.input._root.focus();
    }
  }
  render() {
    const { name, children, onChange, first = false, last = false, value, ...rest } = this.props;

    return <Item first={first} floatingLabel>
      <Label>{children}</Label>
      <Input getRef={(r) => { this.input = r }} autoCorrect blurOnSubmit={last} onEndEditing={this.onBlur} onChangeText={(v) => onChange(name, v)} value={value} returnKeyType="next" {...rest} />
      {typeof this.state.valid === "boolean" && <Icon name={this.state.valid ? "checkmark-circle" : "close-circle"} style={{ color: this.state.valid ? "green" : "red" }} />}
    </Item>
  }
}


class ContactScreen extends React.Component {

  state = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    action: "",
    focus: -1,
    submitting : false,
  }

  submit = ()=>{
    const {...d} = this.state;
    const app = firebase.app();
    this.setState({submitting: true});
    getDeviceName()
    .then( host =>{
      return app.firestore().collection("mail").add({
        to: this.props.formData.to,
        from: "contact@holusion.com",
        replyTo: this.state.email,
        template: {
          name: this.props.formData.template,
          data: {
            host,
            ...d,
          },
        },
      })
    })
    .then(()=>{
      this.setState({submitting: false, status: "sent"});
    }, (e)=> {
      this.setState({submitting: false, error: e});
    })
    
  }
  render() {
    const onChange = (name, value) => {
      this.setState(state => ({ ...state, [name]: value }));
    }
    const canSubmit = !this.state.submitting && (
      this.props.isOK && 
      this.props.formData.lines.every(({validate, name}) => {
        if(!validate) return true;
        let re = new RegExp(validate);
        return re.test(this.state[name]);
    }) || this.state.status == "sent");
    
    let content;
    if(this.state.submitting){
      content = (<View style={{flex: 1, justifyContent: "center", flexDirection: "column"}}>
        <Text style={{textAlign:"center"}}>Envoi en cours...</Text>
        <Spinner/>
      </View>)
    }else if(this.state.error){
      content = (<View style={{flex: 1, justifyContent: "center", flexDirection: "column"}}>
        <Text style={{textAlign:"center"}}>Erreur</Text>
        <Text style={{textAlign:"center"}}>{this.state.error.message}</Text>
      </View>)
    }else if(this.state.status === "sent"){
      content = (<View style={{flex: 1, justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
        <Text style={{textAlign:"center"}}>Message envoyé</Text>
        <Text style={{textAlign:"center"}}>A bientôt</Text>
      </View>)
    }else if(!this.props.isOK) {
      content = (<View style={{flex: 1, justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
      <Text style={{textAlign:"center"}}>Pas de données de contact pour cette application</Text>
      <Text style={{textAlign:"center"}}>Vérifiez l'interface d'administration</Text>
    </View>)
    }else {
      const lines = this.props.formData.lines;
      content = (<Form disabled={!this.state.submitting}>
        <Separator><Text>Coordonnées</Text></Separator>
        {lines.map(({ label, name, type, validate, ...props }, index) => {
          let value = this.state[name];
          if (type === "input") {
            return (<FormInput
              key={name} name={name}
              onChange={onChange}
              onSubmitEditing={(v) => this.setState({ focus: index + 1 })}
              focus={this.state.focus === index}
              first={index == 0}
              last={index == lines.length - 1 || (lines[index + 1].type !== "input")}
              validate={validate}
              value={value}
              {...props}
            >{label}</FormInput>)
          } else if (type === "select") {
            return <ButtonPicker key={name} name={name} value={value} onChange={onChange} {...props}>{label}</ButtonPicker>
          }
        })}
        <View style={{ padding: 4, paddingVertical: 40, alignSelf: "center" }}>
          <Button style={{ width: 300, justifyContent: "center" }} disabled={!canSubmit} onPress={this.submit}><Text>Envoyer</Text></Button>
        </View>
      </Form>)
    }

    return <Container>
      <Header>
        <Left >
          <Button transparent onPress={() => this.props.navigation.goBack()}>
            <Icon style={{ fontSize: 17 }} name="chevron-back-outline" /><Text>Retour</Text>
          </Button>
        </Left>
        <Body>
          <Title>Contactez-nous</Title>
        </Body>
        <Right>
          {canSubmit ? <Button transparent onPress={()=>{
            if(this.state.error || this.state.status =="sent") this.props.navigation.goBack();
            else this.submit()
          }}>
            <Text>ok</Text>
          </Button> : <Text>&nbsp;</Text>}
        </Right>
      </Header>
      <Content>
        {content}
      </Content>
    </Container>
  }
}

export default connect((state)=>{
  const {contactForm} = getConfig(state);
  return {
    formData: contactForm, 
    isOK: contactForm && Array.isArray(contactForm.lines) && contactForm.to && contactForm.template
  };
})(ContactScreen);