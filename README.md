# VSF1 Price Slider
## Requirements
VSF 1.12+ (or maybe 1.11.5+?)

## To do list
- [x] Apply filter to query in URL
- [x] Update Storefront Query Builder to support dynamic price range (for aggregations)
- [x] Override category-next part in PWA to support dynamic price range
- [x] Create reusable mixin & Vue component which uses it
- [x] Prepare max & min aggregations
- [x] Aggregations for max & min should be independent from applied price filter
- [ ] Write unit tests
- [x] Fix for changing max/min value when value exceeds (partial fix)
- [ ] Make aggregations min max optional (also in storefront-query-builder)
- [x] Rename to price slider
- [ ] Make vue slider component lazy

## Config
config.priceSlider.fetchRanges
```js
"priceSlider": {
    "fetchRanges": true
}
```

config.priceSlider.constRanges
```js
"priceSlider": {
    "fetchRanges": false,
    "constRanges": {
        "min": 0,
        "max": 1000
    }
}
```
