import path from 'path'
import fs from 'fs'
import { exec, spawnSync } from 'child_process'

export default class WebpackNightWatchPlugin {

  constructor(options = {}) {
    const defaultOptions = {
      onEmit: false
    }
    this.options = Object.assign({}, defaultOptions, options)
  }

  apply(compiler) {

    compiler.plugin('compilation', (compilation) => {
      spawnSync('pkill', ['-f', 'selenium'])
    })

    compiler.plugin(this.options.onEmit ? 'emit' : 'done', (compilation, callback) => {
      const env = Object.assign({}, process.env, { LANG: 'en_US.UTF-8' });

      var nightwatchPath = path.join(__dirname, '../node_modules/.bin/nightwatch');
      if (!fs.existsSync(nightwatchPath)) {
        // leave the folder "lib" and the folder "webpack-nightwatch-plugin"
        nightwatchPath = path.join(__dirname, '../../.bin/nightwatch');
      }
      var nightwatch = exec(nightwatchPath, [
        '-c',
        this.options.url
      ], { env });

      nightwatch.stdout.on('data', data => {
        process.stdout.write(data.toString())
      })

      nightwatch.stderr.on('data', data => {
        process.stdout.write(data.toString())
      })

      nightwatch.on('close', () => {
        if (this.options.onEmit) callback()
        spawnSync('pkill', ['-f', 'selenium'])
      })
    })

  }
}
