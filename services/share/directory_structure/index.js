import fs from 'fs/promises'

async function ensureDir (dirpath) {
    try {
      await fs.mkdir(dirpath, { recursive: true })
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }
}

async function ensureTypeDirs(root, types) {
    types.map(type => ensureDir(`${root}/${type}`))
}

export default ensureTypeDirs