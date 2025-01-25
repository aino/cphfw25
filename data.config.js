import { marked } from 'marked'

export const locales = ['en']

const getAssetUrl = (url) => (url.startsWith('//') ? `https:${url}` : url)

export const routes = {
  '/': {
    data: async ({ lang }) => {
      const response = await fetch('http://samsoe.com/api/admin/cphfw')
      const fromApi = await response.json()

      fromApi.description = marked(fromApi.description || '')
      fromApi.sound = getAssetUrl(fromApi.sound?.url || '')

      for (const section of fromApi.sections) {
        if (section.type === 'video') {
          section.background = getAssetUrl(section.video.url)
        } else if (section.type === 'image') {
          section.background = getAssetUrl(section.image.url)
        } else if (section.type === 'sidegallery') {
          const nextImages = section.images.map((image) => ({
            image: getAssetUrl(image.image.url),
            title: image.title || '',
            description: marked(image.description || ''),
          }))
          delete section.video
          section.images = nextImages
        } else if (section.type === 'gallery') {
          const nextImages = section.images.map((image) => ({
            image: getAssetUrl(image.image.url),
            hover: getAssetUrl(image.hover.url),
          }))
          console.log(nextImages)
          section.images = nextImages
        }
        section[`type_${section.type}`] = true
        section.description = marked(section.description || '')
      }

      return fromApi

      const sections = [
        {
          video: true,
          title: 'Radiant Connections',
          background: '/hero2.mp4',
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
              image: '/images/Samsøe_Samsøe_Octarine_Content_Landing_Page.jpg',
            },
            {
              image: '/images/Samsøe_Samsøe_Octarine_Content_Landing_Page2.jpg',
            },
            {
              image: '/images/Samsøe_Samsøe_Octarine_Content_Landing_Page3.jpg',
            },
            {
              image: '/images/Samsøe_Samsøe_Octarine_Content_Landing_Page5.jpg',
            },
            {
              image: '/images/Samsøe_Samsøe_Octarine_Content_Landing_Page6.jpg',
            },
          ],
        },
        {
          gallery: true,
          title: 'Guests',
          description:
            '<h2>Our guests</h2><p>Lorem ipsum dorem ipsum dorem ipsum dorem ipsum dorem </p><h2>Download assets</h2><p><a href="https://google.com" target="_blank">Media Bank Portal</a></p>',
          images: [
            {
              image: '/images/guest1.png',
              hover: '/images/guest2.png',
            },
            {
              image: '/images/guest2.png',
              hover: '/images/guest3.png',
            },
            {
              image: '/images/guest3.png',
              hover: '/images/guest1.png',
            },
            {
              image: '/images/guest1.png',
              hover: '/images/guest2.png',
            },
            {
              image: '/images/guest2.png',
              hover: '/images/guest3.png',
            },
            {
              image: '/images/guest3.png',
              hover: '/images/guest1.png',
            },
            {
              image: '/images/guest1.png',
              hover: '/images/guest2.png',
            },
            {
              image: '/images/guest2.png',
              hover: '/images/guest3.png',
            },
            {
              image: '/images/guest3.png',
              hover: '/images/guest1.png',
            },
            {
              image: '/images/guest1.png',
              hover: '/images/guest2.png',
            },
            {
              image: '/images/guest2.png',
              hover: '/images/guest3.png',
            },
            {
              image: '/images/guest3.png',
              hover: '/images/guest1.png',
            },
          ],
        },
        {
          gallery: true,
          title: 'Lookbook',
          images: [
            {
              image: '/images/team1.png',
              hover: '/images/team2.png',
            },
            {
              image: '/images/team2.png',
              hover: '/images/team3.png',
            },
            {
              image: '/images/team3.png',
              hover: '/images/team1.png',
            },
            {
              image: '/images/team1.png',
              hover: '/images/team2.png',
            },
            {
              image: '/images/team2.png',
              hover: '/images/team3.png',
            },
            {
              image: '/images/team3.png',
              hover: '/images/team1.png',
            },
            {
              image: '/images/team1.png',
              hover: '/images/team2.png',
            },
            {
              image: '/images/team2.png',
              hover: '/images/team3.png',
            },
            {
              image: '/images/team3.png',
              hover: '/images/team1.png',
            },
            {
              image: '/images/team1.png',
              hover: '/images/team2.png',
            },
            {
              image: '/images/team2.png',
              hover: '/images/team3.png',
            },
            {
              image: '/images/team3.png',
              hover: '/images/team1.png',
            },
          ],
        },
      ]

      return {
        title: `Samsøe Samsøe CPHFW 2025`,
        sections,
        name: 'Radiant Connections',
        audio: '/SAMSOE_CPHFW_AUDIO_FOR_WEB_1min.mp3',
        description: `<h2>About CPHFW</h2><p>With a nod to its Scandinavian heritage, Samsøe Samsøe is defined by a wearable aesthetic that combines the utilitarian ease of Copenhagen street style with a quintessentially Scandinavian spirit. Collections transcend trends, drawing on Denmark’s renowned design tradition to result in minimalist, affordable and accessible fashion.</p>`,
      }
    },
  },
}
