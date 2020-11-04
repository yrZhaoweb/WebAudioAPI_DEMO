
const zone = document.querySelector('.demo1-wrap')
const demo1create = document.querySelector('.demo1-create')
const ctx = new AudioContext()

/**
 * 1. 用AudioContext.decodeAudioData解析arraybuffer
 * 2. 创建分析节点 连接分析节点-数据源节点-输出节点
 * 3. 用requestanimationFrame+canvas实现音频可视化
 */
const start = (arraybuffer, canvas, playDom) => {
  ctx.decodeAudioData(arraybuffer).then(result => {
    const bufferSource = ctx.createBufferSource()
    
    // 得到数据并赋值给bufferSource
    bufferSource.buffer = result
    
    // 节点连接并播放
    bufferSource.connect(ctx.destination)
    
    // 提供实时信息的节点
    const analyser = ctx.createAnalyser()
    // analyser.connect(bufferSource)
    bufferSource.connect(analyser)

    let i, value, isStop, isEnd = false, animation_id = null
    // 设定结束回调
    bufferSource.onended = () => {
      isEnd = true
    }
    // 通过analyser获取频域长度并创建用来渲染的数组
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    const canvas_ctx = canvas.getContext('2d')
    const c_width = canvas.width
    const c_height = canvas.height

    // 条形的参数
    const bar_width = 10
    const bar_gap = 2
    const bar_part = bar_width + bar_gap
    const bar_num = Math.round(c_width / bar_part)

    // 线条高度
    const cap_height = 2

    // 每段包含的频谱宽
    const array_width = Math.round(bufferLength / bar_num)

    // 创建数组
    const array = []

    const drawVisual = function () {
      // 将当前频域数据拷贝进dataArray中
      analyser.getByteFrequencyData(dataArray)
      if (isEnd) {
        isStop = true
        for (i = dataArray.length - 1; i >= 0; i--) {
          dataArray[i] = 0
        }

        for (i = array.length - 1; i >= 0; i--) {
          isStop = isStop && (array[i] == 0)
        }
        
        if (isStop) {
          cancelAnimationFrame(animation_id)
          return
        }
      }

      canvas_ctx.clearRect(0,0,c_width,c_height)

      for(i = 0; i < bar_num; i++) {
        value = dataArray[i * array_width]
        if (array.length < bar_num) {
          array.push(value)
        }
        if (value < array[i]) {
          --array[i]
          canvas_ctx.fillRect(i * bar_part, c_height - array[i], bar_width, cap_height)
        } else {
          canvas_ctx.fillRect(i * 12, c_height - value, bar_width, cap_height)
          array[i] = value
        };
        canvas_ctx.fillStyle = 'orange'
        canvas_ctx.fillRect(bar_part * i, c_height - value, bar_width, value)
      }
      animation_id = requestAnimationFrame(drawVisual)
    }

    playDom.addEventListener('click', () => {
      bufferSource.start()
      animation_id = requestAnimationFrame(drawVisual)
    })

  })
}

/* 增加dom和事件 */
const addPlayZone = () => {
  const wrap = document.createElement('div')
  wrap.classList.add('wrap')

  const inputDom = document.createElement('div')
  inputDom.innerText = '导入'
  inputDom.classList.add('input')

  const playDom = document.createElement('div')
  playDom.innerText = '播放'
  playDom.classList.add('play')


  const input = document.createElement('input')
  input.setAttribute('multiple', 'false')
  input.type = 'file'
  input.accept = 'audio/*'

  const canvas = document.createElement('canvas')
  canvas.width = '800'
  canvas.height = '400'

  zone.appendChild(wrap)
  wrap.appendChild(inputDom)
  wrap.appendChild(playDom)
  wrap.appendChild(canvas)

  inputDom.addEventListener('click', () => {
    input.click()
  })
  input.addEventListener('change', () => {
    if (input.files[0]) {
      const _file = input.files[0]
      const reader = new FileReader()
      reader.readAsArrayBuffer(_file)
      reader.onload = (e) => {
        start(e.target.result, canvas, playDom)
      }
    }
  })
}

demo1create.addEventListener('click', addPlayZone)

