import { ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import { Route } from './route';

export type Match = (request: ServerRequest) => Route;
