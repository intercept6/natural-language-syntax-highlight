import type { APIGatewayProxyResultV2 } from 'aws-lambda';

export const badRequest = (message: string): APIGatewayProxyResultV2 => ({
  statusCode: 400,
  body: JSON.stringify({
    message,
  }),
});

export const internalServerError = (): APIGatewayProxyResultV2 => ({
  statusCode: 500,
  body: JSON.stringify({
    message: 'Internal Server Error',
  }),
});
