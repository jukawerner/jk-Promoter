/**
 * Utility functions for formatting data in promoter forms
 */

type FormattedData = {
  [key: string]: string | number | FormattedData | FormattedData[] | null;
};

export const formatPromoterData = (data: any): FormattedData | FormattedData[] | null => {
  if (!data) return null;

  if (Array.isArray(data)) {
    return data.map(item => formatPromoterData(item)) as FormattedData[];
  }

  if (typeof data === 'object') {
    const formattedData: FormattedData = {};
    for (const key in data) {
      if (typeof data[key] === 'string') {
        formattedData[key] = data[key].toUpperCase();
      } else if (typeof data[key] === 'number') {
        // Format numbers with thousands separator and 2 decimal places
        formattedData[key] = new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(data[key]);
      } else if (typeof data[key] === 'object') {
        formattedData[key] = formatPromoterData(data[key]);
      }
    }
    return formattedData;
  }

  return null;
};

// Format number to Brazilian format (e.g., "1.234,56")
export const formatNumber = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

// Function to parse formatted number back to number type
export const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;
  return Number(value.replace(/\./g, '').replace(',', '.'));
};
