export const locales = ['en']

export const routes = {
  '/': {
    data: async ({ lang }) => {
      const sections = [
        {
          sideGallery: true,
          title: 'Exhibition Space',
          images: ['/images/side1.png', '/images/side2.png'],
        },
        {
          textBlocks: true,
          title: 'Creative Team',
          blocks: [
            {
              name: 'Natalia Marekova',
              title: 'Art Director',
              description:
                'Natalia is a visionary artist with a passion for creating immersive experiences.',
            },
            {
              name: 'Jesper Lund',
              title: 'Creative Director',
              description:
                'Jesper is a master of storytelling and a true visionary.',
            },
            {
              name: 'Mia Hansen',
              title: 'Stylist',
              description: 'Mia is a fashion icon and a master of style.',
            },
          ],
        },
        {
          gallery: true,
          title: 'Guests',
          images: [
            '/images/guest1.png',
            '/images/guest2.png',
            '/images/guest3.png',
            '/images/guest1.png',
            '/images/guest2.png',
            '/images/guest3.png',
            '/images/guest1.png',
            '/images/guest2.png',
            '/images/guest3.png',
          ],
        },
        {
          gallery: true,
          title: 'Lookbook',
          images: [
            '/images/team1.png',
            '/images/team2.png',
            '/images/team3.png',
            '/images/team1.png',
            '/images/team2.png',
            '/images/team3.png',
            '/images/team1.png',
            '/images/team2.png',
            '/images/team3.png',
          ],
        },
      ]

      return {
        title: `Samsøe Samsøe CPHFW 2025`,
        heroVideo: '/hero.mp4',
        sections,
        showTitle: 'Radiant Connections',
      }
    },
  },
}
