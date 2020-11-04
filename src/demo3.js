const wrap = document.querySelector('.keyWrap')

const ctx = new AudioContext()

const arrFrequency = [
  262, 294, 330, 349, 392, 440, 494,
  523, 587, 659, 698, 784, 880, 988,
  1047, 1175, 1318, 1397, 1568, 1760, 1976
]
const inner = [
  '1(低)', '2(低)', '3(低)', '4(低)', '5(低)', '6(低)', '7(低)',
  '1(中)', '2(中)', '3(中)', '4(中)', '5(中)', '6(中)', '7(中)',
  '1(高)', '2(高)', '3(高)', '4(高)', '5(高)', '6(高)', '7(高)'
]

const keyCodeList = [
  81, 87, 69, 82, 84, 89, 85,
  65, 83, 68, 70, 71, 72, 74,
  90, 88, 67, 86, 66, 78, 77
]

const keyNameList = [
  'Q', 'W', 'E', 'R', 'T', 'Y', 'U',
  'A', 'S', 'D', 'F', 'G', 'H', 'J',
  'Z', 'X', 'C', 'V', 'B', 'N', 'M'
]

const createMusic = (index) => {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  oscillator.frequency.value = arrFrequency[index]
  gainNode.gain.setValueAtTime(0, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01)
  oscillator.start(ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1)
  oscillator.stop(ctx.currentTime + 1)
}

const clickStyle = (dom) => {
  dom.classList.add('clicked')
  setTimeout(() => {
    dom.classList.remove('clicked')
  }, 300)
}

for (let i = 0; i < 21; i++) {
  const keyDom = document.createElement('div')
  const keyName = document.createElement('div')
  keyDom.classList.add('key')
  keyDom.classList.add('key' + i)
  keyDom.innerHTML = inner[i]
  keyName.classList.add('keyName')
  keyName.innerHTML = keyNameList[i]
  keyDom.appendChild(keyName)
  wrap.appendChild(keyDom)
}

document.onkeydown = (e) => {
  const index =  keyCodeList.indexOf(e.keyCode)
  if (index === -1) return false
  clickStyle(document.querySelector('.key' + index))
  createMusic(index)
}
