import buildFilterPriceVariant from '../helpers/buildFilterPriceVariant';

export default (wrapperKey: string = 'dynamicPrice') => ({
  data () {
    return {
      [wrapperKey]: {
        values: [
          0,
          50
        ],
        initialSetupDone: false
      }
    }
  },
  watch: {
    [`${wrapperKey}.values`] () {
      if (!this[wrapperKey].initialSetupDone) {
        return
      }
      return this.applyFilter();
    }
  },
  computed: {
    minAvailablePrice () {
      return this.$store.state['category-next'].dynamicPriceRanges.min;
    },
    maxAvailablePrice () {
      return this.$store.state['category-next'].dynamicPriceRanges.max;
    }
  },
  methods: {
    applyFilter () {
      const filterVariant = buildFilterPriceVariant(this[wrapperKey].values[0], this[wrapperKey].values[1]);
      return this.$store.dispatch('category-next/switchSearchFilters', [ filterVariant ]);
    }
  },
  async created () {
    if (this.$route.query.price) {
      const currentPrices = this.$route.query.price.split('-')
      this.$set(this[wrapperKey], 'values', [
        Number(currentPrices[0]),
        Number(currentPrices[1])
      ])
    } else {
      this.$set(this[wrapperKey], 'values', [
        this.minAvailablePrice,
        this.maxAvailablePrice
      ])
    }
    await this.$nextTick();
    this[wrapperKey].initialSetupDone = true;
  }
})
