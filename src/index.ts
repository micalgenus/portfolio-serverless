'use strict';

export const http = (request, response) => {
  response.status(200).send('Hello World!');
};

export const event = (event, callback) => {
  callback();
};
