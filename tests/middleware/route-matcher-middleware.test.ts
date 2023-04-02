import { describe, expect, test } from '@jest/globals';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { createNotFound } from '@chubbyts/chubbyts-http-error/dist/http-error';
import type { Match } from '../../src/router/route-matcher';
import { createRouteMatcherMiddleware } from '../../src/middleware/route-matcher-middleware';
import type { Route } from '../../src/router/route';

describe('createRouteMatcherMiddleware', () => {
  test('match', async () => {
    const route = { attributes: { key: 'value' }, _route: 'Route' } as unknown as Route;
    const request = {} as ServerRequest;
    const response = {} as Response;

    const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
      expect(givenRequest).toEqual({
        ...givenRequest,
        attributes: { ...givenRequest.attributes, route, ...route.attributes },
      });

      return response;
    });

    const match: Match = jest.fn((givenRequest: ServerRequest): Route => {
      expect(givenRequest).toBe(request);

      return route;
    });

    const routeMatcherMiddleware = createRouteMatcherMiddleware(match);

    expect(await routeMatcherMiddleware(request, handler)).toBe(response);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(match).toHaveBeenCalledTimes(1);
  });

  test('no match', async () => {
    const httpError = createNotFound({
      detail:
        'The page "/" you are looking for could not be found. Check the address bar to ensure your URL is spelled correctly.',
    });

    const request = {} as ServerRequest;
    const response = {} as Response;

    const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
      expect(givenRequest).toBe(request);

      return response;
    });

    const match: Match = jest.fn((givenRequest: ServerRequest): Route => {
      expect(givenRequest).toBe(request);

      throw httpError;
    });

    const routeMatcherMiddleware = createRouteMatcherMiddleware(match);

    try {
      await routeMatcherMiddleware(request, handler);
      fail('Missing error');
    } catch (e) {
      expect(e).toBe(httpError);
    }

    expect(handler).toHaveBeenCalledTimes(0);
    expect(match).toHaveBeenCalledTimes(1);
  });
});
