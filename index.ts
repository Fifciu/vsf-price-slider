import { StorefrontModule } from '@vue-storefront/core/lib/modules';
import { extendStore } from '@vue-storefront/core/helpers'
import { getSystemFilterNames } from '@vue-storefront/core/modules/catalog-next/helpers/filterHelpers';
import { Filters } from '@vue-storefront/core/modules/catalog-next/types/Category';
import buildFilterPriceVariant from './helpers/buildFilterPriceVariant';
import * as types from '@vue-storefront/core/modules/catalog-next/store/category/mutation-types';
import config from 'config';
import omit from 'lodash-es/omit';
import cloneDeep from 'lodash-es/cloneDeep';

const PRICE_RANGES_MUTATION = 'PRICE_RANGES_MUTATION';

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
  actions: {
    async loadAvailableFiltersFrom ({ commit, getters, dispatch }, { aggregations, attributeMetadata, category, filters = {} }) {
      if (config.entities.attribute.loadByAttributeMetadata) {
        await dispatch('attribute/loadCategoryAttributes', { attributeMetadata }, { root: true })
      }
      const aggregationFilters = getters.getAvailableFiltersFrom(aggregations)
      const currentCategory = category || getters.getCurrentCategory
      const categoryMappedFilters = getters.getFiltersMap[currentCategory.id]
      let resultFilters = aggregationFilters
      const filtersKeys = Object.keys(filters)
      if (categoryMappedFilters && filtersKeys.length) {
        resultFilters = Object.assign(cloneDeep(categoryMappedFilters), cloneDeep(omit(aggregationFilters, filtersKeys)))
      }
      commit(types.CATEGORY_SET_CATEGORY_FILTERS, { category, filters: resultFilters })
      commit(PRICE_RANGES_MUTATION, {
        min: aggregations.agg_min_price.value,
        max: aggregations.agg_max_price.value
      })
    }
  },
  mutations: {
    [PRICE_RANGES_MUTATION] (state, payload) {
      state.dynamicPriceRanges.min = payload.min;
      state.dynamicPriceRanges.max = payload.max;
    }
  },
  getters: {
    getCurrentFiltersFrom: (state, getters, rootState) => (filters, categoryFilters) => {
      const currentQuery = filters || rootState.route[config.products.routerFiltersSource]
      const availableFilters = categoryFilters || getters.getAvailableFilters
      return getFiltersFromQuery({ availableFilters, filtersQuery: currentQuery })
    }
  },
  state: {
    dynamicPriceRanges: {
      min: 0,
      max: 0
    }
  }
}

export const CustomPriceSelector: StorefrontModule = async ({ appConfig, moduleConfig }) => {
  // what if i disable price in config?
  extendStore('category-next', categoryNextGetters)
}
