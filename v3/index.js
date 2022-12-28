const { ApolloServer, gql } = require('apollo-server')
const { HttpQueryError } = require('apollo-server-core')
const assert = require('assert')
const { fetch } = require('undici')

class AuthPlugin {
  requestDidStart () {
    throw new HttpQueryError(403, 'Unauthorized')
  }
}

const typeDefs = gql`
  type Query {
    ok: Boolean!
  }
`

const server = new ApolloServer({
  typeDefs,
  plugins: [new AuthPlugin()]
})

async function main () {
  const { url } = await server.listen()

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"query":"{ok}"}'
  })
  const body = await response.text()
  const { status } = response
  assert.strictEqual(body, 'Unauthorized', 'Apollo v3 should set body equal to "Unauthorized"')
  assert.strictEqual(status, 403, 'Apollo v3 should set status code equal to 403')
  server.stop()
}

main()
