import fs from 'fs'
import { prisma } from '../prisma/prisma.ts'
import bcrypt from 'bcrypt'

function parseJSON(filePath: string): any {
    try {
        const content = fs.readFileSync(filePath, 'utf-8')
        return content;
    } catch (e) {
        console.error(`Erreur de lecture ou de parsing du fichier JSON : ${filePath}`, e)
        return null
    }
}

function parseCSV(filePath: string): Record<string, string>[] {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n').filter(l => l.trim() !== '')
    const headers = lines[0].split(';').map(h => h.trim())

    return lines.slice(1).map(line => {
        const values = line.split(';').map(v => v.trim())
        const row: Record<string, string> = {}
        headers.forEach((h, i) => row[h] = values[i] ?? '')
        return row
    }).filter(row => row['CollectionID'] !== '' && row['CollectionID'] !== undefined || row['Id'] !== '')
}

// methode .upsert = mix de update et insert, insert l'entree
// update en cas de duplicate.

async function importCreatures() {
    const rows = parseCSV('/app/databases/creatures/CREATURE_DB.csv')
    for (const row of rows) {
        const data = {
                id: row['CollectionID'],
                name: row['Name'],
                type: 'creature',
                class: row['Class'],
                rune_cost: parseInt(row['Rune Cost']),
                force: parseInt(row['Force']),
                endurance: parseInt(row['Endurance']),
                effect_text: row['Effect (string)'],
                effect: parseJSON("/app/databases/creatures/effects/" + row['Effect (json path)']),
                illustration: row['Illustration'],
                target_number: parseInt(row['Target Number']),
                target_type: row['Target Type']
            }
        await prisma.card.upsert({
            where: { id: row['CollectionID'] },
            update: data, // Si elle existe, on met à jour tout
            create: data
        })
        console.log(`Créature importée : ${row['Name']}`)
    }
}

async function importBuildings() {
    const rows = parseCSV('/app/databases/buildings/BUILDINGS_DB.csv')
    for (const row of rows) {
        const data = {
                id: row['CollectionID'],
                name: row['Name'],
                type: 'building',
                class: row['Class'],
                rune_cost: parseInt(row['Rune Cost']),
                endurance: parseInt(row['Life']), // On mappe "Life" vers endurance
                effect_text: row['Effect (string)'],
                effect: parseJSON("/app/databases/buildings/effects/" + row['Effect (json path)']),
                illustration: row['Illustration'],
            }
        await prisma.card.upsert({
            where: { id: row['CollectionID'] },
            update: data,
            create: data
        })
        console.log(`Bâtiment importé : ${row['Name']}`)
    }
}

async function importSpells() {
    const rows = parseCSV('/app/databases/spells/SPELLS_DB.csv')
    for (const row of rows) {
        const data = {
                id: row['CollectionID'],
                name: row['Name'],
                type: 'spell',
                class: row['Class'],
                rune_cost: parseInt(row['Rune Cost']),
                effect_text: row['Effect (string)'],
                effect: parseJSON("/app/databases/spells/effects/" + row['Effect (json path)']),
                illustration: row['Illustration (.png)'],
                target_number: parseInt(row['Target Number']),
                target_type: row['Target Type'],
                timing: row['Timing'] === 'immediate' ? 'immediate' : 'end_of_turn'

            }
        await prisma.card.upsert({
            where: { id: row['CollectionID'] },
            update: data,
            create: data
        })
        console.log(`Sort importé : ${row['Name']}`)
    }
}

async function importHeroes() {
    const rows = parseCSV('/app/databases/heroes/HERO_DB.csv')
    for (const row of rows) {
        const data = {
                id: row['Id'],
                name: row['Class'],
                base_armor: parseInt(row['BaseArmor']),
                passive_text: row['Description'],
                passive_json_path: row['PassiveEffect'],
                illustration: row['Picture'],
                deck: row['Deck']
            }
        await prisma.hero.upsert({
            where: { id: row['Id'] },
            update: data,
            create: data
        })
        console.log(`Héros importé : ${row['Class']}`)
    }
}

async function importUsers() {
    const rows = parseCSV('/app/databases/users/USERS.csv')

    for (const row of rows) {
        await prisma.user.upsert({
            where: { id: parseInt(row['Id']) },
            update: {
                username: row['Username'],
                passwordHash: await bcrypt.hash("prout", 10),
                moodphrase: row['MoodPhrase'],
            },
            create: {
                id: parseInt(row['Id']),
                username: row['Username'],
                passwordHash: await bcrypt.hash("prout", 10),
                moodphrase: row['MoodPhrase'],
            }
        })

        console.log(`User importé : ${row['Username']}`)
    }
}

async function importFriendships() {
    await prisma.friendship.deleteMany()
    await prisma.$executeRaw`ALTER TABLE Room AUTO_INCREMENT = 1`;
    const rows = parseCSV('/app/databases/friends/FRIENDS.csv')

    for (const row of rows) {
        await prisma.friendship.upsert({
            where: {
                userId_friendId: {
                    userId: parseInt(row['UserId']),
                    friendId: parseInt(row['FriendId']),
                }
            },
            update: {},
            create: {
                userId: parseInt(row['UserId']),
                friendId: parseInt(row['FriendId']),
            }
        })

        console.log(`Friendship importée: ${row['UserId']} -> ${row['FriendId']}`)
    }
}

async function importRooms() {
    await prisma.room.deleteMany()
    const rows = parseCSV('/app/databases/rooms/ROOMS_DB.csv')

    for (const row of rows) {

        const p1 = await prisma.user.findUnique({
            where: {
                username: row['Player1']
            }
        })

        if (!p1) {
            console.log(`User not found: ${row['Player1']}`)
            continue
        }

        let p2 = null

        if (row['Player2']) {
            p2 = await prisma.user.findUnique({
                where: {
                    username: row['Player2']
                }
            })
        }

        await prisma.room.upsert({
            where: { id: parseInt(row['id']) },
            update: {
                status: row['Status'] || 'waiting',
            },
            create: {
                id: parseInt(row['id']),
                player1Id: p1.id,
                player2Id: p2?.id,
                status: row['Status'] || 'waiting',
            }
        })
        console.log(
            `Room imported: ${p1.username} vs ${
                p2?.username ?? 'empty'
            }`
        )
    }
}

async function importMessages() {
    await prisma.message.deleteMany()
    const rows = parseCSV('/app/databases/messages/MESSAGES_DB.csv')

    for (const row of rows) {

        const  sender = await prisma.user.findUnique({
            where: {
                id: Number(row['sender_id'])
            }
        })

        if (!sender) {
            console.log
                (`Sender: ${row['sender_id']} not found`);
            continue;
        }

        await prisma.message.create({
            data: {
                senderId: sender.id,
                roomId: row['room_id']
                    ? Number(row['room_id'])
                    : null,
                content: row['content'],
            }
        });

        console.log(
            `Message imported: ${row['content']})`
        );
    }
}

async function main() {
    try {
        await importCreatures()
        await importBuildings()
        await importSpells()
        await importHeroes()
        await importUsers()
        await importFriendships()
        await importMessages()
        await importRooms()
        console.log('Import terminé ✅')
    } catch (e) {
        console.error("Erreur d'import :", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
