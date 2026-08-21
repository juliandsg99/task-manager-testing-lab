require('@testing-library/jest-native/extend-expect');

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Reassure autodetecta la testing library instalada, pero solo tenemos
// @testing-library/react-native (RNTL) en este proyecto; se fija explícito
// como recomienda su documentación, en vez de depender del autodetect.
const { configure: configureReassure } = require('reassure');
configureReassure({ testingLibrary: 'react-native' });

const { server } = require('./src/mocks/server');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
