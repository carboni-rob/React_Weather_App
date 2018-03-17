import React from 'react';
import { shallow, mount, render } from 'enzyme';
import App from './App';

describe('App', () => {
  let app = mount(<App />);
  it('renders the App title', () => {
    //console.log(app.debug());
    expect(
      app
        .find('h2')
        .at(0)
        .text()
    ).toEqual('Weather Dashboard');
  });
});
