<template>
  <div class="card article-card" @click="skip">
    <h2 :class="headerOverviewClasses">
      <router-link
        :to="this.info.path" :style="overrideStyle">{{ title }}</router-link>
    </h2>
    <div class="article-content">
      <div class="banner-box" :style="[{
        backgroundColor: `#f1f1f1`,
        backgroundImage: `url(${isBanner || arrImgs[random]})`,
        backgroundRepeat: `no-repeat`,
        backgroundSize: `cover`,
        backgroundPosition: `center center`
      }]">
      </div>
      <div class="text-box">
        <p class="text" v-if="isOverview">
          {{ overview }}
        </p>
        <router-link :to="this.info.path">
          阅读更多
        </router-link>
        <p class="footer">
          <span class="author">{{author}}</span>
          <span>{{date}}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'article-card',
    props: {
      info: {
        type: Object,
        required: true
      }
    },
    data () {
      return {
        arrImgs: [
          'http://7xq4yv.com1.z0.glb.clouddn.com/qomolangma.jpeg',
          'http://7xq4yv.com1.z0.glb.clouddn.com/clownFish.jpeg',
          'http://7xq4yv.com1.z0.glb.clouddn.com/universe.jpeg',
          'http://7xq4yv.com1.z0.glb.clouddn.com/amazon.jpeg',
          'http://7xq4yv.com1.z0.glb.clouddn.com/hunlunBuir.jpeg'
        ],
        random: 0
      }
    },
    created () {
      if (!this.info.frontmatter.banner) {
        this.random = Math.floor((Math.random() / 2) * 10)
      }
    },
    computed: {
      title() {
        return this.info.frontmatter.title || this.info.title
      },
      isOverview() {
        return this.info.frontmatter.description
      },
      overview() {
        return this.info.frontmatter.description
      },
      date() {
        return this.info.frontmatter.date
      },
      author() {
        return this.info.frontmatter.author
      },
      headerOverviewClasses() {
        return (this.isOverview || this.isBanner) ? 'overview' : ''
      },
      overrideStyle() {
        const { accentColor } = this.$site.themeConfig
        return accentColor ? { color: accentColor } : {}
      },
      isBanner() {
        return this.info.frontmatter.banner
      }
    },
    methods: {
      skip () {
        if (!this.info.frontmatter.banner) {
          this.$router.push({
            path: this.info.path,
            query: {
              random: this.random
            }
          })
        } else {
          this.$router.push({
            path: this.info.path
          })
        }
      }
    }
  }
</script>

<style src="./styles/card.styl" lang="stylus"></style>
<style lang="stylus">
  @require './styles/config'

  @media screen and (max-width: 500px) {
    div.article-card {
      text-align center
      .banner-box {
        width 100%
        height 200px
      }
      .article-content {
        display flex
        flex-direction column
        .text-box {
          p {
            margin-top 10px
            height auto
            max-height 72px
          }
        }
      }
    }
  }

  .article-card
    position relative
    padding 0 20px 16px
    cursor pointer
    h2:not(.overview)
      border 0
    .banner-box
      width 174px
      margin-right 20px
      height 104px
      .article-banner
        width 100%
        height 100%
    .article-content
      display flex
      .text-box
        flex 1
        p.text
          margin 0
          margin-bottom 10px
          line-height 24px
          min-height 71px
          overflow hidden
          text-overflow ellipsis
          display -webkit-box
          -webkit-line-clamp 3
          /* autoprefixer: off */
          -webkit-box-orient vertical
          // autoprefixer的一个问题，开启后导致build报错，暂时先off掉
        a
          text-align center
        p.footer
          margin 0
          font-size 14px
          display inline-block
          float right
          color #888
          span.author
            padding-right 10px
  .time
    font-weight normal
    float right
    font-size 16px
</style>
