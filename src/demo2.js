
const zone = document.querySelector('.demo2-wrap')
const ctx = new AudioContext()
const destination = ctx.destination
let bufferSource = ctx.createBufferSource()
bufferSource.connect(destination)
let source
let isClicked = false

/* 增加dom和事件 */

const inputDom = document.createElement('div')
inputDom.innerText = '导入'
inputDom.classList.add('input')

const input = document.createElement('input')
input.setAttribute('multiple', 'false')
input.type = 'file'
input.accept = 'audio/*'

const playDom = document.createElement('div')
playDom.innerHTML = '播放'
playDom.classList.add('play')

const cutDom = document.createElement('div')
cutDom.innerHTML = '裁剪掉前半部分'
cutDom.classList.add('cut')

const title = document.createElement('div')
title.classList.add('title')

zone.appendChild(inputDom)
zone.appendChild(title)
zone.appendChild(playDom)
zone.appendChild(cutDom)

const width = parseInt(getComputedStyle(document.querySelector('.demo2-wrap')).width)

const canvas = document.createElement('canvas')
canvas.classList.add('canvas')
canvas.width = width
canvas.height = 400
zone.appendChild(canvas)

inputDom.addEventListener('click', () => {
  input.click()
})

const drawBuffer = (result) => {
  const dataArray = result.getChannelData(0)
  const totalLength = result.length
  const interval = 10000
  const bar_width = 1
  const bar_gap = 0 + bar_width
  const resultArray = []
  for (let i = 0; i < totalLength; i += interval) {
    const center = Math.abs(dataArray[i + (interval / 2)])
    resultArray.push(center * 100)
  }

  const canvas_ctx = canvas.getContext('2d')
  const c_width = canvas.width
  const c_height = canvas.height
  canvas_ctx.clearRect(0,0, c_width, c_height)
  canvas_ctx.fillStyle = 'orange'
  const len = resultArray.length
  let start = 0
  for (let i = 0; i < len; i++) {
    canvas_ctx.fillStyle = 'orange'
    canvas_ctx.fillRect(start, ~~(200 - resultArray[i]), bar_width, ~~resultArray[i] * 2)
    start += bar_gap
  }
}

const start = (arraybuffer) => {
  ctx.decodeAudioData(arraybuffer).then(result => {
    console.log(result)
    source = result
    bufferSource.buffer = result
    window.bufferSource = bufferSource
    drawBuffer(result)
  })
}

input.addEventListener('change', () => {
  if (input.files[0]) {
    title.innerHTML = input.value.substring(12)
    const _file = input.files[0]
    const reader = new FileReader()
    reader.readAsArrayBuffer(_file)
    reader.onload = (e) => {
      start(e.target.result)
    }
  }
})
playDom.addEventListener('click', () => {
  bufferSource.start()
})

cutDom.addEventListener('click', () => {
  const { sampleRate, length, numberOfChannels } = source
  const resultLength = ~~(length / 2)
  const resultBuffer = ctx.createBuffer(numberOfChannels, resultLength, sampleRate)

  for (let i = 0; i < numberOfChannels; i++) {
    const sourceData = source.getChannelData(i)
    const newData = resultBuffer.getChannelData(i)

    for (let k = 0; k < resultLength; k++) {
      newData[k] = sourceData[k + resultLength] || 0
    }

  }
  source = resultBuffer
  bufferSource.stop()
  bufferSource = ctx.createBufferSource()
  bufferSource.buffer = resultBuffer
  bufferSource.connect(destination)
  drawBuffer(resultBuffer)
  isClicked = false
})
