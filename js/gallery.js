import { isTouch } from './pages/home'
import { lerp, reverseLerp } from './utils/animate'
import { q } from '@/js/utils/dom'

const generateRandomFlex = (rowSize) => {
  const min = 12 // Minimum percentage (1 column in a 12-grid system)
  const max = 48 // Maximum percentage (4 columns in a 12-grid system)
  const gridStep = 12 // Step size for 12-grid system
  const weights = Array.from({ length: rowSize }, () => Math.random())
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  let percentages = weights.map((w) => {
    const raw = min + (w / totalWeight) * (max - min)
    return Math.round(raw / gridStep) * gridStep
  })

  // Adjust to sum to 100%
  const scale = 100 / percentages.reduce((sum, p) => sum + p, 0)
  percentages = percentages.map(
    (p) => Math.round((p * scale) / gridStep) * gridStep
  )

  // Final correction to make sure the total is exactly 100%
  const correction = 100 - percentages.reduce((sum, p) => sum + p, 0)
  if (correction !== 0) {
    percentages[
      percentages.findIndex(
        (p) => p + correction >= min && p + correction <= max
      )
    ] += correction
  }

  return percentages
}

export default async function gallery(app) {
  return
  // Create an IntersectionObserver to track visibility
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.dataset.entered = entry.time // Record the time the item entered
        } else {
          delete entry.target.dataset.entered // Clear time when the item exits
        }
      })
    },
    {
      root: null, // Use viewport as root
      threshold: 0, // Trigger as soon as it enters
      rootMargin: '100px',
    }
  )

  for (const images of q('.gallery .images', app)) {
    images.addEventListener('mouseover', (e) => {
      const im = e.target.closest('.image')
      if (im) {
        im.classList.add('over')
      }
    })
    images.addEventListener('mouseout', (e) => {
      const im = e.target.closest('.image')
      if (im && im.classList.contains('over')) {
        im.classList.remove('over')
      }
    })
    const imgs = q('.image', images)

    // Assign random flex and speed for each row
    const ROW_SIZE = [4] // Possible row sizes
    let currentIndex = 0

    while (currentIndex < imgs.length) {
      const rowSize = ROW_SIZE[Math.floor(Math.random() * ROW_SIZE.length)]
      const rowItems = imgs.slice(currentIndex, currentIndex + rowSize)
      const percentages = generateRandomFlex(rowItems.length)

      rowItems.forEach((item, i) => {
        const flexPercentage = percentages[i]
        const paddingBottom = flexPercentage * 1.333

        // Apply inline styles
        item.style.flex = `0 0 ${flexPercentage}%`
        item.style.paddingBottom = `${paddingBottom}%`

        // Set random speed for parallax movement
        const randomSpeed = lerp(0, 18, Math.random())
        item.dataset.speed = randomSpeed

        // Observe the item
        observer.observe(item)
      })

      currentIndex += rowSize
    }
  }

  // Scroll listener for parallax effect
  const galleryImages = q('.gallery .image', app)
  const onScroll = () => {
    galleryImages.forEach((item) => {
      if (item.dataset.entered) {
        const rect = item.getBoundingClientRect()
        const speed = parseFloat(item.dataset.speed)
        const vmin = lerp(
          -speed,
          speed,
          reverseLerp(-rect.height - 100, innerHeight + 100, rect.y)
        )
        item.style.transform = `translateY(${vmin}vmin)`
      }
    })
  }
  addEventListener('scroll', onScroll)

  return () => {
    removeEventListener('scroll', onScroll)
  }
}
