import { PrismaClient } from '@prisma/client'
import { notificationEmitter } from '../src/events/notificationEmitter.ts'

const basePrisma = new PrismaClient()

export const prisma = basePrisma.$extends({
    query: {

//         query: {
//     // on peut cibler un modèle précis :
//     user: { ... }         // seulement les opérations sur User
//     game: { ... }         // seulement les opérations sur Game

//     // ou tout intercepter d'un coup :
//     $allModels: {
//         create: { ... }         // seulement les create
//         $allOperations: { ... } // vraiment TOUT
//     }
// }

        $allModels: {
            async $allOperations({ model, operation, args, query }: {
                    model: string,
                    operation: string,
                    args: any,
                    query: (args: any) => Promise<any>
                }) {
                const result = await query(args)
// watched a modifier selon ce qu'on veut filtrer pour les notifs
                const watched = ['create', 'update', 'delete', 'createMany', 'updateMany', 'deleteMany']

                if (watched.includes(operation)) {
                    notificationEmitter.emit(`${model}:${operation}`, {
                        model,
                        operation,
                        data: result,
                    })
                }

                return result
            }
        }
    }
})

// Ce qui se passe quand tu fais prisma.user.create({...}) :

// prisma.user.create({ data: { username: "test" } })
//         │
//         ▼
// $allOperations est appelé avec :
//     model     = "User"
//     operation = "create"
//     args      = { data: { username: "test" } }
//     query     = [la fonction qui fait le vrai INSERT en DB]
//         │
//         ▼
// await query(args)  ← là MySQL reçoit le INSERT
//         │
//         ▼
// result = { id: 1, username: "test", createdAt: ... }