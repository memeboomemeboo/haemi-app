// Color Design Tokens from Figma
export const colors = {
  // Primary
  primary: '#fd6941',

  // Status Colors
  status: {
    error: '#ee2a2b',
    info: '#1a97ff',
    success: '#31e87a',
    warning: '#ffd11a',
  },

  // Semantic Colors - Light Mode
  light: {
    primary: '#fd6941',
    label: {
      normal: '#0c0c0d',
      strong: '#000000',
      neutral: '#3c3e3f',
      alternative: '#5a5c5d',
      assistive: '#76787a',
      disabled: '#e6e6e7',
      buttonText: '#f5f5f5',
    },
    line: {
      normal: '#c1c2c3',
      neutral: '#dadbdc',
      alternative: '#e8e8e9',
    },
    background: {
      normal: '#ffffff',
      neutral: '#f7f7f7',
      alternative: '#fafafa',
    },
    fill: {
      normal: '#f7f7f7',
      neutral: '#e6e6e7',
      alternative: '#dddedf',
    },
  },

  // Semantic Colors - Dark Mode
  dark: {
    primary: '#fd6941',
    label: {
      normal: '#f5f5f5',
      strong: '#ffffff',
      neutral: '#dcddde',
      alternative: '#c4c5c6',
      assistive: '#9c9d9f',
      disabled: '#3c3e3f',
      buttonText: '#0c0c0d',
    },
    line: {
      normal: '#747678',
      neutral: '#48494a',
      alternative: '#383a3b',
    },
    background: {
      normal: '#292a2b',
      neutral: '#4d4f51',
      alternative: '#303234',
    },
    fill: {
      normal: '#2a2b2c',
      neutral: '#383a3b',
      alternative: '#48494a',
    },
  },

  // Color Palette
  palette: {
    blue: {
      90: '#cdeafe',
      80: '#9bd4fd',
      70: '#6abffb',
      60: '#38a9fa',
      50: '#0694f9',
      40: '#0576c7',
      30: '#045995',
      20: '#023b64',
      10: '#011e32',
    },
    green: {
      90: '#cdfeeb',
      80: '#9bfdd7',
      70: '#69fcc3',
      60: '#37fbb0',
      50: '#06f99c',
      40: '#04c87d',
      30: '#03965d',
      20: '#02643e',
      10: '#01321f',
    },
    red: {
      90: '#fecdcd',
      80: '#fd9b9b',
      70: '#fb6a6a',
      60: '#fa3838',
      50: '#f90606',
      40: '#c70505',
      30: '#950404',
      20: '#640202',
      10: '#320101',
    },
    yellow: {
      90: '#fef8cd',
      80: '#fdf19b',
      70: '#fbea6a',
      60: '#fae438',
      50: '#f9dd06',
      40: '#c7b105',
      30: '#958404',
      20: '#645802',
      10: '#322c01',
    },
    neutral: {
      99: '#fcfcfc',
      97: '#f7f7f7',
      95: '#f2f2f2',
      90: '#e6e6e6',
      80: '#cccccc',
      70: '#b3b3b3',
      60: '#999999',
      50: '#808080',
      40: '#666666',
      30: '#4d4d4d',
      20: '#333333',
      10: '#1a1a1a',
      7: '#121212',
      5: '#0d0d0d',
    },
  },
} as const;

export type Colors = typeof colors;
