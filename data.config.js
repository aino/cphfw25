export const locales = ['en', 'sv']

export const routes = {
  '/': {
    data: async ({ lang }) => {
      return {
        title: `Hello White!`,
      }
    },
  },
  '/about': {
    data: async ({ lang }) => {
      return {
        title: {
          en: 'About',
          sv: 'Om oss',
        }[lang],
      }
    },
  },
  '/about/[slug]': {
    slugs: () => ['contact', 'team'],
    data: async ({ slug }) => {
      return {
        title: `About ${slug}`,
      }
    },
  },
}
