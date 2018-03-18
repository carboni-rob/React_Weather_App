import React from 'react';
import { shallow, mount, render } from 'enzyme';
import App from './App';

describe('App', () => {
  let app = mount(<App />);
  it('creates a Grid component', () => {
    expect(app.find('Grid').exists()).toBe(true);
  });
  describe('It creates a Card with the title', () => {
    it('renders a Card component', () => {
      expect(
        app
          .find('Card')
          .at(0)
          .exists()
      ).toBe(true);
    });
    it('renders the App title', () => {
      expect(
        app
          .find('h2')
          .at(0)
          .text()
      ).toEqual('Weather Dashboard');
    });
  });
  describe('renders a Form component', () => {
    it('creates a Form component', () => {
      expect(app.find('Form').exists()).toBe(true);
    });
    it('creates a FormGroup component', () => {
      expect(app.find('Form').exists()).toBe(true);
    });
    it('FormGroup component has validationState', () => {
      expect(app.find('Form').validationState().toEqual(app.state.validationState);
    });
  });
});
