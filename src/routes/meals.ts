import type { FastifyInstance } from "fastify"
import { knexdb } from "../database.js"
import {z} from "zod"
import { randomUUID } from "node:crypto"
import { checkSessionIdExists } from "../middlewares/check-session-id-exists.js"

export async function mealRoutes(app: FastifyInstance) {

    app.get("/", {preHandler: [checkSessionIdExists]}, async (request) => {

        const sessionId = request.cookies.sessionId

        const meals = await knexdb("meals")
            .where("user_id", sessionId)
            .select()

        return {
            meals
        }
    })

    app.get("/:id", {preHandler: [checkSessionIdExists]}, async (request) => {
        const getMealParamsSchema = z.object({
            id: z.string().uuid()
        })
        
        const sessionId = request.cookies.sessionId

        const {id} = getMealParamsSchema.parse(request.params)

        const meal = await knexdb("meals").where({user_id: sessionId, id}).first()

        return {
            meal
        }
    })

    

    app.delete("/:id", {preHandler: [checkSessionIdExists]}, async (request) => {
        const getMealParamsSchema = z.object({
            id: z.string().uuid()
        })
        
        const sessionId = request.cookies.sessionId

        const {id} = getMealParamsSchema.parse(request.params)

        const meal = await knexdb("meals").where({user_id: sessionId, id}).delete()

        return {
            meal
        }
    })

    app.get("/summary", {preHandler: [checkSessionIdExists]}, async (request) => {

        const sessionId = request.cookies.sessionId

        const meals = await knexdb("meals").where("user_id", sessionId)

        const total = meals.length
        const isDiet = meals.filter(meal => meal.isDiet).length
        const isNotDiet = meals.filter(meal => !meal.isDiet).length

        let currentSequence = 0
        let bestSequence = 0

        for (const meal of meals) {
            if(meal.isDiet) {
                currentSequence++
                if(currentSequence > bestSequence) {
                    bestSequence = currentSequence
                }
            }else {
                currentSequence = 0
            }
        }

        return {
            total,
            isDiet,
            isNotDiet,
            bestSequence
        }
    })

    app.post('/', async (request, reply) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            date: z.string(),
            hour: z.string(),
            isDiet: z.boolean()
        })

        const sessionId = request.cookies.sessionId

        const {name, description, date, hour, isDiet} = createMealBodySchema.parse(request.body)

        await knexdb("meals").insert({
            id: randomUUID(),
            name,
            description,
            date,
            hour,
            isDiet,
            user_id: sessionId
        })

        return reply.status(201).send()
    })

    app.put('/:id', async (request, reply) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            date: z.string(),
            hour: z.string(),
            isDiet: z.boolean()
        })

        const updateMealParamsSchema = z.object({
            id: z.string().uuid()
        })

        const {name, description, date, hour, isDiet} = createMealBodySchema.parse(request.body)
        const {id} = updateMealParamsSchema.parse(request.params)


        await knexdb("meals").where({id}).update({
            name,
            description,
            date,
            hour,
            isDiet,
        })

        return reply.status(201).send()
    })
}