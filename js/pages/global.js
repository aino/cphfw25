import { onScroll } from '@/js/utils/scroll'
import { create, resize, id } from '@/js/utils/dom'

export const path = /.*/

export default function global(app) {
  const site = id('site')
  const destroyers = []
  const ghost = create('div')
  site.before(ghost)
  const setGhostHeight = () => {
    const { height } = site.getBoundingClientRect()
    ghost.style.height = `${height}px`
  }
  for (const img of site.querySelectorAll('img')) {
    img.onload = setGhostHeight
  }
  destroyers.push(resize(setGhostHeight))
  onScroll(
    (y) => {
      site.style.transform = `translateY(${-y}px)`
    },
    {
      smoothness: 4,
    }
  )
  let then = Date.now()
  const scroller = () => {
    const now = Date.now()
    const nextY = scrollY + (now - then) / 18
    scrollTo(0, nextY)
    then = now
    requestAnimationFrame(scroller)
  }
  requestAnimationFrame(scroller)
  return () => {
    destroyers.forEach((destroy) => destroy())
  }
}
