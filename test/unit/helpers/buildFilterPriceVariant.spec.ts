import buildFilterPriceVariant from '../../../helpers/buildFilterPriceVariant';

jest.mock('@vue-storefront/core/filters/price', () => ({
  price: jest.fn(pr => `af--${pr}`)
}))

describe('[VSF-Price-Slider] buildFilterPriceVariant', () => {

  it('returns FilterVariant object', () => {
    const from = '10';
    const to = '25';
    const expectedFilterVariant = {
      single: true,
      type: 'price',
      from,
      to,
      id: `${from}-${to}`,
      label: `af--${from} - af--${to}`
    }

    const filterVariant = buildFilterPriceVariant(from, to);

    expect(filterVariant).toMatchObject(expectedFilterVariant);
  })

})
