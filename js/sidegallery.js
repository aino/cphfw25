import { q } from '@/js/utils/dom'
import EmblaCarousel from 'embla-carousel'
import AutoScroll from 'embla-carousel-auto-scroll'

export default async function sidegallery(app) {
  const sideGalleries = q('.sidegallery', app)

  const instances = []

  sideGalleries.forEach((sidegallery, i) => {
    const [images] = q('.images', sidegallery)
    for (const image of q('.image', images)) {
      images.appendChild(image.cloneNode(true))
    }
    const autoscroll = AutoScroll({
      speed: 1,
      startDelay: 0,
      stopOnInteraction: false,
      direction: i % 2 ? 'backward' : 'forward',
    })
    const embla = EmblaCarousel(
      sidegallery,
      {
        loop: true,
        dragFree: true,
      },
      [autoscroll]
    )

    let isTouching = false
    let prevVelocity = null

    embla.on('pointerDown', () => {
      isTouching = true
    })

    embla.on('pointerUp', () => {
      isTouching = false
    })

    embla.on('scroll', () => {
      const velocity = embla.internalEngine().scrollBody.velocity()
      if (prevVelocity !== null && !isTouching) {
        const isSlowingDown = Math.abs(velocity) < Math.abs(prevVelocity)
        if (isSlowingDown && Math.abs(velocity) < 1) {
          autoscroll.play()
        }
      }
      prevVelocity = velocity
    })
    instances.push(embla)
  })
  return () => {
    for (const instance of instances) {
      instance.destroy()
    }
  }
}
