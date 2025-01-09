export const locales = ['en', 'sv']

export const routes = {
  '/': {
    data: async ({ lang }) => {
      return {
        title: `Hello White!`,
      }
    },
  },
}
