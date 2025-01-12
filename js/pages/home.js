import { smoothScroll, onScroll } from '@/js/utils/scroll'
import {
  create,
  id,
  createFromString,
  q,
  style,
  getStyle,
} from '@/js/utils/dom'
import animate from '@/js/utils/animate'
import state from '@/js/utils/state'

import '@/styles/pages/home.css'

const fakeScroll =
  !('ontouchstart' in window) &&
  /Chrome\/[\d.]+/.test(navigator.userAgent) &&
  !/Edg|OPR|Brave/.test(navigator.userAgent)

console.log({ fakeScroll })

export const path = /^\/$/

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function home(app) {
  const site = id('site')
  const destroyers = []
  const ghost = create('div')
  const [hero] = q('.hero', site)
  const [buttons] = q('.buttons', app)
  let siteHeight = 0
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
  `,
    hero
  )
  const progress = create('div', { class: 'progress' }, loader)
  const fader = create('div', { class: 'fader' }, hero)
  const [video] = q('video', hero)
  const [centerButton] = q('.center', buttons)
  const [soundButton] = q('.sound', buttons)

  buttons.querySelector('button').addEventListener('click', () => {
    if (fakeScroll) {
      scrollTo(0, innerHeight + 100)
    } else {
      smoothScroll({
        to: innerHeight + 100,
      })
    }
  })
  const centerButtonText = centerButton.children[0]
  const fakeButton = centerButton.cloneNode(true)
  style(fakeButton, {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
  })
  buttons.appendChild(fakeButton)

  const sound = state(true, (nextState) => {
    soundButton.innerText = `Sound: ${nextState ? 'On' : 'Off'}`
  })

  soundButton.addEventListener('click', () => {
    sound.set(!sound.value)
  })

  animate({
    duration: 3300,
    onFrame: (n) => {
      progress.innerText = `Loading Radiant Connections ${Math.ceil(n * 100)}%`
    },
    onComplete: () => {
      loader.classList.add('fadeout')
      loader.classList.add('pause')
      start()
    },
  })

  const sideGalleries = q('.sidegallery', site)

  sideGalleries.forEach((sidegallery, i) => {
    sidegallery.dataset.direction = i % 2 === 1 ? 'left' : 'right'
    const [images] = q('.images', sidegallery)
    const gap = parseFloat(getStyle(images, 'gap'))
    let edge = 0
    for (const image of q('.image', images)) {
      edge += image.offsetWidth + gap
      images.appendChild(image.cloneNode(true))
    }
    const halfGap = Math.floor(gap / 2)
    sidegallery.scrollTo(halfGap + 1, 0)
    sidegallery.addEventListener('scroll', (e) => {
      const x = sidegallery.scrollLeft
      if (x >= edge + halfGap) {
        sidegallery.scrollTo(halfGap + 1, 0)
      } else if (x < halfGap) {
        sidegallery.scrollTo(edge + halfGap - 1, 0)
      }
    })
  })

  const startSideGalleries = () => {
    let then = Date.now()
    ;(function loop() {
      const now = Date.now()
      const distance = (now - then) / 20
      for (const sidegallery of sideGalleries) {
        let nextX = sidegallery.scrollLeft
        if (sidegallery.dataset.direction == 'left') {
          nextX -= distance
        } else {
          nextX += distance * 2
        }
        sidegallery.scrollTo(nextX, 0)
      }
      then = now
      requestAnimationFrame(loop)
    })()
  }
  startSideGalleries()

  Promise.all([
    wait(500),
    new Promise((resolve) => {
      if (video.readyState >= 3) {
        resolve()
      } else {
        video.addEventListener('playing', resolve)
      }
    }),
  ]).then(() => {
    fader.classList.add('fade')
    loader.classList.remove('pause')
  })

  const sections = q('section', site)

  const setGhostHeight = () => {
    const { height } = site.getBoundingClientRect()
    ghost.style.height = `${height}px`
    siteHeight = height
  }
  const resizeObserver = new ResizeObserver(() => {
    setGhostHeight()
  })
  setGhostHeight()
  resizeObserver.observe(site)

  function animateButton(text) {
    if (fakeButton.children[0].textContent === text) {
      return
    }
    centerButtonText.style.opacity = 0
    fakeButton.children[0].textContent = text
    const newWidth = fakeButton.getBoundingClientRect().width
    centerButton.style.width = `${newWidth}px`
    setTimeout(() => {
      console.log('set', text)
      centerButtonText.textContent = text
      centerButtonText.style.opacity = 1
    }, 200)
  }

  function start() {
    const spacerTop = create('div', { class: 'spacer' })
    const spacerBottom = spacerTop.cloneNode(true)
    site.appendChild(spacerBottom)
    site.prepend(spacerTop)
    if (fakeScroll) {
      site.before(ghost)
    } else {
      style(site, {
        position: 'relative',
      })
    }
    setGhostHeight()
    scrollTo(0, innerHeight + 100)
    if (fakeScroll) {
      site.style.transform = `translateY(${-(innerHeight + 100)}px)`
    }
    buttons.classList.add('transition')
    requestAnimationFrame(() => {
      buttons.classList.add('show')
      requestAnimationFrame(() => {
        style(centerButton, {
          width: `${centerButton.getBoundingClientRect().width}px`,
          transitionDelay: '0s',
        })
      })
    })

    if (!fakeScroll) {
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5,
      }

      let mostVisibleSection = null

      const observerCallback = (entries) => {
        entries.forEach((entry) => {
          const section = entry.target
          if (entry.isIntersecting) {
            const title = section.dataset.title
            if (
              !mostVisibleSection ||
              mostVisibleSection.section !== section ||
              entry.intersectionRatio > mostVisibleSection.intersectionRatio
            ) {
              mostVisibleSection = {
                section,
                intersectionRatio: entry.intersectionRatio,
              }
              animateButton(title || sections[0].dataset.title)
            }
          }
        })
      }

      const observer = new IntersectionObserver(
        observerCallback,
        observerOptions
      )
      sections.forEach((section) => observer.observe(section))
      const scrollHandler = () => {
        if (scrollY < 100) {
          scrollTo(0, siteHeight - innerHeight - 100)
        } else if (scrollY > siteHeight - innerHeight - 100) {
          scrollTo(0, 100)
        }
      }

      addEventListener('scroll', scrollHandler)
    } else {
      const scroller = onScroll(
        (y) => {
          let nextY
          if (y < 100) {
            nextY = siteHeight - innerHeight - 100
          } else if (y > siteHeight - innerHeight - 100) {
            nextY = 100
          }
          if (nextY !== undefined) {
            scroller.scrollTo(nextY)
            scrollTo(0, nextY)
          }
          const pos = nextY || y
          const roundedPos = Math.round(pos * 10) / 10
          site.style.transform = `translateY(${-roundedPos}px)`
          let mostVisibleSection = null
          let maxVisibility = 0

          sections.forEach((section) => {
            const visibleHeight = Math.max(
              0,
              Math.min(
                pos + innerHeight,
                section.offsetTop + section.offsetHeight
              ) - Math.max(pos, section.offsetTop)
            )
            if (visibleHeight > maxVisibility) {
              maxVisibility = visibleHeight
              mostVisibleSection = section
            }
            section.classList.remove('active')
          })

          if (mostVisibleSection) {
            const title = mostVisibleSection.dataset.title
            animateButton(title || sections[0].dataset.title)
          }
        },
        {
          smoothness: 4,
        }
      )
      destroyers.push(scroller.destroy)
    }

    const scrollFrame = () => {
      let then = Date.now()
      let factor = 0
      animate({
        duration: 1600,
        onFrame: (n) => {
          factor = n
        },
      })
      ;(function loop() {
        const now = Date.now()
        const nextY = scrollY + ((now - then) / 12) * factor
        scrollTo(0, nextY)
        then = now
        requestAnimationFrame(loop)
      })()
    }
    setTimeout(scrollFrame, 600)
  }

  return () => {
    destroyers.forEach((destroy) => destroy())
  }
}
