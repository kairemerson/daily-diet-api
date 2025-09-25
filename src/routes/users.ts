import type { FastifyInstance } from "fastify"
import { knexdb } from "../database.js"
import {z} from "zod"
import { randomUUID } from "node:crypto"

export async function userRoutes(app: FastifyInstance) {
    app.post('/', async (request, reply) => {
        const createUserBodySchema = z.object({
            name: z.string(),
            email: z.email(),
            password: z.string()
        })

        const {name, email, password} = createUserBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId

        
        const user = await knexdb("users").insert({
            id: randomUUID(),
            name,
            email,
            password,
        }).returning("id")

        if(!sessionId) {
            sessionId = user[0].id

            
            reply.cookie("sessionId", sessionId, {
                path: "/",
                maxAge: 60 * 24 * 7 // 7 days
            })
        }

        return reply.status(201).send()
    })
}