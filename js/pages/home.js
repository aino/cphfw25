import { create, id, createFromString, q, style } from '@/js/utils/dom'
import animate from '@/js/utils/animate'
import state from '@/js/utils/state'

import '@/styles/pages/home.css'
import gallery from '../gallery'
import sidegallery from '../sidegallery'
import buttons from '../buttons'
import { throttle } from '../utils/debounce'

const AUTOSCROLL_TIMEOUT = 3000

const isTouch = 'ontouchstart' in window
export const isMobile = innerWidth < 600 && isTouch

export const path = /^\/$/

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function home(app) {
  const site = id('site')
  const destroyers = []
  const sections = q('section', site)
  const hero = sections[0]
  const autoscroll = state(false)

  let siteHeight = 0

  const siteHeightObserver = new ResizeObserver(
    () => (siteHeight = site.getBoundingClientRect().height)
  )
  siteHeightObserver.observe(site)

  const loader = createFromString(
    `
    <div class="loadercontainer">
      <div class="loader">
        <svg class="circle" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="28" />
        </svg>
        <div class="line"></div>
      </div>
    </div>
  `
  )
  site.prepend(loader)
  const progress = create('div', { class: 'progress' }, loader)
  const fader = create('div', { class: 'fader' }, site)
  const [video] = q('video', hero)

  animate({
    duration: 3300,
    onFrame: (n) => {
      progress.innerText = `Loading Radiant Connections ${Math.ceil(n * 100)}%`
    },
    onComplete: () => {
      fader.classList.add('out')
      loader.classList.add('fadeout')
      loader.classList.add('pause')
      start()
    },
  })

  const { container, centerButtonState, destroy, descriptionState } = buttons(
    app,
    () => activeSection
  )

  destroyers.push(gallery(app))
  destroyers.push(sidegallery(app))
  destroyers.push(destroy)

  Promise.all([
    wait(500),
    new Promise((resolve) => {
      if (!video || video.readyState >= 3) {
        resolve()
      } else {
        video.addEventListener('playing', resolve)
      }
    }),
  ]).then(() => {
    fader.classList.add('fade')
    loader.classList.remove('pause')
  })
  let activeSection = null

  function start() {
    const spacerTop = create('div', { class: 'spacer' })
    const spacerBottom = spacerTop.cloneNode(true)
    site.appendChild(spacerBottom)
    site.prepend(spacerTop)
    style(site, {
      position: 'relative',
    })
    const y = (isMobile ? screen.availHeight : innerHeight) + 100
    scrollTo(0, y)
    container.classList.add('transition')
    requestAnimationFrame(() => {
      container.classList.add('show')
      requestAnimationFrame(() => {
        container.classList.add('done')
      })
    })

    const throttledScrollHandler = throttle(() => {
      let closestSection = null
      let smallestDistanceToCenter = Infinity
      for (const section of sections) {
        const rect = section.getBoundingClientRect()
        const distanceToCenter = Math.abs(
          rect.top + rect.height / 2 - window.innerHeight / 2
        )

        // Find the section closest to the center of the viewport
        if (distanceToCenter < smallestDistanceToCenter) {
          smallestDistanceToCenter = distanceToCenter
          closestSection = section
        }
      }
      if (closestSection !== activeSection) {
        activeSection = closestSection
        let title = activeSection.dataset.title
        if (!title && activeSection.classList.contains('footer')) {
          title = 'Visit shop'
        }
        centerButtonState.set(title)
        const [desc] = q('.description', activeSection)
        if (descriptionState.value?.type === 'description') {
          descriptionState.set({
            type: 'description',
            content: desc?.innerHTML || '',
          })
        }
      }
    }, 200)

    const scrollHandler = () => {
      if (scrollY < 100) {
        scrollTo(0, siteHeight - innerHeight - 100)
      } else if (scrollY > siteHeight - innerHeight - 100) {
        scrollTo(0, 100)
      }
      throttledScrollHandler()
    }

    addEventListener('scroll', scrollHandler)
    destroyers.push(() => {
      removeEventListener('scroll', scrollHandler)
    })

    const scrollFrame = () => {
      let then = Date.now()
      function loop() {
        const now = Date.now()
        const nextY = scrollY + (now - then) / 12
        scrollTo(0, nextY)
        then = now
        if (autoscroll.value) {
          requestAnimationFrame(loop)
        }
      }
      loop()
      const activateScroll = () => {
        then = Date.now()
        autoscroll.set(true)
        loop()
      }
      let autoscrollTimer = setTimeout(activateScroll, AUTOSCROLL_TIMEOUT)
      const stopScroll = () => {
        clearTimeout(autoscrollTimer)
        autoscrollTimer = setTimeout(activateScroll, AUTOSCROLL_TIMEOUT)
        autoscroll.set(false)
      }
      addEventListener('mousemove', stopScroll)
      addEventListener('wheel', stopScroll)
      addEventListener('touchstart', stopScroll)
      destroyers.push(() => {
        removeEventListener('mousemove', stopScroll)
        removeEventListener('wheel', stopScroll)
        removeEventListener('touchstart', stopScroll)
      })
    }
    setTimeout(scrollFrame, 600)
  }

  return () => {
    destroyers.forEach((destroy) => destroy())
  }
}
