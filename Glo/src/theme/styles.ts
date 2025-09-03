import { mode } from '@chakra-ui/theme-tools';
export const globalStyles = {
  colors: {
    brand: {
      100: '#E9E3FF',
      200: '#047BF8',
      300: '#047BF8',
      400: '#323C58',
      500: '#047BF8',
      600: '#323C58',
      700: '#231F29',
      800: '#231F29',
      900: '#11047A',
    },
    brandScheme: {
      100: '#E9E3FF',
      200: '#323C58',
      300: '#323C58',
      400: '#323C58',
      500: '#047BF8',
      600: '#323C58',
      700: '#231F29',
      800: '#231F29',
      900: '#231F29',
    },
    brandTabs: {
      100: '#E9E3FF',
      200: '#047BF8',
      300: '#047BF8',
      400: '#047BF8',
      500: '#047BF8',
      600: '#323C58',
      700: '#231F29',
      800: '#231F29',
      900: '#231F29',
    },
    secondaryGray: {
      100: '#E0E5F2',
      200: '#E2E8F0',
      300: '#F4F7FE',
      400: '#E9EDF7',
      500: '#718096',
      600: '#A3AED0',
      700: '#707EAE',
      800: '#707EAE',
      900: '#1B2559',
    },
    red: {
      100: '#FEEFEE',
      500: '#EE5D50',
      600: '#E31A1A',
    },
    blue: {
      50: '#EFF4FB',
      500: '#3965FF',
    },
    orange: {
      100: '#C7B277',
      500: '#FFB547',
    },
    green: {
      100: '#E6FAF5',
      500: '#01B574',
    },
    white: {
      50: '#ffffff',
      100: '#ffffff',
      200: '#ffffff',
      300: '#ffffff',
      400: '#ffffff',
      500: '#ffffff',
      600: '#ffffff',
      700: '#ffffff',
      800: '#ffffff',
      900: '#ffffff',
    },
    navy: {
      50: '#d0dcfb',
      100: '#aac0fe',
      200: '#a3b9f8',
      300: '#728fea',
      400: '#3652ba',
      500: '#1b3bbb',
      600: '#24388a',
      700: '#1B254B',
      800: '#111c44',
      900: '#0b1437',
    },
    gray: {
      100: '#FAFCFE',
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        overflowX: 'hidden',
        bg: mode('#fdfeff', 'navy.900')(props),
        fontFamily: '"Montserrat", sans-serif',
        fontWeight: '400', // Regular
        fontStyle: 'normal', // Not italic
      },
      'b,strong': {
        fontWeight: 'bold', // Bold
      },
      'i,em': {
        fontStyle: 'italic', // Italic
      },
      input: {
        color: 'gray.700',
        fontFamily: '"Montserrat", sans-serif',
      },
      html: {
        fontFamily: '"Montserrat", sans-serif',
      },
    }),
  },
};
