import React from 'react'
import IconCard from '../../src/components/IconCard'

import renderer from 'react-test-renderer'

test('renders simple IconCard', () => {
  let tree = renderer.create(<IconCard />).toJSON();
  expect(tree).toMatchSnapshot();
})

test('renders content IconCard', () => {
  tree = renderer.create(<IconCard content="title" />).toJSON();
  expect(tree).toMatchSnapshot();
})

test('renders content and image IconCard', () => {
  tree = renderer.create(<IconCard content="title" source={require("./test.jpg")} />).toJSON();
  expect(tree.children[0].props.style.width).toBe(0.6 * tree.props.style.width);
  expect(tree.children[0].props.style.height).toBe(0.6 * tree.props.style.height);
  expect(tree).toMatchSnapshot();
})
