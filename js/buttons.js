import { q, create, style } from '@/js/utils/dom'
import animate from '@/js/utils/animate'
import state from '@/js/utils/state'
import { isMobile } from './pages/home'

const SoundOn = `
<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      stroke="#fff"
      d="M14.5 3.9704v12.0592l-4.924-3.5095-.1303-.0928H5.5V7.5727h3.9457l.1302-.0928L14.5 3.9704Z"
    />
  </svg>`

const SoundOff = `
<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      stroke="#fff"
      d="M4.5 3.5 19 15M14.5 3.9704v12.0592l-4.924-3.5095-.1303-.0928H5.5V7.5727h3.9457l.1302-.0928L14.5 3.9704Z"
    />
  </svg>`

export default async function buttons(app, getActiveSection) {
  const [container] = q('.buttons', app)

  const [infoButton, centerButton] = q('button', container)
  const soundButton = create('button', { class: 'sound' }, container)
  const centerButtonText = centerButton.children[0]
  const fakeButton = centerButton.cloneNode(true)

  style(fakeButton, {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
  })
  container.appendChild(fakeButton)

  const description = container.nextElementSibling
  const descriptionText = description.children[0]
  const fakeDescription = description.cloneNode(true)

  style(fakeDescription, {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
    overflow: 'visible',
    height: 'auto',
    transition: 'none',
  })

  let timer = null

  const bar = container.parentElement

  const descriptionStateHandler = (nextState, prevState) => {
    if (!nextState?.content && prevState) {
      descriptionText.innerHTML = ''
      fakeDescription.children[0].innerHTML = ''
      description.style.height = '0px'
      descriptionText.style.opacity = 0
      bar.style.transform = `translate3d(0, 0, 0)`
      // container.parentNode.style.transform = ''
    } else {
      requestAnimationFrame(() => {
        descriptionText.style.transitionDuration = '0.1s'
        descriptionText.style.opacity = 0
        fakeDescription.children[0].innerHTML = nextState.content
        const newHeight = fakeDescription.getBoundingClientRect().height
        description.style.height = `${newHeight}px`
        bar.style.transform = `translate3d(0, ${newHeight / -2}px, 0)`
        clearTimeout(timer)
        timer = setTimeout(() => {
          descriptionText.style.transitionDuration = '0.4s'
          descriptionText.innerHTML = nextState.content
          descriptionText.style.opacity = 1
        }, 400)
      })
    }
  }

  const descriptionState = state(null, descriptionStateHandler)

  const setWidth = () => {
    let totalWidth = 0
    for (const button of container.children) {
      if (!button.isEqualNode(centerButton)) {
        totalWidth += button.offsetWidth + 4
      }
    }
    totalWidth -= 4
    fakeDescription.style.width = `${totalWidth}px`
    description.style.width = `${totalWidth}px`
    bar.style.left = innerWidth / 2 - totalWidth / 2 + 'px'
  }

  const centerButtonState = state('', (nextState) => {
    if (fakeButton.children[0].textContent === nextState) {
      return
    }
    centerButtonText.style.opacity = 0
    fakeButton.children[0].textContent = nextState
    setWidth()
    const newWidth = fakeButton.getBoundingClientRect().width
    centerButton.style.width = `${newWidth}px`
    setTimeout(() => {
      centerButtonText.textContent = nextState
      centerButtonText.style.opacity = 1
    }, 200)
  })

  infoButton.addEventListener('click', () => {
    if (descriptionState.value?.type === 'info') {
      descriptionState.set(null)
    } else {
      descriptionState.set({
        type: 'info',
        content:
          '<h2>About CPHFW</h2><p>With a nod to its Scandinavian heritage, Samsøe Samsøe is defined by a wearable aesthetic that combines the utilitarian ease of Copenhagen street style with a quintessentially Scandinavian spirit. Collections transcend trends, drawing on Denmark’s renowned design tradition to result in minimalist, affordable and accessible fashion.</p>',
      })
    }
  })

  const [audio] = q('audio source', app)
  const src = audio.getAttribute('src')

  const music = new Audio(src)
  music.loop = true
  music.volume = 0

  try {
    await document.fonts.ready
    centerButton.style.width = `${centerButton.offsetWidth}px`
    setTimeout(() => {
      setWidth()
    }, 400)
  } catch (e) {
    console.warn('Fonts loaded event not fired', e)
  }

  const renderSoundButton = (nextState) => {
    soundButton.innerHTML = `<span>Sound: ${nextState ? 'On' : 'Off'} </span>${
      nextState ? SoundOn : SoundOff
    }`
    if (nextState) {
      music.play()
      if (!isMobile) {
        animate({
          duration: 400,
          onFrame: (n) => {
            music.volume = n
          },
        })
      }
    } else {
      if (isMobile) {
        music.pause()
      } else {
        animate({
          duration: 400,
          onFrame: (n) => {
            music.volume = 1 - n
          },
          onComplete: () => {
            music.pause()
          },
        })
      }
    }
  }

  const sound = state(false, renderSoundButton)

  soundButton.addEventListener('click', () => {
    sound.set(!sound.value)
  })

  renderSoundButton(false)

  let prevHeight = 0
  let prevWidth = 0

  function resizeDescription() {
    return
    const width = `${container.getBoundingClientRect().width}px`
    const height = descriptionState.value?.content
      ? fakeDescription.getBoundingClientRect().height
      : 0
    if (prevWidth !== width) {
      fakeDescription.style.width = width
    }
    if (prevHeight === height || prevWidth === width) {
      style(description, { width, height })
    }
    prevWidth = width
    prevHeight = height
  }

  const buttonsObserver = new ResizeObserver(resizeDescription)

  buttonsObserver.observe(container)

  container.after(description)
  container.after(fakeDescription)

  centerButton.addEventListener('click', () => {
    const activeSection = getActiveSection()
    if (activeSection.classList.contains('footer')) {
      open('https://samsoe.com')
      return
    }
    if (descriptionState.value?.type === 'description') {
      descriptionState.set(null)
    } else if (activeSection) {
      const [desc] = q('.section-description', activeSection)
      if (desc?.innerHTML) {
        descriptionState.set({
          type: 'description',
          content: desc.innerHTML,
        })
      }
    }
  })

  return {
    destroy: () => {
      buttonsObserver.disconnect()
    },
    centerButtonState,
    descriptionState,
    container,
  }
}
