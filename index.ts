import { StorefrontModule } from '@vue-storefront/core/lib/modules';
import { extendStore } from '@vue-storefront/core/helpers'
import { getSystemFilterNames } from '@vue-storefront/core/modules/catalog-next/helpers/filterHelpers';
import { products } from 'config';
import { Filters } from '@vue-storefront/core/modules/catalog-next/types/Category';
import buildFilterPriceVariant from './helpers/buildFilterPriceVariant';

const getFiltersFromQuery = ({ filtersQuery = {}, availableFilters = {} } = {}): { filters: Filters } => {
  const searchQuery = {
    filters: {}
  }
  Object.keys(filtersQuery).forEach(filterKey => {
    const filter = availableFilters[filterKey]
    let queryValue = filtersQuery[filterKey]
    if (!filter) return
    // keep original value for system filters - for example sort
    if (getSystemFilterNames.includes(filterKey)) {
      searchQuery[filterKey] = queryValue
    } else {
      queryValue = [].concat(filtersQuery[filterKey])
      queryValue.map(singleValue => {
        let variant = filter.find(filterVariant => filterVariant.id === singleValue)
        if (!variant) {
          if (filterKey !== 'price') {
            return
          }
          const [from, to] = singleValue.split('-').map(Number);
          variant = buildFilterPriceVariant(from, to);
        }
        if (!Array.isArray(searchQuery.filters[filterKey])) {
          searchQuery.filters[filterKey] = []
        }
        searchQuery.filters[filterKey].push({
          ...variant,
          attribute_code: filterKey
        })
      })
    }
  })

  return searchQuery
}

const categoryNextGetters = {
  getters: {
    getCurrentFiltersFrom: (state, getters, rootState) => (filters, categoryFilters) => {
      const currentQuery = filters || rootState.route[products.routerFiltersSource]
      const availableFilters = categoryFilters || getters.getAvailableFilters
      return getFiltersFromQuery({ availableFilters, filtersQuery: currentQuery })
    }
  }
}

export const CustomPriceSelector: StorefrontModule = async ({ appConfig, moduleConfig }) => {
  // what if i disable price in config?
  extendStore('category-next', categoryNextGetters)
}
