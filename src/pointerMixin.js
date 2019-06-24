export default {
  data () {
    return {
      pointer: 0,
      pointerDirty: false
    }
  },
  props: {
    /**
     * Enable/disable highlighting of the pointed value.
     * @type {Boolean}
     * @default true
     */
    showPointer: {
      type: Boolean,
      default: true
    },
    optionHeight: {
      type: Number,
      default: 40
    }
  },
  computed: {
    pointerPosition () {
      return this.pointer * this.optionHeight
    },
    visibleElements () {
      return this.optimizedHeight / this.optionHeight
    }
  },
  watch: {
    filteredOptions () {
      this.pointerAdjust()
    },
    isOpen () {
      this.pointerDirty = false
    }
  },
  methods: {
    optionHighlight (index, option) {
      return {
        'multiselect__option--highlight': index === this.pointer && this.showPointer,
        'multiselect__option--selected': this.isSelected(option)
      }
    },
    groupHighlight (index, selectedGroup) {
      if (!this.groupSelect) {
        return ['multiselect__option--group', 'multiselect__option--disabled']
      }

      const group = this.options.find(option => {
        return option[this.groupLabel] === selectedGroup.$groupLabel
      })

      return group && !this.wholeGroupDisabled(group) ? [
        'multiselect__option--group',
        { 'multiselect__option--highlight': index === this.pointer && this.showPointer },
        { 'multiselect__option--group-selected': this.wholeGroupSelected(group) }
      ] : 'multiselect__option--disabled'
    },
    addPointerElement ({ key } = 'Enter') {
      /* istanbul ignore else */
      if (this.filteredOptions.length > 0) {
        this.select(this.filteredOptions[this.pointer], key)
      }
      this.pointerReset()
    },
    pointerForward () {
      /* istanbul ignore else */
      if (this.pointer < this.filteredOptions.length - 1) {
        this.pointer++
        this.$refs.search.setAttribute('aria-activedescendant', document.getElementById(this.$refs.search.getAttribute('aria-activedescendant')).nextElementSibling.id)
        /* istanbul ignore next */
        if (this.$refs.list.scrollTop <= this.pointerPosition - (this.visibleElements - 1) * this.optionHeight) {
          this.$refs.list.scrollTop = this.pointerPosition - (this.visibleElements - 1) * this.optionHeight
        }
        /* istanbul ignore else */
        if (
          this.filteredOptions[this.pointer] &&
          this.filteredOptions[this.pointer].$isLabel &&
          !this.groupSelect
        ) this.pointerForward()
      }
      this.pointerDirty = true
    },
    pointerBackward () {
      if (this.pointer > 0) {
        this.pointer--
        this.$refs.search.setAttribute('aria-activedescendant', document.getElementById(this.$refs.search.getAttribute('aria-activedescendant')).previousElementSibling.id)
        /* istanbul ignore else */
        if (this.$refs.list.scrollTop >= this.pointerPosition) {
          this.$refs.list.scrollTop = this.pointerPosition
        }
        /* istanbul ignore else */
        if (
          this.filteredOptions[this.pointer] &&
          this.filteredOptions[this.pointer].$isLabel &&
          !this.groupSelect
        ) this.pointerBackward()
      } else {
        /* istanbul ignore else */
        if (
          this.filteredOptions[this.pointer] &&
          this.filteredOptions[0].$isLabel &&
          !this.groupSelect
        ) this.pointerForward()
      }
      this.pointerDirty = true
    },
    pointerReset () {
      /* istanbul ignore else */
      if (!this.closeOnSelect) return
      this.pointer = 0
      for (var i = 0; i < this.$refs.listbox.children.length; ++i) {
        if (this.$refs.listbox.children[i].getAttribute('role')) {
          this.$refs.search.setAttribute('aria-activedescendant', this.$refs.listbox.children[i].id)
          break
        }
      }
      /* istanbul ignore else */
      if (this.$refs.list) {
        this.$refs.list.scrollTop = 0
      }
    },
    pointerAdjust () {
      /* istanbul ignore else */
      if (this.pointer >= this.filteredOptions.length - 1) {
        this.pointer = this.filteredOptions.length
          ? this.filteredOptions.length - 1
          : 0
        if (this.filteredOptions.length) {
          for (var i = this.$refs.listbox.children.length - 1; i > 0; --i) {
            if (this.$refs.listbox.children[i].getAttribute('role')) {
              this.$refs.search.setAttribute('aria-activedescendant', this.$refs.listbox.children[i].id)
              break
            }
          }
        } else {
          for (var i = 0; i < this.$refs.listbox.children.length; ++i) {
            if (this.$refs.listbox.children[i].getAttribute('role')) {
              this.$refs.search.setAttribute('aria-activedescendant', this.$refs.listbox.children[i].id)
              break
            }
          }
        }
      }

      if (this.filteredOptions.length > 0 &&
        this.filteredOptions[this.pointer].$isLabel &&
        !this.groupSelect
      ) {
        this.pointerForward()
      }
    },
    pointerSet (index) {
      this.pointer = index
      this.pointerDirty = true
      this.$refs.search.setAttribute('aria-activedescendant', this.id + '-' + index.toString())
    }
  }
}
