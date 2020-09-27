import buildFilterPriceVariant from '../helpers/buildFilterPriceVariant';

export default (wrapperKey: string = 'dynamicPrice') => ({
  data () {
    return {
      [wrapperKey]: [
        0,
        50
      ]
    }
  },
  watch: {
    [wrapperKey] () {
      return this.applyFilter();
    }
  },
  methods: {
    applyFilter () {
      const filterVariant = buildFilterPriceVariant(this[wrapperKey][0], this[wrapperKey][1]);
      return this.$store.dispatch('category-next/switchSearchFilters', [ filterVariant ]);
    }
  }
})
