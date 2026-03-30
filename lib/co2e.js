const GAS_FACTORS = {
    CH4: 28,
    CO2: 1,
    N2O: 265
};

const normalizeGasDesignation = (designation = '') =>
    String(designation)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (char) => ({
            '₀': '0',
            '₁': '1',
            '₂': '2',
            '₃': '3',
            '₄': '4',
            '₅': '5',
            '₆': '6',
            '₇': '7',
            '₈': '8',
            '₉': '9'
        }[char] || char))
        .replace(/\s+/g, '')
        .toUpperCase();

export const getCo2eFactor = (designation) => GAS_FACTORS[normalizeGasDesignation(designation)] || 0;

export const computeMeasureCo2e = (ppm = []) =>
    ppm.reduce((total, item) => {
        const factor = getCo2eFactor(item?.gaz?.designation);
        const value = Number(item?.value) || 0;
        return total + value * factor;
    }, 0);

export const convertCo2eToTons = (value = 0) => (Number(value) || 0) * 0.001;

export const computeCarbonCost = (value = 0) => convertCo2eToTons(value) * 15;
