import { StorefrontModule } from '@vue-storefront/core/lib/modules';
import { extendStore } from '@vue-storefront/core/helpers'
import { products, priceSlider } from 'config'

import { categoryNextModule } from './store/category-next'

export const CustomPriceSlider: StorefrontModule = () => {
  if (!priceSlider || (!priceSlider.fetchRanges && !priceSlider.constRanges)) {
    console.error('[VSF] Price Slider module not configured! Please check readme and fix it.')
    return
  }

  if (priceSlider.constRanges && (!products.aggregate.minPrice || !products.aggregate.maxPrice)) {
    console.error('[VSF] Price Slider module with fetchRanges requires products.aggregate.minPrice and products.aggregate.maxPrice to be true')
    return
  }
  extendStore('category-next', categoryNextModule)
}
