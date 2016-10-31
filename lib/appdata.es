
import fs from 'fs-extra'
import path from 'path-extra'
import zlib from 'zlib'
import { promisify } from 'bluebird'
import CSV from 'lib/csv'
import { IndexCompat, PacketCompat } from 'lib/compat'

const readDirAsync = promisify(fs.readdir)
const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const gzipAsync = promisify(zlib.gzip)
const unzipAsync = promisify(zlib.unzip)
const GZIP_EXT = '.gz'

const APPDATA = path.join(window.APPDATA_PATH, 'battle-detail')
const INDEX = 'index10.csv' + GZIP_EXT
const INDEX_CSV_OPTIONS = {
  columns: ['id', 'time', 'map', 'desc'],
}

class AppData {
  constructor() {
    fs.ensureDir(APPDATA, (err) => {
      if (err) console.error(err)
    })

    IndexCompat.moveDB(APPDATA)
  }

  async saveFile(name, data) {
    if (!(name && data)) return
    if (path.parse(name).ext === GZIP_EXT) {
      data = await gzipAsync(data)
    }
    let fpath = path.join(APPDATA, name)
    await writeFileAsync(fpath, data)
  }

  async loadFile(name) {
    if (!(name)) return
    try {
      let fpath = path.join(APPDATA, name)
      let data = await readFileAsync(fpath)
      if (path.parse(name).ext === GZIP_EXT) {
        data = await unzipAsync(data)
        data = data.toString()
      }
      return data
    }
    catch (err) {
      if (err.code !== 'ENOENT')
        console.error(err)
      return null
    }
  }

  async saveIndex(index) {
    if (index != null) {
      let data = CSV.stringify(index, INDEX_CSV_OPTIONS)
      await this.saveFile(INDEX, data)
    }
  }

  async loadIndex() {
    let data = await this.loadFile(INDEX)
    if (data != null) {
      return CSV.parse(data, INDEX_CSV_OPTIONS)
    }
  }

  async saveBattle(id, packet) {
    if (!(id && packet))
      return
    let name = `${id}.json` + GZIP_EXT
    let data = JSON.stringify(packet)
    await this.saveFile(name, data)
  }

  async loadBattle(id) {
    if (!(id))
      return

    // Compatibility: Read 123456.json.gz & 123456.json
    let data = null
    for (let name of [`${id}.json` + GZIP_EXT, `${id}.json`]) {
      data = await this.loadFile(name)
      if (data != null) {
        break
      }
    }
    if (data == null)
      return

    let packet = JSON.parse(data)
    // Compatibility: Battle packet format
    packet = PacketCompat.v10tov21(packet)
    packet = PacketCompat.v20tov21(packet)
    return packet
  }

  async listBattle() {
    const BATTLE_REGEXP = /^(\d+)\.json/
    let ids = []
    let files = await readDirAsync(APPDATA)
    files.map((file, i) => {
      let match = file.match(BATTLE_REGEXP)
      if (match && match[1]) {
        ids.push(parseInt(match[1]))
      }
    })
    return ids
  }
}

export default new AppData()
