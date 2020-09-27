<template>
  <div>
    <h2>Price Selector</h2>
    <vue-slider v-model="dynamicPrice"/>
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

<style scoped>

</style>
