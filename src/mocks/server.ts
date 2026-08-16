import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import { movieHandlers } from './movieHandlers';

export const server = setupServer(...handlers, ...movieHandlers);
