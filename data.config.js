export const locales = ['en']

export const routes = {
  '/': {
    data: async ({ lang }) => {
      return {
        title: `Hello White!`,
        image:
          'https://static.bonniernews.se/gcs/bilder/dn-mly/22375e6f-4d29-42f0-8e1d-664bddc41456.jpeg',
      }
    },
  },
}
