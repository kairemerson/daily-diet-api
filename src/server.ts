import fastify from 'fastify'
import { userRoutes } from './routes/users.js';
import { env } from './env/index.js';
import { mealRoutes } from './routes/meals.js';
import cookie from "@fastify/cookie"

const app = fastify();

app.register(cookie)

app.register(userRoutes, {
  prefix: "user"
})

app.register(mealRoutes, {
  prefix: "meal"
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log(`HTTP server running in the port: ${env.PORT}`)
  })
