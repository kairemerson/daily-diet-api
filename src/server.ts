import fastify from 'fastify'

const app = fastify();

app.post('/user', () => {
  return 'teste'
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP server running')
  })
