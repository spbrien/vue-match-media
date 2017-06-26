// @flow
import Vue from 'vue'

export const mq = Symbol('mq')

export default (Vue: Vue, options?: Object): void => {
  Object.defineProperty(Vue.prototype, '$mq', ({
    get () {
      return this[mq].obs
    }
  }: Object))

  Vue.mixin({
    beforeCreate () {
      const isIsolated = this.$options.mq && this.$options.mq.config && this.$options.mq.config.isolated
      const isRoot = this === this.$root

      this[mq] = {}
      this[mq].obs = isIsolated || isRoot || !this.$parent ? {} : this.$parent.$mq

      if (this.$options.mq) {
        const observables = Object.keys(this.$options.mq)
          .filter(k => k !== 'config')
          .reduce((obs, k) => {
            const mql = window.matchMedia(this.$options.mq[k])
            Object.defineProperty(obs, k, ({
              enumerable: true,
              configurable: true,
              get () {
                return mql.matches
              }
            }: Object))
            /* Below for testing and debugging */
            if (process.env.NODE_ENV !== 'production') {
              this[mq][`_${k}`] = mql.media
            }
            return obs
          }, {})

        if (!isIsolated) {
          this[mq].obs = {
            ...this[mq].obs,
            ...observables
          }
        }

        Object.defineProperty(this[mq].obs, 'all', ({
          get () {
            return Object.keys(this)
              .filter(k => this[k])
          }
        }: Object))
      }
    }
  })
}
