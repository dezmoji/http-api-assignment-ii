const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponse.js');
const jsonHandler = require('./jsonResponse.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  index: htmlHandler.getIndex,
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCSS,
  '/addUser': jsonHandler.addUser,
  '/getUsers': jsonHandler.getUsers,
  '/notReal': jsonHandler.notFound,
  notFound: jsonHandler.notFound,
};

const onRequest = (request, response) => {
  const parsedURL = url.parse(request.url).pathname;
  if (request.method === 'POST' && parsedURL === '/addUser') {
    const res = response;

    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);
      jsonHandler.addUser(request, res, bodyParams);
    });
  } else if (urlStruct[parsedURL]) {
    urlStruct[parsedURL](request, response);
  } else {
    urlStruct.notFound(request, response);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);