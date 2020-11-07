<template>
  <div class="price-slider">
    <h2>Price Selector</h2>
      <vue-slider
        v-model="dynamicPrice.values"
        :min="minAvailablePrice"
        :max="maxAvailablePrice"
      />
  </div>
</template>

<script>
    import applyDynamicPriceFilter from '../mixins/applyDynamicPriceFilter';
    import VueSlider from 'vue-slider-component'
    import 'vue-slider-component/theme/antd.css'

    export default {
        name: 'CustomPriceSelector',
        components: {
            VueSlider
        },
        mixins: [
            applyDynamicPriceFilter('dynamicPrice')
        ]
    }
</script>

<style lang="scss">
.price-slider {
  .vue-slider-dot {
    z-index: 3;
  }
}
</style>
