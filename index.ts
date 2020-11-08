import { StorefrontModule } from '@vue-storefront/core/lib/modules';
import { buildFilterProductsQuery, extendStore } from '@vue-storefront/core/helpers'
import { getSystemFilterNames } from '@vue-storefront/core/modules/catalog-next/helpers/filterHelpers';
import { Filters } from '@vue-storefront/core/modules/catalog-next/types/Category';
import buildFilterPriceVariant from './helpers/buildFilterPriceVariant';
import * as types from '@vue-storefront/core/modules/catalog-next/store/category/mutation-types';
import omit from 'lodash-es/omit';
import cloneDeep from 'lodash-es/cloneDeep';
import { products, entities, priceSlider } from 'config'
import { priceSliderHooksExecutors } from './hooks';
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
    async loadCategoryProducts ({ commit, getters, dispatch, rootState }, { route = {path: null}, category = null, pageSize = 50 } = {}) {
      const searchCategory = category || getters.getCategoryFrom(route.path) || {}
      const categoryMappedFilters = getters.getFiltersMap[searchCategory.id]
      const areFiltersInQuery = !!Object.keys(route[products.routerFiltersSource]).length
      if (!categoryMappedFilters && areFiltersInQuery) { // loading all filters only when some filters are currently chosen and category has no available filters yet
        await dispatch('loadCategoryFilters', searchCategory)
      }
      const searchQuery = getters.getCurrentFiltersFrom(route[products.routerFiltersSource], categoryMappedFilters)
      let filterQr = buildFilterProductsQuery(searchCategory, searchQuery.filters)

      const requests = []
      requests.push(dispatch('product/findProducts', {
        query: filterQr,
        sort: searchQuery.sort || `${products.defaultSortBy.attribute}:${products.defaultSortBy.order}`,
        includeFields: entities.productList.includeFields,
        excludeFields: entities.productList.excludeFields,
        size: pageSize,
        configuration: searchQuery.filters,
        options: {
          populateRequestCacheTags: true,
          prefetchGroupProducts: false,
          setProductErrors: false,
          fallbackToDefaultWhenNoAvailable: true,
          assignProductConfiguration: false,
          separateSelectedVariant: false
        }
      }, { root: true }))

      if (priceSlider.fetchRanges && searchQuery.filters && searchQuery.filters.price) {
        delete searchQuery.filters.price;
        requests.push(dispatch('product/findProducts', {
          query: buildFilterProductsQuery(searchCategory, searchQuery.filters),
          sort: searchQuery.sort || `${products.defaultSortBy.attribute}:${products.defaultSortBy.order}`,
          includeFields: entities.productList.includeFields,
          excludeFields: entities.productList.excludeFields,
          size: 0,
          configuration: searchQuery.filters,
          options: {
            populateRequestCacheTags: true,
            prefetchGroupProducts: false,
            setProductErrors: false,
            fallbackToDefaultWhenNoAvailable: true,
            assignProductConfiguration: false,
            separateSelectedVariant: false
          }
        }, { root: true }))
      }

      const [ originalRequest, rangeLimitsRequest ] = await Promise.all(requests);
      let aggregations = null;
      const { items, perPage, start, total, aggregations: originalAggregations, attributeMetadata } = originalRequest;
      if (rangeLimitsRequest && rangeLimitsRequest.aggregations) {
        aggregations = rangeLimitsRequest.aggregations;
      } else {
        aggregations = originalAggregations;
      }

      await dispatch('loadAvailableFiltersFrom', {
        aggregations,
        attributeMetadata,
        category: searchCategory,
        filters: searchQuery.filters
      })
      commit(types.CATEGORY_SET_SEARCH_PRODUCTS_STATS, { perPage, start, total })
      commit(types.CATEGORY_SET_PRODUCTS, items)

      return items
    },

    async loadAvailableFiltersFrom ({ commit, getters, dispatch }, { aggregations, attributeMetadata, category, filters = {} }) {
      if (entities.attribute.loadByAttributeMetadata) {
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

      const ranges = priceSliderHooksExecutors.beforeSetRanges({
        min: priceSlider.fetchRanges ? aggregations.agg_min_price.value : priceSlider.constRanges.min,
        max: priceSlider.fetchRanges ? aggregations.agg_max_price.value : priceSlider.constRanges.max
      })

      commit(PRICE_RANGES_MUTATION, ranges)
      priceSliderHooksExecutors.afterSetRanges(ranges)
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
      const currentQuery = filters || rootState.route[products.routerFiltersSource]
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

export const CustomPriceSlider: StorefrontModule = async () => {
  extendStore('category-next', categoryNextGetters)
  if (!priceSlider.fetchRanges && !priceSlider.constRanges) {
    console.error('[VSF] Price Slider module not configured! Please check readme and fix it.')
  }
}
