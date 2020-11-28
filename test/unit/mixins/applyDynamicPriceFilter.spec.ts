import applyDynamicPriceFilter from '../../../mixins/applyDynamicPriceFilter';
import { shallowMount } from '@vue/test-utils';

const builtPriceVariant = 'builtPriceVariant';

jest.mock('../../../helpers/buildFilterPriceVariant', () => jest.fn(() => builtPriceVariant))

describe('[VSF-Price-Slider] applyDynamicPriceFilter', () => {
  const key = 'dynamicPrice';
  const mixin = applyDynamicPriceFilter(key);

  const TestComponent = {
    mixins: [mixin],
    template: '<div></div>'
  }

  it('sets "dynamicPrice" as a default namespace', () => {
    const mixin = applyDynamicPriceFilter();

    expect(mixin.data().dynamicPrice).toMatchObject({
      values: [
        0,
        50
      ],
      initialSetupDone: false
    })
  })

  it('applyFilter method applies filter with Vuex action', () => {
    const minPrice = 10;
    const maxPrice = 25;
    const returns = 'abc';
    const dispatch = jest.fn(() => returns);

    const returned = mixin.methods.applyFilter.call({
      [key]: {
        values: [
          minPrice,
          maxPrice
        ]
      },
      $store: {
        dispatch
      }
    })

    expect(returned).toBe(returns);
    expect(dispatch).toHaveBeenCalledWith('category-next/switchSearchFilters', [
      builtPriceVariant
    ])
  })

  it('sets min & max and initialSetupDone in next tick to prevent watcher reaction', async () => {
    const min = 10;
    const max = 25
    const applyFilter = jest.fn();

    const wrapper = shallowMount(TestComponent, {
      mocks: {
        $store: {
          state: {
            'category-next': {
              dynamicPriceRanges: {
                min,
                max
              }
            }
          }
        },
        $route: {
          query: {}
        }
      },
      methods: {
        applyFilter
      }
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm[key].initialSetupDone).toBe(true)
    expect(wrapper.vm[key].values[0]).toBe(min)
    expect(wrapper.vm[key].values[1]).toBe(max)
    expect(applyFilter).not.toHaveBeenCalled()
  })

  it('computed getters works properly', async () => {
    const min = 10;
    const max = 25

    const wrapper = shallowMount(TestComponent, {
      mocks: {
        $store: {
          state: {
            'category-next': {
              dynamicPriceRanges: {
                min,
                max
              }
            }
          }
        },
        $route: {
          query: {}
        }
      }
    });

    expect((wrapper.vm as any).minAvailablePrice).toBe(min)
    expect((wrapper.vm as any).maxAvailablePrice).toBe(max)
  })

  it('changing range calls watcher which runs applyFilter', async () => {
    const min = 10;
    const max = 25;
    const applyFilter = jest.fn();

    const wrapper = shallowMount(TestComponent, {
      mocks: {
        $store: {
          state: {
            'category-next': {
              dynamicPriceRanges: {
                min,
                max
              }
            }
          }
        },
        $route: {
          query: {}
        }
      },
      methods: {
        applyFilter
      }
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    wrapper.setData({
      [key]: {
        values: [
          10,
          20
        ],
        initialSetupDone: true
      }
    })
    await wrapper.vm.$nextTick();

    expect(applyFilter).toHaveBeenCalled()
  })

  it('sets min & max from route if exists', async () => {
    const min = 10;
    const max = 25

    const routeMin = 15;
    const routeMax = 28;
    const applyFilter = jest.fn();

    const wrapper = shallowMount(TestComponent, {
      mocks: {
        $store: {
          state: {
            'category-next': {
              dynamicPriceRanges: {
                min,
                max
              }
            }
          }
        },
        $route: {
          query: {
            price: `${routeMin}-${routeMax}`
          }
        }
      },
      methods: {
        applyFilter
      }
    });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm[key].initialSetupDone).toBe(true)
    expect(wrapper.vm[key].values[0]).toBe(routeMin)
    expect(wrapper.vm[key].values[1]).toBe(routeMax)
    expect(applyFilter).not.toHaveBeenCalled()
  })
})
