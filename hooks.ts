import { createListenerHook, createMutatorHook } from '@vue-storefront/core/lib/hooks'

interface PriceRanges {
  min: number,
  max: number
}

const {
  hook: beforeSetRangesHook,
  executor: beforeSetRangesExecutor
} = createMutatorHook<PriceRanges, PriceRanges>()

const {
  hook: afterSetRangesHook,
  executor: afterSetRangesExecutor
} = createListenerHook<PriceRanges>()

/** Only for internal usage in this module */
const priceSliderHooksExecutors = {
  beforeSetRanges: beforeSetRangesExecutor,
  afterSetRanges: afterSetRangesExecutor
}

const priceSliderHooks = {
  /** Hook is fired directly before setting new price ranges in vuex module
   * @param [min: number, max: number]
   * @return [number, number]
   */
  beforeSetRanges: beforeSetRangesHook,
  /** Hook is fired right after setting new price ranges in vuex module
   * @param [min: number, max: number]
   */
  afterSetRanges: afterSetRangesHook
}

export {
  priceSliderHooks,
  priceSliderHooksExecutors
}
