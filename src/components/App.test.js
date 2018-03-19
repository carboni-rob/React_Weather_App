import React from 'react';
import App from './App';
import { shallow, mount } from 'enzyme';
import renderer from 'react-test-renderer';
import fetchMock from 'fetch-mock';

describe('App component', () => {
  it('matches the snapshot', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('Error message', () => {
  it('does not render the error message on default', () => {
    const wrapper = mount(<App />);
    expect(wrapper.find('h4.errMsg').exists()).toEqual(false);
  });
});

describe('Map component', () => {
  it('does not render the map on default', () => {
    const wrapper = mount(<App />);
    expect(wrapper.find('Card.mapCard').exists()).toEqual(false);
  });
});

describe('Chart component', () => {
  it('does not render the chart on default', () => {
    const wrapper = mount(<App />);
    expect(wrapper.find('Card.chardCard').exists()).toEqual(false);
  });
});
