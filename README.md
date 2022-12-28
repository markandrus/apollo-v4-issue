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
