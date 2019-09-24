import React, { Component, PropTypes } from 'react';
import {
  Dimensions,
  PanResponder,
  View,
  ImageBackground,
} from 'react-native';

const HEIGHT = Dimensions.get('window').height;
const WIDTH = Dimensions.get('window').width;
const size = 100;
const styles = {
  container: {
    position: 'absolute',
    left: WIDTH / 2 - size/2,
    bottom: 50,
    width: 100,
    height: 100,
    backgroundColor: "transparent"
  },
  rectangle: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: size,
    height: size,
    zIndex: 10
  },
  base: {
    position: 'absolute',
    left: -size/2,
    top: -size/2,
    width: size*2,
    height: size*2,
    borderRadius: size,
    zIndex: 9
  },
};

import MatrixMath from 'react-native/Libraries/Utilities/MatrixMath';

export const rotateXY = (dx, dy) => {
  const radX = (Math.PI / 180) * dy;
  const cosX = Math.cos(radX);
  const sinX = Math.sin(radX);

  const radY = (Math.PI / 180) * -dx;
  const cosY= Math.cos(radY);
  const sinY = Math.sin(radY);

  return [
    cosY, sinX * sinY, cosX * sinY, 0,
    0, cosX, -sinX, 0,
    -sinY, cosY * sinX, cosX * cosY, 0,
    0, 0, 0, 1
  ];
};

export const rotateXZ = (dx, dy) => {
  const radX = (Math.PI / 180) * dx;
  const cosX = Math.cos(radX);
  const sinX = Math.sin(radX);

  const radY = (Math.PI / 180) * dy;
  const cosY= Math.cos(radY);
  const sinY = Math.sin(radY);

  return [
    cosX, -cosY * sinX, sinX * sinY, 0,
    sinX, cosX * cosY, -sinY * cosX, 0,
    0, sinY, cosY, 0,
    0, 0, 0, 1
  ];
};

//source: https://gist.github.com/jmurzy/0d62c0b5ea88ca806c16b5e8a16deb6a#file-foldview-transformutil-transformorigin-js
export const transformOrigin = (matrix, origin) => {
  const { x, y, z } = origin;

  const translate = MatrixMath.createIdentityMatrix();
  MatrixMath.reuseTranslate3dCommand(translate, x, y, z);
  MatrixMath.multiplyInto(matrix, translate, matrix);

  const untranslate = MatrixMath.createIdentityMatrix();
  MatrixMath.reuseTranslate3dCommand(untranslate, -x, -y, -z);
  MatrixMath.multiplyInto(matrix, matrix, untranslate);
};

const dy = 10;
export default class Cube extends Component {
  componentWillMount() {
    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: this.handlePanResponderMove.bind(this)
    });
  }
  componentDidMount() {
    this.move(45, dy);
  }

  handlePanResponderMove (e, gestureState) {
    const { dx } = gestureState;
    this.move(dx, dy);
  }

  move(dx, dy){
    const origin = { x: 0, y: 0, z: -size/2 };
    let matrix = rotateXY(dx, dy);
    transformOrigin(matrix, origin);
    this.refViewFront.setNativeProps({style: {transform: [{perspective: 1000}, {matrix: matrix}]}});

    matrix = rotateXY(dx + 180, dy);
    transformOrigin(matrix, origin);
    this.refViewBack.setNativeProps({style: {transform: [{perspective: 1000}, {matrix: matrix}]}});

    matrix = rotateXY(dx + 90, dy);
    transformOrigin(matrix, origin);
    this.refViewRight.setNativeProps({style: {transform: [{perspective: 1000}, {matrix: matrix}]}});

    matrix = rotateXY(dx - 90, dy);
    transformOrigin(matrix, origin);
    this.refViewLeft.setNativeProps({style: {transform: [{perspective: 1000}, {matrix: matrix}]}});

    matrix = rotateXZ(dx, dy - 90);
    transformOrigin(matrix, origin);
    this.refViewTop.setNativeProps({style: {transform: [{perspective: 1000}, {matrix: matrix}]}});

    matrix = rotateXZ(-dx, dy + 90);
    transformOrigin(matrix, origin);
    this.refViewBottom.setNativeProps({style: {transform: [{perspective: 1000}, {matrix: matrix}]}});
  }

  renderLeft(color) {
    return (
      <View
        ref={component => this.refViewRight = component}
        style={[styles.rectangle, (color) ? {backgroundColor: color} : null]}
        {...this.panResponder.panHandlers}
      />
    )
  }

  renderRight(color) {
    return (
      <View
        ref={component => this.refViewLeft = component}
        style={[styles.rectangle, (color) ? {backgroundColor: color} : null]}
        {...this.panResponder.panHandlers}
      />
    )
  }

  renderFront(color) {
    return (
      <View
        ref={component => this.refViewFront = component}
        style={[styles.rectangle, (color) ? {backgroundColor: color} : null]}
        {...this.panResponder.panHandlers}
      />
    )
  }

  renderBack(color) {
    return (
      <View
        ref={component => this.refViewBack = component}
        style={[styles.rectangle, (color) ? {backgroundColor: color} : null]}
        {...this.panResponder.panHandlers}
      />
    )
  }

  renderTop(color) {
    return (
      <View
        ref={component => this.refViewTop = component}
        style={[styles.rectangle, (color) ? {backgroundColor: color} : null]}
        {...this.panResponder.panHandlers}
      />
    )
  }

  renderBottom(color) {
    return (
      <ImageBackground source={require('../../assets/cogwheel.png')}
        ref={component => this.refViewBottom = component}
        style={[styles.base, (color) ? {backgroundColor: 'color'} : null]}
        {...this.panResponder.panHandlers}
      />
    )
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderFront('#FFBC42')}
        {this.renderBack('#8F2D56')}
        {this.renderLeft('#E31937')}
        {this.renderRight('#F39AA7')}
        {this.renderTop('#FF6B00')}
        {this.renderBottom('transparent')}
      </View>
    );
  }
}