const cp = require('child_process')
const chokidar = require('chokidar')
const path = require('path')
const chalk = require('chalk')
const fs = require('fs')
const merge = require('lodash/merge')
const fsex = require('fs-extra')
const axios = require('axios')

const isDev = !!process.env.NODE_ENV_DEV

const resolve = (dir = '') => {
  return path.resolve(__dirname, '..', dir)
}

// 执行一段bash shell命令
const worker = (cmd) => {
  return new Promise(resolve => {
    let sh = cp.spawn(cmd, [], {shell: true, stdio: 'inherit'})
    sh.on('close', () => {
      return resolve()
    })
  })
}

const write = (file, data, op = {}) => {
  return new Promise(resolve => {
    resolve(fs.writeFileSync(file, data, merge(
      {flag: 'w+', encoding: 'utf-8', mode:'0666'},
      op
    )))
  })
}

const parseConfig = () => {
  let cfs = [
    resolve('config/default.js'),
    resolve('config/local.js')
  ]
  let config = {}
  cfs.forEach(cf => {
    let isExists = fs.existsSync(cf)
    if (isExists) {
      delete require.cache[require.resolve(cf)]
      let datas = require(cf)
      config = merge({} ,config, datas)
    }
  })
  return config
}

const overwriteStyle = () => {
  return new Promise(async resolved => {
    let style = parseConfig().style
    let str = ``
    for (key in style.override) {
      str += `$${key} = ${style.override[key]}\n`
    }
    await write(resolve('.vuepress/override.styl'), str)
    resolved()
  })
}

const copyAssets = () => {
  return new Promise(async resolved => {
    await fsex.copy(resolve('assets'), resolve('.vuepress/public'))
    resolved()
  })
}

const parseTheme = async () => {
  // 获取config中的theme项
  // 尝试安装主题
  return new Promise(resolved => {
    let config = parseConfig()
    if (!config.theme) {
      return resolved()
    }
    let theme = `nb-sdb-theme-${config.theme}`
    if (fs.existsSync(resolve(`node_modules/${theme}`))) {
      return resolved()
    }
    console.log()
    console.log(chalk.cyan(`fetching ${theme} ...`))
    console.log()
    axios.get(`url/${theme}`)// url 是自己的放置的淘宝镜像依赖的地址 打开后应该映射到https://registry.npm.taobao.org/
      .then(async res => {
        await worker(`nbnpm i ${theme}; cd node_modules; ln -sf ${theme} vuepress-theme-${config.theme}; cd ..;`)
        return resolved()
      })
      .catch(err => {
        if (err.response.status === 404) {
          console.log()
          console.log(chalk.red(`theme ${theme} not exists.`))
          console.log()
          process.exit(1)
        }
      })
    })
}

const rewriteConfig = async () => {
  let config = parseConfig()
  delete config.style
  let datas = `module.exports = ${JSON.stringify(config)}`
  await write(resolve('.vuepress/config.js'), datas)
}

const update = async (file) => {
  console.log(chalk.gray(`reload config...`))
  await rewriteConfig()
  console.log(chalk.bold.green('config updated'))
}

if (isDev) {
  const configWatcher = chokidar.watch([
    path.join(resolve('config'), '**/*.js'),
  ])

  configWatcher.on('change', update)
}

const run = async () => {
  await copyAssets()
  await parseTheme()
  await overwriteStyle()
  await rewriteConfig()
  if (isDev) {
    await worker(resolve() + `/node_modules/.bin/vuepress dev`)
  }
}
run()
