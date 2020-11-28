import { CustomPriceSlider } from '../../';
import config from 'config';
import { extendStore } from '@vue-storefront/core/helpers';


jest.mock('config', () => ({}))

jest.mock('@vue-storefront/core/helpers', () => ({
    extendStore: jest.fn()
}))

const categoryNextModule = 123;
jest.mock('../../store/category-next', () => ({
    categoryNextModule: 123
}))

const consoleLogMock = {
    error: jest.fn(),
    log: console.log
};
  
Object.defineProperty(window, 'console', {
    value: consoleLogMock
});

describe('[VSF-Price-Slider] CustomPriceSlider', () => {
    it('logs and returns if priceSlider not configured', () => {
        config.priceSlider = null

        CustomPriceSlider({} as any);

        expect(consoleLogMock.error).toHaveBeenCalled();
    });

    it('logs and returns if constRanges not fully configured', () => {
        config.priceSlider = {
            constRanges: true
        }

        config.products = {
            aggregate: {}
        }

        CustomPriceSlider({} as any);

        expect(consoleLogMock.error).toHaveBeenCalled();
    });

    it('logs and returns if constRanges not fully configured - second part of the condition', () => {
        config.priceSlider = {
            constRanges: true
        }

        config.products = {
            aggregate: {
                minPrice: 23
            }
        }

        CustomPriceSlider({} as any);

        expect(consoleLogMock.error).toHaveBeenCalled();
    });

    it('extends store if fetchRanges enabled', () => {
        config.priceSlider = {
            fetchRanges: true
        }

        CustomPriceSlider({} as any);

        expect(extendStore).toHaveBeenCalledWith('category-next', categoryNextModule);
    });

    it('extends store if constRanges enabled & ranges setup', () => {
        config.priceSlider = {
            fetchRanges: true
        }

        config.products = {
            aggregate: {
                minPrice: 20,
                maxPrice: 40
            }
        }

        CustomPriceSlider({} as any);

        expect(extendStore).toHaveBeenCalledWith('category-next', categoryNextModule);
    });
});