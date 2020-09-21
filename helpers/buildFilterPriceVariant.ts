import FilterVariant from '@vue-storefront/core/modules/catalog-next/types/FilterVariant';
import { price } from '@vue-storefront/core/filters/price';

export default (from: string, to: string): FilterVariant => {
  return {
    single: true,
    type: 'price',
    from,
    to,
    id: `${from}-${to}`,
    label: `${price(from)} - ${to}`
  }
};
