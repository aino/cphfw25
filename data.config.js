export const locales = ['en']

export const routes = {
  '/': {
    data: async ({ lang }) => {
      const sections = [
        {
          video: true,
          title: 'Radiant Connections',
          background: '/hero.mp4',
          description: `<h2>About Radiant Connections</h2><p>Radiant Connections explores the harmony between urban energy and natural
          simplicity. With clean silhouettes, layered textures, and a warm, earthy
          palette, the collection highlights the brand’s Scandinavian roots while
          introducing innovative, sustainable materials. Radiant Connections
          reflects modern Nordic fashion with timeless, understated pieces designed
          for effortless expression.</p>`,
        },
        {
          sideGallery: true,
          title: 'Exhibition Space',
          description:
            '<h2>Discover the future of fashion</h2><p>Experience the latest trends and styles in our immersive exhibition space.</p>',
          images: [
            {
              image: '/images/side1.png',
            },
            {
              image: '/images/side2.png',
            },
          ],
        },
        {
          image: true,
          title: 'Creative Team',
          background: '/images/team.webp',
          description: `
            <h2>Natalia Marekova<br>Art Director</h2>
            <p>Natalia is a visionary artist with a passion for creating immersive experiences.</p>
            <h2>Jesper Lund<br>Creative Director</h2>
            <p>Jesper is a master of storytelling and a true visionary.</p>
            <h2>Mia Hansen<br>Stylist</h2>
            <p>Mia is a fashion icon and a master of style.</p>
          `,
        },
        {
          sideGallery: true,
          title: 'Octarine Purepalette™',
          description:
            '<h2>Discover the future of color</h2><p>Experience the latest trends and styles in our immersive exhibition space.</p>',
          images: [
            {
              title: 'Our mission',
              description: 'We are on a mission to bring color to the world.',
              image: '/images/oct1.png',
            },
            {
              title: 'Our mission',
              description: 'We are on a mission to bring color to the world.',
              image: '/images/oct2.png',
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
        name: 'Radiant Connections',
        description: `<h2>About Radiant Connections</h2><p>Radiant Connections explores the harmony between urban energy and natural
          simplicity. With clean silhouettes, layered textures, and a warm, earthy
          palette, the collection highlights the brand’s Scandinavian roots while
          introducing innovative, sustainable materials. Radiant Connections
          reflects modern Nordic fashion with timeless, understated pieces designed
          for effortless expression.</p>`,
      }
    },
  },
}
