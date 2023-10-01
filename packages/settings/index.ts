import dotenv from 'dotenv'
dotenv.config()

import { Section } from './src/blocks/section.js'
import arangoSection from './src/sections/arangoSection.js'
import apiSection from './src/sections/apiSection.js'
import spotifySection from './src/sections/spotifySection.js'
import generalSection from './src/sections/generalSection.js'


export class Config {
    static arangodb = arangoSection
    static apollo = apiSection
    static spotify = spotifySection
    static general = generalSection

    static load = (sections: Section|Section[]) => {
        if (!Array.isArray(sections)) sections = [sections]
        const errors: string[] = []
        
        for (const section of sections) {
            errors.push(...section.load())
        }
        if (errors.length > 0) throw new Error(`Couldn't load config. Summary of errors:${
            errors.map(error => `\n  -> ${error}`).join("")
        }`)

    }
}
