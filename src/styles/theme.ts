import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    main: {
      50: '#b8da42',
      100: '#FF0000',
      200: '#99B637',
      300: '#AFDC29',
      400: '#3D4916',
      500: '#141909',
      600: '#222D09',
      700: '#B8DA421A',
      800: '#7D9622',
      900: '#D9D9D90D',
    },
  },
  styles: {
    global: {
      html: {
        background: '#020302',
      },
      body: {
        background: 'transparent',
      },
      a: {
        fontWeight: 'bold',
      },
    },
  },
  fonts: {
    heading: 'Varela',
    body: 'Varela',
  },
  components: {
    Button: {
      variants: {
        solid: {
          bg: 'main.300',
          color: '#1D4936',
          _hover: {
            bg: 'main.200',
          },
        },
        outline: {
          color: 'main.300',
          bg: 'transparent',
          border: '1px solid',
          borderColor: 'main.300',
        },
      },
    },
  },
})
