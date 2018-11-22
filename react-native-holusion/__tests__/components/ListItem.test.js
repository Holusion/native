import React from 'react'
import {Text} from 'react-native'

import ListItem from '../../src/components/ListItem'

import renderer from 'react-test-renderer'

test('renders ListItem correctly', () => {
  let tree = renderer.create(<ListItem><Text>Blabla</Text></ListItem>).toJSON();
  expect(tree).toMatchSnapshot();

  tree = renderer.create(<ListItem><Text>Foo</Text><Text>Bar</Text></ListItem>).toJSON();
  expect(tree).toMatchSnapshot();
})
