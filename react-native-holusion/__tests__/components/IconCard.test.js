import React from 'react'
import IconCard from '../../src/components/IconCard'

import renderer from 'react-test-renderer'

test('renders IconCard correctly', () => {
  let tree = renderer.create(<IconCard />).toJSON();
  expect(tree).toMatchSnapshot();

  tree = renderer.create(<IconCard content="title" />).toJSON();
  expect(tree).toMatchSnapshot();

  tree = renderer.create(<IconCard content="title" source={require("./test.jpg")} />).toJSON();
  expect(tree).toMatchSnapshot();
})
