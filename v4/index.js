const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const assert = require('assert')
const { GraphQLError } = require('graphql')
const gql = require('graphql-tag')
const { fetch } = require('undici')

class AuthPlugin {
  requestDidStart () {
    throw new GraphQLError('Unauthorized', {
      extensions: {
        http: { status: 403 }
      }
    })
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
  const { url } = await startStandaloneServer(server, {
    context: async () => ({})
  })

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"query":"{ok}"}'
  })
  const body = await response.text()
  const { status } = response
  assert.strictEqual(body, 'Unauthorized', 'Apollo v4 should set body equal to "Unauthorized"')
  assert.strictEqual(status, 403, 'Apollo v4 should set status code equal to 403')
  server.stop()
}

main()
