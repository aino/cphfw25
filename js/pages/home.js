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
import EmblaCarousel from 'embla-carousel'

import '@/styles/pages/home.css'

const AUTOSCROLL_TIMEOUT = 5000

const isTouch = 'ontouchstart' in window
const isMobile = innerWidth < 600 && isTouch

const isChrome =
  /Chrome\/[\d.]+/.test(navigator.userAgent) &&
  !/Edg|OPR|Brave/.test(navigator.userAgent)

const fakeScroll = false // isTouch && isChrome

export const path = /^\/$/

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function home(app) {
  const site = id('site')
  const destroyers = []
  const ghost = create('div')
  const sections = q('section', site)
  const hero = sections[0]
  const [buttons] = q('.buttons', app)
  const autoscroll = state(false)
  let infoIsOpen = false
  let descriptionIsOpen = false

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
  `
  )
  site.prepend(loader)
  const progress = create('div', { class: 'progress' }, loader)
  const fader = create('div', { class: 'fader' }, site)
  const [video] = q('video', hero)
  const [infoButton, centerButton, soundButton] = q('button', buttons)

  infoButton.addEventListener('click', () => {
    // if (fakeScroll) {
    //   scrollTo(0, innerHeight + 100)
    // } else {
    //   smoothScroll({
    //     to: innerHeight + 100,
    //     duration: 500,
    //   })
    // }
    infoIsOpen = !infoIsOpen
    if (infoIsOpen) {
      openDescription(
        '<h2>About CPHFW</h2><p>With a nod to its Scandinavian heritage, Samsøe Samsøe is defined by a wearable aesthetic that combines the utilitarian ease of Copenhagen street style with a quintessentially Scandinavian spirit. Collections transcend trends, drawing on Denmark’s renowned design tradition to result in minimalist, affordable and accessible fashion.</p>'
      )
    } else {
      closeDescription()
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
      fader.classList.add('out')
      loader.classList.add('fadeout')
      loader.classList.add('pause')
      start()
    },
  })

  const sideGalleries = q('.sidegallery', site)

  for (const images of q('.gallery .images', site)) {
    let i = 0
    for (const image of q('.image img', images)) {
      image.style.opacity = 0
      image.style.transitionDelay = `${i * 0.04}s`
      i++
    }
  }

  sideGalleries.forEach((sidegallery, i) => {
    sidegallery.dataset.direction = i % 2 === 1 ? 'left' : 'right'
    const [images] = q('.images', sidegallery)
    let gap = parseFloat(getStyle(images, 'gap'))
    const halfGap = Math.floor(gap / 2)
    let edge = 0
    if (isTouch) {
      ;(() => {
        sidegallery.style.overflowX = 'hidden'
        let x = 0
        let velX = sidegallery.dataset.direction == 'left' ? 0.05 : -0.05
        let touchX = null
        let touchY = null
        let then = Date.now()
        let direction = null
        const preventDefault = (e) => {
          e.preventDefault()
        }

        sidegallery.addEventListener('touchstart', (e) => {
          if (e.touches.length === 1) {
            touchX = e.touches[0].clientX
            touchY = e.touches[0].clientY
          }
        })

        sidegallery.addEventListener(
          'touchmove',
          (e) => {
            const now = Date.now()
            if (
              e.touches.length === 1 &&
              touchX !== null &&
              touchY !== null &&
              direction !== 'y'
            ) {
              const nextX = e.touches[0].clientX
              const nextY = e.touches[0].clientY
              const distanceX = nextX - touchX
              const duration = now - then
              if (!duration) {
                return
              }

              // Detect horizontal movement
              if (direction === null) {
                direction =
                  Math.abs(distanceX) > Math.abs(nextY - touchY) ? 'x' : 'y'
                if (direction === 'x') {
                  if (e.cancelable) {
                    e.preventDefault()
                  }
                  addEventListener('scroll', preventDefault)
                }
              }
              const nextVelX = distanceX / duration
              velX = (velX + nextVelX) / 2
              x += distanceX

              // Update positions
              touchX = nextX
              touchY = nextY
            }
            then = now
          },
          { passive: false } // Ensure preventDefault works
        )

        sidegallery.addEventListener('touchend', () => {
          touchX = null
          touchY = null
          direction = null
          removeEventListener('scroll', preventDefault)
        })
        let lt = Date.now()
        const l = () => {
          const now = Date.now()
          if (!touchX) {
            if (Math.abs(velX) > 0.05) {
              velX *= 0.95
            } else if (direction !== 'x') {
              const targetVelX =
                sidegallery.dataset.direction == 'left' ? 0.05 : -0.05
              velX += (targetVelX - velX) * 0.1
            }
            x += velX * (now - lt)
          }
          if (x <= (edge + halfGap) * -1) {
            x = (halfGap + 1) * -1
          } else if (x > halfGap) {
            x = (edge - halfGap - 1) * -1
          }
          sidegallery.children[0].style.transform = `translateX(${x}px)`
          lt = now
          requestAnimationFrame(l)
        }
        l()
      })()
    }
    for (const image of q('.image', images)) {
      edge += image.offsetWidth + gap
      images.appendChild(image.cloneNode(true))
    }
    const observer = new ResizeObserver(() => {
      edge = 0
      gap = parseFloat(getStyle(images, 'gap'))
      q('.image', images).forEach((image, i) => {
        if (i < images.children.length / 2) {
          edge += image.offsetWidth + gap
        }
      })
    })
    observer.observe(images)

    if (!isTouch) {
      sidegallery.scrollTo(halfGap + 1, 0)
      sidegallery.addEventListener('scroll', (e) => {
        const x = sidegallery.scrollLeft
        if (x >= edge + halfGap) {
          sidegallery.scrollTo(halfGap + 1, 0)
        } else if (x < halfGap) {
          sidegallery.scrollTo(edge + halfGap - 1, 0)
        }
      })
    }
  })

  const startSideGalleries = () => {
    if (!isTouch) {
      let then = Date.now()
      function loop() {
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
      }
      requestAnimationFrame(loop)
    }
  }
  startSideGalleries()

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
    if (!infoIsOpen) {
      // closeDescription()
    }
    centerButtonText.style.opacity = 0
    fakeButton.children[0].textContent = text
    const newWidth = fakeButton.getBoundingClientRect().width
    centerButton.style.width = `${newWidth}px`
    setTimeout(() => {
      centerButtonText.textContent = text
      centerButtonText.style.opacity = 1
    }, 200)
  }

  const description = create('div', { class: 'description' })
  const descriptionText = create(
    'div',
    { class: 'description-text' },
    description
  )
  const fakeDescription = description.cloneNode(true)
  style(fakeDescription, {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
    overflow: 'visible',
    height: 'auto',
  })

  const resizeDescription = () => {
    const width = `${buttons.getBoundingClientRect().width}px`
    const height = descriptionIsOpen
      ? fakeDescription.getBoundingClientRect().height
      : 0
    fakeDescription.style.width = width
    if (descriptionIsOpen) {
      buttons.parentNode.style.transform = `translate3d(-50%, ${
        height / -2
      }px, 0)`
    }
    style(description, { width, height })
  }

  const buttonsObserver = new ResizeObserver(resizeDescription)

  buttonsObserver.observe(buttons)

  buttons.after(description)
  buttons.after(fakeDescription)

  function openDescription(html) {
    if (!html) {
      closeDescription()
      return
    }
    description.style.height = '0px'
    descriptionText.style.opacity = 0
    fakeDescription.children[0].innerHTML = html
    const newHeight = fakeDescription.getBoundingClientRect().height
    if (descriptionIsOpen) {
      setTimeout(() => {
        descriptionIsOpen = true
        descriptionText.innerHTML = html
        descriptionText.style.opacity = 1
        description.style.height = `${newHeight}px`
      }, 300)
    } else {
      descriptionIsOpen = true
      descriptionText.innerHTML = html
      description.style.height = `${newHeight}px`
      setTimeout(() => {
        descriptionText.style.opacity = 1
      }, 400)
    }
    resizeDescription()
  }

  function closeDescription() {
    if (!descriptionIsOpen) {
      return
    }
    descriptionIsOpen = false
    description.style.height = '0px'
    descriptionText.style.opacity = 0
    buttons.parentNode.style.transform = ''
  }

  centerButton.addEventListener('click', () => {
    if (activeSection.classList.contains('footer')) {
      open('https://samsoe.com')
      return
    }
    if (descriptionIsOpen && !infoIsOpen) {
      closeDescription()
    } else {
      infoIsOpen = false
      if (activeSection) {
        const [desc] = q('.description', activeSection)
        if (desc) {
          openDescription(desc.innerHTML)
        }
      }
    }
  })

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
    const y = (isMobile ? screen.availHeight : innerHeight) + 100
    scrollTo(0, y)
    if (fakeScroll) {
      site.style.transform = `translateY(${-y}px)`
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
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    }

    const observerCallback = (entries) => {
      let closestSection = null
      let closestDistance = Infinity
      const screenCenter = innerHeight / 2

      entries.forEach((entry) => {
        console.log(entry.target, entry.isIntersecting)
        if (entry.isIntersecting) {
          entry.target.classList.add('inview')
          const rect = entry.target.getBoundingClientRect()
          const sectionCenter = rect.top + rect.height / 2
          const distanceToCenter = Math.abs(sectionCenter - screenCenter)

          if (distanceToCenter < closestDistance) {
            closestSection = entry.target
            closestDistance = distanceToCenter
          }
        }
      })

      if (closestSection && activeSection !== closestSection) {
        activeSection = closestSection
        let title = activeSection.dataset.title
        if (!title && activeSection.classList.contains('footer')) {
          title = 'Visit shop'
        }
        animateButton(title)

        if (descriptionIsOpen) {
          const [desc] = q('.description', activeSection)
          if (desc) {
            openDescription(desc.innerHTML)
          } else {
            closeDescription()
          }
        }
      }
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)
    sections.forEach((section) => observer.observe(section))
    const scrollHandler = () => {
      if (scrollY < 100) {
        scrollTo(0, siteHeight - innerHeight - 100)
      } else if (scrollY > siteHeight - innerHeight - 100) {
        scrollTo(0, 100)
      }
    }

    addEventListener('scroll', scrollHandler)

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
      if (!isTouch) {
        const activateScroll = () => {
          return
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
      }
    }
    setTimeout(scrollFrame, 600)
  }

  return () => {
    destroyers.forEach((destroy) => destroy())
  }
}
