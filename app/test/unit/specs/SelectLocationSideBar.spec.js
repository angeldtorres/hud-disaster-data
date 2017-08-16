import 'es6-promise/auto' // eslint-disable-line
import Vue from 'vue' // eslint-disable-line
import '@/vue-mixins'
import Vuex from 'vuex' // eslint-disable-line
import sinon from 'sinon'
const SelectLocationSideBar =  require('@/components/SelectLocationSideBar') // eslint-disable-line
import _ from 'lodash' // eslint-disable-line
import should from 'should'
import magic from '@/bus'

Vue.use(Vuex)
Vue.config.productionTip = false

describe('SelectLocationSideBar component', function () {
  let store
  let mutations
  let actions
  let getters
  let Constructor
  let vm

  beforeEach(function () {
    getters = {
      disasterNumberResults: function () { return [] },
      localeResults: function () { return [] }
    }
    mutations = {
      updateDisasterNumberList: sinon.stub(),
      updateLocaleList: sinon.stub(),
      addDisasterFilter: sinon.stub(),
      addLocaleFilter: sinon.stub(),
      setSelectedGeographicLevel: sinon.stub(),
      clearStore: sinon.stub(),
      updateReportDisasterList: sinon.stub()
    }
    actions = {
      setSelectedState: sinon.stub(),
      loadLocales: sinon.stub(),
      loadReportDisasterList: sinon.stub(),
      loadReportData: sinon.stub()
    }
    store = new Vuex.Store({state: {}, mutations, getters, actions})
    let createdStub = sinon.stub()
    SelectLocationSideBar.created = createdStub
    Constructor = Vue.extend(SelectLocationSideBar)
    vm = new Constructor({store}).$mount()
  })

  it('should start with populated state dropdown', function (done) {
    Vue.nextTick(() => {
      expect(vm.states.length).to.greaterThan(0)
      done()
    })
  })

  describe('created event/initializeValuesFromURL', function () {
    const testStates = [{ code: 'MZ', name: 'Manzana' }, { code: 'NR', name: 'Naranja' }, { code: 'PL', name: 'Platano' }]
    const testGeoLevels = [{ code: 'city', name: 'City' }, { code: 'county', name: 'County' }, { code: 'something', name: 'Else' }]
    const testLocales = [{ code: 'Jodar', name: 'Jodar' }, { code: 'Ubeda', name: 'Ubeda' }, { code: 'Madrid', name: 'Madrid' }]
    const testDisasters = [{ code: 'AA-1234-ZZ', name: 'AA-1234-ZZ' }, { code: 'BB-5678-YY', name: 'BB-5678-YY' }, { code: 'CC-0987-XX', name: 'CC-0987-XX' }]

    it('should set no values in the selections if no URL parameters are passed in', function (done) {
      let createdStub = sinon.stub()
      const that = { $route: { query: null }, stateSelected: null, geographicLevelSelected: null }
      SelectLocationSideBar.created = createdStub
      Constructor = Vue.extend(SelectLocationSideBar)
      vm = new Constructor({store}).$mount()
      const initializeValuesFromURL = vm.$options.methods.initializeValuesFromURL
      initializeValuesFromURL.call(that)
      Vue.nextTick(() => {
        expect(that.stateSelected).to.be.null
        expect(that.geographicLevelSelected).to.be.null
        done()
      })
    })

    it('should set only the state based upon URL parameters passed in', function (done) {
      const commitSpy = sinon.spy()
      const setLevelSpy = sinon.spy()
      const magicOnceSpy = sinon.spy(magic, '$once')
      let createdStub = sinon.stub()
      store.commit = commitSpy
      store.getters = { localeResults: _.clone(testLocales), disasterNumberResults: _.clone(testDisasters) }
      const that = {
        $route: { query: {
          stateFilter: _.clone(testStates)[0].code
        } },
        states: _.clone(testStates),
        geographicLevels: _.clone(testGeoLevels),
        $store: store,
        stateSelected: null,
        geographicLevelSelected: null,
        setLevel: setLevelSpy }
      SelectLocationSideBar.created = createdStub
      Constructor = Vue.extend(SelectLocationSideBar)
      vm = new Constructor({store}).$mount()
      const initializeValuesFromURL = vm.$options.methods.initializeValuesFromURL
      initializeValuesFromURL.call(that)
      Vue.nextTick(() => {
        expect(that.stateSelected).to.be.equal(testStates[0])
        expect(that.geographicLevelSelected).to.be.null
        expect(commitSpy.calledWith('setState', testStates[0]))
        expect(commitSpy.calledOnce)
        expect(magicOnceSpy.notCalled)
        magicOnceSpy.restore()
        done()
      })
    })

    it('should set only the state and geographicLevel based upon URL parameters passed in', function (done) {
      const commitSpy = sinon.spy()
      const setLevelSpy = sinon.spy()
      const magicOnceSpy = sinon.spy(magic, '$once')
      let createdStub = sinon.stub()
      store.commit = commitSpy
      store.getters = { localeResults: _.clone(testLocales), disasterNumberResults: _.clone(testDisasters) }
      const that = {
        $route: { query: {
          stateFilter: _.clone(testStates)[0].code,
          geographicLevel: _.clone(testGeoLevels)[0].code
        } },
        states: _.clone(testStates),
        geographicLevels: _.clone(testGeoLevels),
        $store: store,
        stateSelected: null,
        geographicLevelSelected: null,
        setLevel: setLevelSpy }
      SelectLocationSideBar.created = createdStub
      Constructor = Vue.extend(SelectLocationSideBar)
      vm = new Constructor({store}).$mount()
      const initializeValuesFromURL = vm.$options.methods.initializeValuesFromURL
      initializeValuesFromURL.call(that)
      Vue.nextTick(() => {
        expect(that.stateSelected).to.be.equal(testStates[0])
        expect(that.geographicLevelSelected).to.be.equal(testGeoLevels[0])
        expect(commitSpy.calledWith('setState', testStates[0]))
        expect(commitSpy.calledWith('addLocaleFilter', testLocales[0]))
        expect(commitSpy.calledTwice)
        expect(magicOnceSpy.notCalled)
        magicOnceSpy.restore()
        done()
      })
    })

    it('should set all the values in the selections based upon URL parameters passed in', function (done) {
      const commitSpy = sinon.spy()
      const setLevelSpy = sinon.spy()
      const magicOnceSpy = sinon.spy(magic, '$once')
      let createdStub = sinon.stub()
      store.commit = commitSpy
      store.getters = { localeResults: _.clone(testLocales), disasterNumberResults: _.clone(testDisasters) }
      const that = {
        $route: { query: {
          stateFilter: _.clone(testStates)[0].code,
          geographicLevel: _.clone(testGeoLevels)[0].code,
          localeFilter: _.clone(testLocales)[0].code,
          disasterFilter: _.clone(testDisasters)[0].code
        } },
        states: _.clone(testStates),
        geographicLevels: _.clone(testGeoLevels),
        $store: store,
        stateSelected: null,
        geographicLevelSelected: null,
        setLevel: setLevelSpy }
      SelectLocationSideBar.created = createdStub
      Constructor = Vue.extend(SelectLocationSideBar)
      vm = new Constructor({store}).$mount()
      const initializeValuesFromURL = vm.$options.methods.initializeValuesFromURL
      initializeValuesFromURL.call(that)
      Vue.nextTick(() => {
        expect(that.stateSelected).to.be.equal(testStates[0])
        expect(that.geographicLevelSelected).to.be.equal(testGeoLevels[0])
        expect(commitSpy.calledWith('setState', testStates[0]))
        expect(commitSpy.calledWith('addLocaleFilter', testLocales[0]))
        expect(commitSpy.calledWith('addDisasterFilter', testDisasters[0]))
        expect(magicOnceSpy.calledWith('localesLoaded'))
        expect(magicOnceSpy.calledWith('disastersLoaded'))
        magicOnceSpy.restore()
        done()
      })
    })
  })

  describe('changeState', function () {
    it('should reset locales and disaster numbers if state has changed', function (done) {
      vm.stateSelected = {code: 'WI', name: 'Wisconsin'}
      vm.localeSelected = ['this place', 'that other place']
      vm.disasterSelected = ['this disaster', 'the next disaster']
      const dispatchSpy = sinon.spy(store, 'dispatch')
      const iowa = {code: 'IA', name: 'Iowa'}
      vm.changeState(iowa)
      Vue.nextTick(() => {
        expect(vm.localeSelected).to.be.null
        expect(vm.disasterSelected).to.be.null
        expect(dispatchSpy.calledWith('setSelectedState', iowa))
        expect(dispatchSpy.calledWith('loadLocales', iowa.code))
        expect(dispatchSpy.calledWith('loadReportDisasterList', iowa.code))
        done()
      })
    })
  })

  describe('createReport', function () {
    it('should set parameters using geographicLevel "city" to proper values and pass them to loadReportData action', function (done) {
      let getters = {}
      let stateFilter = {code: 'TX', name: 'Texas'}
      let localeFilter = [{ code: 'HOUSTON', name: 'Houston' }]
      let disasterFilter = [{ code: 'DR-4272-TX', name: 'DR-4272-TX', selected: true }]
      let geographicLevel = { code: 'city', name: 'city' }
      getters.stateFilter = () => { return stateFilter }
      getters.localeFilter = () => { return localeFilter }
      getters.disasterFilter = () => { return disasterFilter }
      getters.geographicLevel = () => { return geographicLevel }
      store = new Vuex.Store({state: {}, mutations, getters, actions})
      Constructor = Vue.extend(SelectLocationSideBar)
      vm = new Constructor({store}).$mount()
      const dispatchSpy = sinon.spy(store, 'dispatch')
      vm.createReport()
      Vue.nextTick(() => {
        expect(dispatchSpy.calledWith('loadReportData', {'summaryCols': 'total_damages,hud_unmet_need', 'allFilters': {'stateId': 'TX', 'disasterId': ['4272'], 'geoName': 'damaged_city', 'geoArea': ['HOUSTON']}}))
        done()
      })
    })

    it('should set parameters, using geographicLevel "county" and nulls for all else but localeFilter, to proper values and pass them to loadReportData action', function (done) {
      let getters = {}
      getters.stateFilter = () => { return {code: 'somethin', name: 'somethin'} }
      getters.localeFilter = () => { return [{ code: 'HOUSTON', name: 'Houston' }] }
      getters.disasterFilter = () => { return [] }
      getters.geographicLevel = () => { return { code: 'county', name: 'county' } }
      store = new Vuex.Store({state: {}, mutations, getters, actions})
      Constructor = Vue.extend(SelectLocationSideBar)
      vm = new Constructor({store}).$mount()
      const dispatchSpy = sinon.spy(store, 'dispatch')
      vm.createReport()
      Vue.nextTick(() => {
        expect(dispatchSpy.calledWith('loadReportData', {'summaryCols': 'total_damages,hud_unmet_need', 'allFilters': {'stateId': null, 'disasterId': [], 'geoName': 'county_name', 'geoArea': [{ code: 'HOUSTON', name: 'Houston' }]}}))
        done()
      })
    })
  })

  describe('reset', function () {
    it('should reset all the selected values to null and clear the store\'s state', function (done) {
      vm.localeSelected = 1
      vm.disasterSelected = 1
      vm.stateSelected = 1
      let commitSpy = sinon.spy(vm.$store, 'commit')
      vm.reset()
      Vue.nextTick(() => {
        should(vm.localeSelected).be.null()
        should(vm.disasterSelected).be.null()
        should(vm.geographicLevelSelected).be.null()
        should(vm.stateSelected).be.null()
        should(commitSpy.calledWith('setSelectedGeographicLevel')).be.true()
        should(commitSpy.calledWith('updateLocaleList')).be.true()
        should(commitSpy.calledWith('setState')).be.true()
        done()
        commitSpy.restore()
      })
    })
  })
  describe('addDisaster', function () {
    it('should add the disaster', function (done) {
      vm.disasterSelected = {name: 'big disaster', code: 'BAD'}
      let commitSpy = sinon.spy(store, 'commit')
      vm.addDisaster()
      Vue.nextTick(() => {
        should(commitSpy.calledWith('addDisasterFilter')).be.true()
        done()
      })
    })
    it('should do nothing if no disaster is selected', function (done) {
      vm.disasterSelected = null
      let commitSpy = sinon.spy(store, 'commit')
      vm.addDisaster()
      Vue.nextTick(() => {
        should(commitSpy.calledWith('addDisasterFilter')).be.false()
        done()
      })
    })
  })
  describe('addLocale', function () {
    it('should add the locale', function (done) {
      vm.localeSelected = {name: 'Alexandria', code: 'Alexandria'}
      let commitSpy = sinon.spy(store, 'commit')
      vm.addLocale()
      Vue.nextTick(() => {
        should(commitSpy.calledWith('addLocaleFilter')).be.true()
        done()
      })
    })
    it('should do nothing if no locale is selected', function (done) {
      vm.localeSelected = null
      let commitSpy = sinon.spy(store, 'commit')
      vm.addLocale()
      Vue.nextTick(() => {
        should(commitSpy.calledWith('addLocaleFilter')).be.false()
        done()
      })
    })
  })
  describe('setLevel', function () {
    it('should set the geographicLevel', function (done) {
      const level = {name: 'City', code: 'city'}
      const stateId = 'TX'
      let commitSpy = sinon.spy(store, 'commit')
      let dispatchSpy = sinon.spy(store, 'dispatch')
      vm.stateSelected = {code: stateId, name: stateId}
      vm.setLevel(level)
      Vue.nextTick(() => {
        should(commitSpy.calledWith('setSelectedGeographicLevel', level)).be.true()
        should(dispatchSpy.calledWith('loadLocales', stateId)).be.true()
        done()
      })
    })
    it('should set geographicLevel to null if empty', function (done) {
      let commitSpy = sinon.spy(store, 'commit')
      vm.setLevel()
      Vue.nextTick(() => {
        should(commitSpy.calledWith('setSelectedGeographicLevel')).be.true()
        expect(vm.geographicLevelSelected).to.be.null
        done()
      })
    })
  })

  describe('removeDisaster', function () {
    it('should call commit to remove the disaster', function (done) {
      let disaster = 'something'
      let commitSpy = sinon.spy(store, 'commit')
      vm.removeDisaster(disaster)
      Vue.nextTick(() => {
        should(commitSpy.calledWith('removeDisasterFilter')).be.true()
        done()
      })
    })
  })

  describe('removeLocale', function () {
    it('should call commit to remove the locale', function (done) {
      let locale = 'something'
      let commitSpy = sinon.spy(store, 'commit')
      vm.removeLocale(locale)
      Vue.nextTick(() => {
        should(commitSpy.calledWith('removeLocaleFilter')).be.true()
        done()
      })
    })
  })
})