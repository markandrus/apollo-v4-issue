# apollo-v4-issue

This project demonstrates an issue with Apollo v4, as compared to Apollo v3.

In Apollo v3, we could throw an HttpQueryError from a plugin's `requestDidStart`
method in order to control the HTTP server's response code. I used this to build
an authentication plugin that can respond with 403 Forbidden for unauthenticated
and unauthorized requests. A mock version of this can be found in
[the v3 folder](v3/).

In Apollo v4, HttpQueryError is removed and we should instead throw a
GraphQLError from the plugin's `requestDidStart` method. In theory, we can set
`http` inside of `extensions` with whatever `status` and `headers` we want.
Unfortunately, this does not seem to work in practice. Again, a mock version of
this can be found in [the v4 folder](v4/).

## Usage

```
npm install
npm test
```

```
$ npm test

> apollo-v4-issue-monorepo@0.1.0 test
> (cd v3; npm test) && (cd v4; npm test)


> apollo-v3-issue@0.1.0 test
> node index.js


> apollo-v4-issue@0.1.0 test
> node index.js

Unexpected error processing request: Unauthorized
node:internal/process/promises:279
            triggerUncaughtException(err, true /* fromPromise */);
            ^

AssertionError [ERR_ASSERTION]: Apollo v4 should set body equal to "Unauthorized"
    at main (/Users/mark/src/mark/apollo-v4-issue/v4/index.js:41:10)
    at processTicksAndRejections (node:internal/process/task_queues:96:5) {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: '{"errors":[{"message":"Internal server error","extensions":{"code":"INTERNAL_SERVER_ERROR","stacktrace":["Error: Internal server error","    at internalExecuteOperation (/Users/mark/src/mark/apollo-v4-issue/node_modules/@apollo/server/dist/cjs/ApolloServer.js:624:15)","    at processTicksAndRejections (node:internal/process/task_queues:96:5)","    at async runHttpQuery (/Users/mark/src/mark/apollo-v4-issue/node_modules/@apollo/server/dist/cjs/runHttpQuery.js:135:29)","    at async runPotentiallyBatchedHttpQuery (/Users/mark/src/mark/apollo-v4-issue/node_modules/@apollo/server/dist/cjs/httpBatching.js:37:16)","    at async ApolloServer.executeHTTPGraphQLRequest (/Users/mark/src/mark/apollo-v4-issue/node_modules/@apollo/server/dist/cjs/ApolloServer.js:525:20)"]}}]}\n',
  expected: 'Unauthorized',
  operator: 'strictEqual'
}
npm ERR! Lifecycle script `test` failed with error:
npm ERR! Error: command failed
npm ERR!   in workspace: apollo-v4-issue@0.1.0
npm ERR!   at location: /Users/mark/src/mark/apollo-v4-issue/v4
```
