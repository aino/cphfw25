import { onScroll } from '@/js/utils/scroll'
import { create, id, createFromString, q } from '@/js/utils/dom'
import animate from '@/js/utils/animate'

import '@/styles/pages/home.css'

export const path = /^\/$/

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function home(app) {
  const site = id('site')
  const destroyers = []
  const ghost = create('div')
  const [hero] = q('.hero')
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

  const progressAnimation = animate({
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

  const setGhostHeight = () => {
    const { height } = site.getBoundingClientRect()
    ghost.style.height = `${height}px`
  }
  const resizeObserver = new ResizeObserver(() => {
    setGhostHeight()
  })
  setGhostHeight()
  resizeObserver.observe(site)
  onScroll(
    (y) => {
      site.style.transform = `translateY(${-y}px)`
    },
    {
      smoothness: 4,
    }
  )

  function start() {
    site.before(ghost)
    let then = Date.now()
    const scroller = () => {
      const now = Date.now()
      const nextY = scrollY + (now - then) / 12
      scrollTo(0, nextY)
      then = now
      requestAnimationFrame(scroller)
    }
    requestAnimationFrame(scroller)
  }

  // setTimeout(start, 400)

  return () => {
    destroyers.forEach((destroy) => destroy())
  }
}
