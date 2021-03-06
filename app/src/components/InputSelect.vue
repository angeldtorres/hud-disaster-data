<template lang="pug">
  .input-select
    .search-wrapper.input-group(aria-live="assertive" v-bind:class="{ 'input-required': isRequired }")
      label.sr-only(for='search-text') {{ searchInputLabel }}
      input.search-text(
        type='search'
        :required='required'
        :placeholder='searchInputLabel'
        autocomplete='off'
        v-model='queryValue'
        @keydown.esc.prevent='reset'
        @keydown.enter='update'
        @keydown.tab='update'
        @keydown.down.prevent="selectDown"
        @keydown.up.prevent="selectUp"
        @click='inputReaction'
        @keydown='inputReaction'
        @blur="update"
        :class="isDisabled"
        :disabled="isDisabled"
        :title='`Text input for ${componentDescription}`')
      icon.search-icon(name="fa-search")
      button.clear-text(@click='reset'
       v-if='isDirty'
        :title='`Clear search text for ${componentDescription}`'
        :class="isDisabled"
        :disabled="isDisabled")
        icon(classes='clear-text' name='fa-times')
      span.input-group-btn
        button.usa-button.btn.toggle-btn(type="button"
          :title='`Toggle drop-down list for ${componentDescription}`'
          @click="toggleDropdown"
          :class="isDisabled"
          :disabled="isDisabled"
          @blur="close")
          icon(v-show="contentVisible" name='fa-caret-up')
          icon(v-show="!contentVisible" name='fa-caret-down')
    .results-list(ref="dropdownMenu" v-if="contentVisible")
      ul.dropdown-content(@blur="close")
        li(v-for='(item, index) in unMatchedItems' :class="{ active: item.selected, highlight: index === listIndex }" @mouseover="listIndex = index")
          span(@mousedown.prevent="select(item)")
            | {{ item.name }}
</template>
<script>
import _ from 'lodash'
import adjustScroll from '../mixins/adjustScroll'

