let base = process.env.NODE_ENV_BASE || '/'
module.exports = {
  // 基路径
  base,
  port: '6002',
  title: 'Blog',
  description: 'Static doc builder based on VuePress',
  // 修改dest需要同步修改package.json中的dist
  dest: 'dist',
  themeConfig: {
    nav: [
      {text: 'Home', link: '/'},
      {text: 'GitLab', link: 'https://github.com/fqs617/blog'},
      {text: 'FE', link: 'https://github.com/fqs617/blog'},
    ]
    // sidebar: [
    //   '/',
    //   ['/usage', 'Usage'],
    //   ['/advanced', 'Advanced']
    // ]
  },
  // markdown: {
  //   anchor: {
  //     permalink: true
  //   },
  //   // 配置目录的渲染，默认[2, 3]
  //   toc: {includeLevel: [2, 3]},
  //   config: md => {
  //     md.use(require('markdown-it-anchor'))
  //     md.use(require('markdown-it-table-of-contents'))
  //   }
  // },
  style: {
    override: {
      // 链接颜色
      accentColor: '#0081ff', //#3eaf7c
      // 文字颜色
      textColor: '#2c3e50',
      // border颜色
      borderColor: '#eaecef',
      // 代码块背景色
      codeBgColor: '#282c34'
    }
  }
}
