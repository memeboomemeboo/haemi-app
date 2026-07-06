// Typography Design Tokens from Figma
export const typography = {
  fontFamily: {
    base: 'Pretendard',
  },

  // Display styles - 36px & 32px
  display: {
    display1: {
      bold: {
        fontSize: 36,
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      semibold: {
        fontSize: 36,
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      medium: {
        fontSize: 36,
        fontWeight: 500,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      regular: {
        fontSize: 36,
        fontWeight: 400,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
    },
    display2: {
      bold: {
        fontSize: 32,
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      semibold: {
        fontSize: 32,
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      medium: {
        fontSize: 32,
        fontWeight: 500,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      regular: {
        fontSize: 32,
        fontWeight: 400,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
    },
  },

  // Title styles - 28px & 24px
  title: {
    title1: {
      bold: {
        fontSize: 28,
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      semibold: {
        fontSize: 28,
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      medium: {
        fontSize: 28,
        fontWeight: 400,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      regular: {
        fontSize: 28,
        fontWeight: 500,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
    },
    title2: {
      bold: {
        fontSize: 24,
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      semibold: {
        fontSize: 24,
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      medium: {
        fontSize: 24,
        fontWeight: 500,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      regular: {
        fontSize: 24,
        fontWeight: 400,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
    },
  },

  // Headline styles - 20px & 18px
  headline: {
    headline1: {
      bold: {
        fontSize: 20,
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      semibold: {
        fontSize: 20,
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      medium: {
        fontSize: 20,
        fontWeight: 500,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      regular: {
        fontSize: 20,
        fontWeight: 400,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
    },
    headline2: {
      bold: {
        fontSize: 18,
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      semibold: {
        fontSize: 18,
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      medium: {
        fontSize: 18,
        fontWeight: 500,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
      regular: {
        fontSize: 18,
        fontWeight: 400,
        lineHeight: 1.3,
        letterSpacing: -2,
      },
    },
  },

  // Body - 16px
  body: {
    bold: {
      fontSize: 16,
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: -2,
    },
    semibold: {
      fontSize: 16,
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: -2,
    },
    medium: {
      fontSize: 16,
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: -2,
    },
    regular: {
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.3,
      letterSpacing: -2,
    },
  },

  // Label - 14px
  label: {
    bold: {
      fontSize: 14,
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: -2,
    },
    semibold: {
      fontSize: 14,
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: -2,
    },
    medium: {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: -2,
    },
    regular: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.3,
      letterSpacing: -2,
    },
  },

  // Caption - 12px
  caption: {
    bold: {
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: -2,
    },
    semibold: {
      fontSize: 12,
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: -2,
    },
    medium: {
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: -2,
    },
    regular: {
      fontSize: 12,
      fontWeight: 400,
      lineHeight: 1.3,
      letterSpacing: -2,
    },
  },
} as const;

export type Typography = typeof typography;
