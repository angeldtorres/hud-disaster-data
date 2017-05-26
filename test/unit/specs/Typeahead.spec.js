/* global Event, describe, it, beforeEach, afterEach, expect, sinon */
require('babel-polyfill')
import Vue from 'vue' // eslint-disable-line 
import Typeahead from '@/components/Typeahead' // eslint-disable-line
import _ from 'lodash' // eslint-disable-line
import axios from 'axios' // eslint-disable-line
import moxios from 'moxios' // eslint-disable-line
const ITEMS = [
  { declarationDate: '2017-04-21T15:17:00.000Z',
    declaredCountyArea: 'Box Elder (County)',
    disasterNumber: 4311,
    disasterType: 'DR',
    id: '58fa2e008a4f31363dac2c6a',
    incidentType: 'Flood',
    placeCode: 99003,
    state: 'UT',
    title: 'SEVERE WINTER STORMS AND FLOODING' },
  { declarationDate: '2017-04-21T15:17:00.000Z',
    declaredCountyArea: 'Cache (County)',
    disasterNumber: 4311,
    disasterType: 'DR',
    id: '58fa2e008a4f31363dac2c70',
    incidentType: 'Flood',
    placeCode: 99005,
    state: 'UT',
    title: 'SEVERE WINTER STORMS AND FLOODING'
  }
]

function dispatchEvent ($el, name, opts) {
  var event = new Event(name, {
    'bubbles': true,
    'cancelable': true
  })
  if (opts && _.isObject(opts)) _.assign(event, opts)
  $el.dispatchEvent(event)
}

function populateInput (vm, input) {
  let $input = vm.$el.querySelector('.Typeahead__input')
  $input.value = input
  return $input
}

