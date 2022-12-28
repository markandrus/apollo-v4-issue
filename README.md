# apollo-v4-issue

This project demonstrates an issue with Apollo v4 compared to Apollo v3.

In Apollo v3, we could throw an HttpQueryError from a plugin's `requestDidStart`
method in order to control the HTTP server's response code. I used this to build
an authentication plugin that can respond with 403 Forbidden for unauthenticated
and unauthorized requests. A mock version of this can be found in
[the v3 folder](v3/).

In Apollo v4, HttpQueryError is removed, and so I think we should throw a
GraphQLError from the plugin's `requestDidStart` method instead. In theory, we
can set `http` inside of `extensions` with whatever `status` and `headers` we
want. Unfortunately, this does not seem to work, due to
[this section of ApolloServer.ts](https://github.com/apollographql/apollo-server/blob/d7e9b97595b063f1e796ec4449850a16d19e8b18/packages/server/src/ApolloServer.ts#L1290-L1305).
Again, a mock version of this can be found in [the v4 folder](v4/).

It appears that we can still control the status code if we re-throw from a
plugin's `unexpectedErrorProcessingRequest` method. I have checked a workaround
in under [the v4-workaround folder](v4-workaround/). Note that I take care to
only re-throw my own error inside of `unexpectedErrorProcessingRequest`.

Even with the workaround, there is a behavior change between Apollo v3 and v4.
How can we recover the behavior of v3?

## Usage

```
npm install
npm test
```

```
> apollo-v4-issue-monorepo@0.1.0 test
> (cd v3; npm test) && (cd v4; npm test) && (cd v4-workaround; npm test)


> apollo-v3-issue@0.1.0 test
> node index.js

Unauthorized

> apollo-v4-issue@0.1.0 test
> node index.js || true

Unexpected error processing request: Unauthorized
{"errors":[{"message":"Internal server error","extensions":{"code":"INTERNAL_SERVER_ERROR","stacktrace":["Error: Internal server error","    at internalExecuteOperation (/Users/mark/src/mark/apollo-v4-issue/node_modules/@apollo/server/dist/cjs/ApolloServer.js:624:15)","    at processTicksAndRejections (node:internal/process/task_queues:96:5)","    at async runHttpQuery (/Users/mark/src/mark/apollo-v4-issue/node_modules/@apollo/server/dist/cjs/runHttpQuery.js:135:29)","    at async runPotentiallyBatchedHttpQuery (/Users/mark/src/mark/apollo-v4-issue/node_modules/@apollo/server/dist/cjs/httpBatching.js:37:16)","    at async ApolloServer.executeHTTPGraphQLRequest (/Users/mark/src/mark/apollo-v4-issue/node_modules/@apollo/server/dist/cjs/ApolloServer.js:525:20)"]}}]}

node:internal/process/promises:279
            triggerUncaughtException(err, true /* fromPromise */);
            ^

AssertionError [ERR_ASSERTION]: Apollo v4 should set status code equal to 403
    at main (/Users/mark/src/mark/apollo-v4-issue/v4/index.js:45:10)
    at processTicksAndRejections (node:internal/process/task_queues:96:5) {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: 500,
  expected: 403,
  operator: 'strictEqual'
}

> apollo-v4-issue-workaround@0.1.0 test
> node index.js

{"errors":[{"message":"Unauthorized","extensions":{"code":"UNAUTHORIZED","stacktrace":["GraphQLError: Unauthorized","    at new AuthPluginError (/Users/mark/src/mark/apollo-v4-issue/v4-workaround/index.js:10:5)","    at AuthPlugin.requestDidStart (/Users/mark/src/mark/apollo-v4-issue/v4-workaround/index.js:21:11)","    at /Users/mark/src/mark/apollo-v4-issue/node_modules/@apollo/server/dist/cjs/requestPipeline.js:27:97","    at Array.map (<anonymous>)","    at processGraphQLRequest (/Users/mark/src/mark/apollo-v4-issue/node_modules/@apollo/server/dist/cjs/requestPipeline.js:27:67)","    at internalExecuteOperation (/Users/mark/src/mark/apollo-v4-issue/node_modules/@apollo/server/dist/cjs/ApolloServer.js:615:69)","    at runHttpQuery (/Users/mark/src/mark/apollo-v4-issue/node_modules/@apollo/server/dist/cjs/runHttpQuery.js:135:82)","    at runPotentiallyBatchedHttpQuery (/Users/mark/src/mark/apollo-v4-issue/node_modules/@apollo/server/dist/cjs/httpBatching.js:37:57)","    at ApolloServer.executeHTTPGraphQLRequest (/Users/mark/src/mark/apollo-v4-issue/node_modules/@apollo/server/dist/cjs/ApolloServer.js:525:79)","    at processTicksAndRejections (node:internal/process/task_queues:96:5)"]}}]}
```