export default {
  name: 'input-select',
  mixins: [adjustScroll],
  props: ['items', 'onChange', 'onReset', 'value', 'disabled', 'componentDescription', 'required'],
  data () {
    return {
      matchingItems: [],
      listIndex: -1,
      queryValue: _.get(this, 'value.name'),
      contentVisible: false,
      ref: 'inputSelectText',
      placeholder: 'type here',
      searchButtonTitle: 'Search magnifying glass icon',
      searchInputLabel: '', // search for something
      beforeReset: this.onReset || function () { return true }
    }
  },

  computed: {
    hasItems () {
      return this.items && this.items.length > 0
    },
    isEmpty () {
      return !this.queryValue
    },
    isDirty () {
      return !!this.queryValue
    },
    isRequired () {
      return !this.queryValue && this.required
    },
    unMatchedItems () {
      return _.reject(this.getMatchingItems(this.queryValue), 'selected')
    },
    isDisabled () {
      return this.disabled ? 'disabled' : false
    }
  },
  methods: {
    /**
    * Will submit queryValue to load items
    * @function update
    */
    update () {
      if (this.listIndex > -1) {
        if (this.queryValue && this.queryValue.length > 0) {
          if (this.matchingItems && this.matchingItems.length > 0) {
            // use matchingItems if there is a queryValue text, and matching options
            this.select(this.matchingItems[this.listIndex])
          }
        } else {
          // use items array, as there is no queryValue text
          this.select(this.items[this.listIndex])
        }
        this.close()
      } else if (!this.queryValue || this.queryValue.length === 0) {
        // no item selected in dropdown, no query text
        this.$emit('clear', null)
        this.close()
      } else if (this.matchingItems) {
        if (this.matchingItems.length === 1) {
          // user has only one match
          this.select(this.matchingItems[0])
        } else {
          // user has no matches to input
          // or user has hit enter when there are multiple matches
          if (this.beforeReset()) {
            this.$emit('clear', null)
          }
        }
      }
    },
    clearValue () {
      this.queryValue = ''
      this.listIndex = -1
      this.matchingItems = _.clone(this.items)
    },
    reset () {
      if (this.queryValue && this.beforeReset()) {
        this.$emit('clear', null)
        this.clearValue()
      }
    },
    toggleDropdown () {
      this.contentVisible = !this.contentVisible
    },
    close () {
      this.contentVisible = false
    },
    select (item) {
      if (this.isSelected(item)) {
        this.deselect(item)
      } else {
        this.matchingItems = [item]
        this.queryValue = item.name
        if (this.onChange) this.onChange(item)
        this.contentVisible = false
        this.$emit('update:value', item)
      }
    },
    selectDown () {
      let checkItemsLength = this.matchingItems.length || this.items.length
      if (this.listIndex < checkItemsLength - 1) {
        this.listIndex++
      }
    },
    selectUp () {
      if (this.listIndex > 0) {
        this.listIndex--
      }
    },
    isSelected (item) {
      return item && item.selected
    },
    deselect (item) {
      delete item.selected
    },
    getMatchingItems (queryValue) {
      if (!queryValue) {
        this.matchingItems = this.items
        this.listIndex = -1
      } else {
        this.matchingItems = []
        this.items.forEach((i) => {
          if (i.name.toUpperCase().includes(queryValue.toUpperCase())) {
            this.matchingItems.push(i)
          }
        })
      }
      return this.matchingItems
    },
    inputReaction (event) {
      if (event.type === 'keydown') {
        if (this.filterInput(event)) {
          if (event.which === 13 || event.keyCode === 13) {
            this.contentVisible = false
          } else {
            this.contentVisible = true
          }
          return true
        } else {
          event.preventDefault()
          return false
        }
      }
      return true
    },
    filterInput (event) {
      let keyCode = ('which' in event) ? event.which : event.keyCode
      let isNumeric = (keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105)
      let alpha = (keyCode >= 65 && keyCode <= 90)
      let specialCodes = [ 17, 32, 13, 189, 8, 9, 35, 36, 37, 38, 39, 40, 46, 27, 91, 93 ]
      let isSpecial = (specialCodes.indexOf(keyCode) > -1)
      return isNumeric || alpha || isSpecial
    }
  }
}
</script>
<style lang="scss">
.input-select {
  /* -- default styles ------------------- */
  border:0px;
  position:relative;
  width:100%;

  ul {
    margin-top:10px;
    padding:0;
    li:before { content: ""; }
  }

  .sr-only { color: #767676; }
  .toggle-btn {
    background: #fff;
    border:none;
    border-top-right-radius:0px;
    border-bottom-right-radius:0px;
    svg { fill:#000; }
    &.disabled, :disabled {
    //  background-color:#ccc;
    }
  }

  .search-text {
    /* Override font for IE10+ ------------------------------ */
    @media all and (-ms-high-contrast:none), (-ms-high-contrast:active) {
      font-family: 'Arial', sans-serif !important;
    }
    margin: 0;
    max-width:100%;
    padding-left:35px;
  }
  .toggle-btn, .search-text {
    border:none;
    border-radius:0px;
    height: 46px;
    margin: 0;
  }

  .search-wrapper.input-group {
    border-bottom:1px solid #ccc;
    width:100%;
    overflow:hidden;
    position:relative;

    .search-icon {
      position:absolute;
      top:14px;
      left:10px;
      fill:#a9a9a9;
      padding:0;
    }
  }

  .search-wrapper.input-group.input-required {
    outline: 2px solid #f00;
  }

  button {
    &.clear-text {
      background: none;
      cursor:pointer;
      float: right;
      right:8px;
      margin-top:-32px;
      max-width: 24px;
      padding: 0;
      position: relative;
      .hdd-icon { fill: #b0b0b0; }

      /* hide input clear when disabled */
      &.disabled svg { display:none; }
      &:hover {
        .hdd-icon { fill: #000; }
      }

    }
  }

  .results-list {
    background: #fff;
    color: black;
    cursor:pointer;
    list-style: none;
    max-height: 195px;
    overflow: auto;
    position: absolute;
    /* width: 89.5%; */
    width:100%;
    z-index: 100;
    -moz-box-shadow:5px 5px 5px rgba(0,0,0,0.5);
    -webkit-box-shadow:5px 5px 5px rgba(0,0,0,0.5);
    box-shadow:5px 5px 5px rgba(0,0,0,0.5);

    .dropdown-content {
      width:100%;
      padding:0;
      margin:0;
      li {
        /* height:50px; */
        &:before { display:none;}

        span {
          padding:5px;
          margin-top:5px;
          width:100%;
        }

        &.selected {
          color: #000;
          background-color: #ccc;
        }
        &.highlight {
          background-color: #E2F6FD;
        }
      }
    }
  }

  /* -- disabled styles ------------------ */
  &.disabled{
    input, button {
      background-color:#f0f0f0;
      border:0px;
      color:#808080;
      cursor: default;
    }
    .search-wrapper.input-group { border-bottom:1px solid transparent; }
    .toggle-btn svg { fill:#ccc; }
  }
}

</style>
