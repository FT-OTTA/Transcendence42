import fs from 'fs'
import { prisma } from '../prisma/prisma.ts'

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
        await prisma.card.upsert({
            where: { id: row['CollectionID'] },
            update: { name: row['Name'] }, // Si elle existe, on met à jour le nom
            create: {
                id: row['CollectionID'],
                name: row['Name'],
                type: 'creature',
                class: row['Class'],
                rune_cost: parseInt(row['Rune Cost']),
                force: parseInt(row['Force']),
                endurance: parseInt(row['Endurance']),
                effect_text: row['Effect (string)'],
                effect_json_path: row['Effect (json path)'],
                illustration: row['Illustration'],
            }
        })
        console.log(`Créature importée : ${row['Name']}`)
    }
}

async function importBuildings() {
    const rows = parseCSV('/app/databases/buildings/BUILDINGS_DB.csv')
    for (const row of rows) {
        await prisma.card.upsert({
            where: { id: row['CollectionID'] },
            update: { name: row['Name'] },
            create: {
                id: row['CollectionID'],
                name: row['Name'],
                type: 'building',
                class: row['Class'],
                rune_cost: parseInt(row['Rune Cost']),
                endurance: parseInt(row['Life']), // On mappe "Life" vers endurance
                effect_text: row['Effect (string)'],
                effect_json_path: row['Effect (json path)'],
                illustration: row['Illustration'],
            }
        })
        console.log(`Bâtiment importé : ${row['Name']}`)
    }
}

async function importSpells() {
    const rows = parseCSV('/app/databases/spells/SPELLS_DB.csv')
    for (const row of rows) {
        await prisma.card.upsert({
            where: { id: row['CollectionID'] },
            update: { name: row['Name'] },
            create: {
                id: row['CollectionID'],
                name: row['Name'],
                type: 'spell',
                class: row['Class'],
                rune_cost: parseInt(row['Rune Cost']),
                effect_text: row['Effect (string)'],
                effect_json_path: row['Effect (json path)'],
                illustration: row['Illustration (.png)'],
            }
        })
        console.log(`Sort importé : ${row['Name']}`)
    }
}

async function importHeroes() {
    const rows = parseCSV('/app/databases/heroes/HERO_DB.csv')
    for (const row of rows) {
        await prisma.hero.upsert({
            where: { id: row['Id'] },
            update: { name: row['Class'] },
            create: {
                id: row['Id'],
                name: row['Class'],
                base_armor: parseInt(row['BaseArmor']),
                passive_text: row['Description'],
                passive_json_path: row['PassiveEffect'],
                illustration: row['Picture']
            }
        })
        console.log(`Héros importé : ${row['Class']}`)
    }
}

async function main() {
    try {
        await importCreatures()
        await importBuildings()
        await importSpells()
        await importHeroes()
        console.log('Import terminé ✅')
    } catch (e) {
        console.error("Erreur d'import :", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()