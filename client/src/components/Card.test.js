import React from 'react';
import ReactDOM from 'react-dom';
import {MemoryRouter} from "react-router";

import Card from './Card';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter>
    <Card url="http://foo.appspot.com/bar" title="bar"/>
  </MemoryRouter>, div);
  ReactDOM.unmountComponentAtNode(div);
});
