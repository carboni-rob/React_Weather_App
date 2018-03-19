import requestAnimationFrame from './tempPolyfills';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import fetchMock from 'fetch-mock';
afterEach(fetchMock.restore);

configure({ adapter: new Adapter(), disableLifecycleMethods: true });
