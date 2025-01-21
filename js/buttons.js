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

export default function buttons(app, getActiveSection) {
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

  let timer = null

  const descriptionState = state(null, (nextState, prevState) => {
    if (!nextState?.content && prevState) {
      descriptionText.innerHTML = ''
      fakeDescription.children[0].innerHTML = ''
      description.style.height = '0px'
      descriptionText.style.opacity = 0
      container.parentNode.style.transform = ''
    } else {
      descriptionText.style.opacity = 0
      fakeDescription.children[0].innerHTML = nextState.content
      const newHeight = fakeDescription.getBoundingClientRect().height
      description.style.height = `${newHeight}px`
      clearTimeout(timer)
      timer = setTimeout(() => {
        descriptionText.innerHTML = nextState.content
        descriptionText.style.opacity = 1
      }, 200)
    }
    resizeDescription()
  })

  const centerButtonState = state('', (nextState) => {
    if (fakeButton.children[0].textContent === nextState) {
      return
    }
    centerButtonText.style.opacity = 0
    fakeButton.children[0].textContent = nextState
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

  function resizeDescription() {
    const width = `${container.getBoundingClientRect().width}px`
    const height = descriptionState.value?.content
      ? fakeDescription.getBoundingClientRect().height
      : 0
    fakeDescription.style.width = width
    if (descriptionState.value?.content) {
      container.parentNode.style.transform = `translate3d(-50%, ${
        height / -2
      }px, 0)`
    }
    style(description, { width, height })
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
      const [desc] = q('.description', activeSection)
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