describe('Typeahead.vue', () => {
  beforeEach(function () {
    // import and pass your custom axios instance to this method
    Vue.prototype.$http = axios
    moxios.install()
    moxios.stubRequest(/.*DR-4311/, {
      status: 200,
      response: ITEMS
    })
  })

  afterEach(function () {
    // import and pass your custom axios instance to this method
    moxios.uninstall()
  })

  it('should render correct list item contents', done => {
    const Constructor = Vue.extend(Typeahead)
    const vm = new Constructor().$mount()
    let $input = populateInput(vm, 'DR-4311')
    dispatchEvent($input, 'input')

    moxios.wait(function () {
      expect(vm.$el.querySelectorAll('.disaster-list>li').length).to.be.equal(2)
      done()
    })
  })

  it('should not populate items if query is empty', done => {
    const Constructor = Vue.extend(Typeahead)
    const vm = new Constructor().$mount()
    let $input = populateInput(vm, 'DR-4311')

    vm.fetch = function () {
      return Promise.resolve()
    }

    dispatchEvent($input, 'input')
    moxios.wait(function () {
      expect(vm.items.length).to.be.equal(0)
      done()
    })
  })

  it('should select the last item in the array of items on up arrow', done => {
    const Constructor = Vue.extend(Typeahead)
    const vm = new Constructor().$mount()
    let $input = populateInput(vm, 'DR-4311')
    dispatchEvent($input, 'input')

    moxios.wait(function () {
      dispatchEvent($input, 'keydown', {keyCode: 38})

      Vue.nextTick(() => {
        expect(vm.items.length).to.be.equal(2)
        expect(vm.current).to.be.equal(vm.items.length - 1)
        done()
      })
    })
  })

  it('should select the previous item in the array of items on up arrow when the second item is current', done => {
    const Constructor = Vue.extend(Typeahead)
    const vm = new Constructor().$mount()
    let $input = populateInput(vm, 'DR-4311')
    dispatchEvent($input, 'input')

    moxios.wait(function () {
      vm.current = 1
      let current = vm.current

      dispatchEvent($input, 'keydown', {keyCode: 38})

      Vue.nextTick(() => {
        expect(vm.items.length).to.be.equal(2)
        expect(vm.current).to.be.equal(current - 1)
        done()
      })
    })
  })

  it('should select no item in the array of items on up arrow when the current is less than -1', done => {
    const Constructor = Vue.extend(Typeahead)
    const vm = new Constructor().$mount()
    let $input = populateInput(vm, 'DR-4311')
    dispatchEvent($input, 'input')

    moxios.wait(function () {
      vm.current = -2

      dispatchEvent($input, 'keydown', {keyCode: 38})

      Vue.nextTick(() => {
        expect(vm.items.length).to.be.equal(2)
        expect(vm.current).to.be.equal(-1)
        done()
      })
    })
  })

  it('should select the first item in the array of items on down arrow keydown', done => {
    const Constructor = Vue.extend(Typeahead)
    const vm = new Constructor().$mount()
    let $input = populateInput(vm, 'DR-4311')
    dispatchEvent($input, 'input')

    moxios.wait(function () {
      dispatchEvent($input, 'keydown', {keyCode: 40})

      Vue.nextTick(() => {
        expect(vm.items.length).to.be.equal(2)
        expect(vm.current).to.be.equal(0)
        done()
      })
    })
  })

  it('should not select an item in the array of items on down arrow keydown if the last item is selected', done => {
    const Constructor = Vue.extend(Typeahead)
    const vm = new Constructor().$mount()
    let $input = populateInput(vm, 'DR-4311')
    dispatchEvent($input, 'input')

    moxios.wait(function () {
      vm.current = 1
      dispatchEvent($input, 'keydown', {keyCode: 40})

      Vue.nextTick(() => {
        expect(vm.items.length).to.be.equal(2)
        expect(vm.current).to.be.equal(-1)
        done()
      })
    })
  })

  it('should not select an item in the array of items on down arrow keydown if the last item is selected', done => {
    const Constructor = Vue.extend(Typeahead)
    const vm = new Constructor().$mount()
    let $input = populateInput(vm, 'DR-4311')
    dispatchEvent($input, 'input')

    moxios.wait(function () {
      vm.current = 1
      dispatchEvent($input, 'keydown', {keyCode: 40})

      Vue.nextTick(() => {
        expect(vm.items.length).to.be.equal(2)
        expect(vm.current).to.be.equal(-1)
        done()
      })
    })
  })

  describe('update', () => {
    it('should force a reset if query is undefined', () => {
      const Constructor = Vue.extend(Typeahead)
      const vm = new Constructor().$mount()
      expect(vm.query).to.be.equal('')
      vm.query = undefined
      expect(vm.query).to.be.equal(undefined)
      vm.update()
      expect(vm.query).to.be.equal('')
    })

    it('should return before loading if query is shorter than minLength', () => {
      const Constructor = Vue.extend(Typeahead)
      const vm = new Constructor().$mount()
      expect(vm.query).to.be.equal('')
      vm.query = 'A'
      expect(vm.minChars).to.be.equal(2)
      vm.update()
      expect(vm.loading).to.be.equal(false)
    })

    it('should select the first item if selectFirst is true', (done) => {
      const Constructor = Vue.extend(Typeahead)
      const vm = new Constructor().$mount()
      let $input = populateInput(vm, 'DR-4311')
      vm.selectFirst = true
      dispatchEvent($input, 'input')

      moxios.wait(function () {
        expect(vm.items.length).to.be.equal(2)
        expect(vm.current).to.be.equal(0)
        done()
      })
    })
  })

  describe('hit', () => {
    it('should call onHit if an item is selected', () => {
      const Constructor = Vue.extend(Typeahead)
      const vm = new Constructor().$mount()
      sinon.spy(vm, 'onHit')
      vm.current = 1
      vm.items = ITEMS
      vm.hit()
      expect(vm.onHit.calledOnce)
      vm.onHit.restore()
    })

    it('should not call onHit if an item is not slected', () => {
      const Constructor = Vue.extend(Typeahead)
      const vm = new Constructor().$mount()
      sinon.spy(vm, 'onHit')
      vm.current = -1
      vm.items = ITEMS
      vm.hit()
      expect(!vm.onHit.calledOnce)
      vm.onHit.restore()
    })
  })

  describe('setActive', () => {
    it('should set the current item', () => {
      const Constructor = Vue.extend(Typeahead)
      const vm = new Constructor().$mount()
      vm.setActive(1)
      expect(vm.current).to.be.equal(1)
    })
  })

  describe('onSelected', () => {
    it('should add a disaster component to the extracts component for the item selected', (done) => {
      const Constructor = Vue.extend(Typeahead)
      const vm = new Constructor().$mount()
      let $input = populateInput(vm, 'DR-4311')
      dispatchEvent($input, 'input')

      moxios.wait(function () {
        let $button = vm.$el.querySelector('.disaster .select-button')
        dispatchEvent($button, 'click')
        Vue.nextTick(() => {
          expect(vm.$el.querySelectorAll('#extracts>li').length).to.be.equal(1)
          done()
        })
      })
    })
  })
})