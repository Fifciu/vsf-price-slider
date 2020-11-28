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
- [x] Make aggregations min max optional (also in storefront-query-builder)
- [x] Rename to price slider


## How to install
1. Clone repository to `src/modules`
2. Register module in `src/modules/client.ts`
3. Make sure you are using the newest version of `storefront-query-builder`
4. Configure

## Config
### Dynamicly calculated ranges
```js
"priceSlider": {
    "fetchRanges": true
}
```

### Hardcoded ranges
```js
"priceSlider": {
    "fetchRanges": false,
    "constRanges": true
}
```

And to `config.products` add:
```js
"aggregate": {
    "minPrice": 0,
    "maxPrice": 2000
}
```