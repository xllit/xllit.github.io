// 功能
$(document).ready(function () {
  var chatBtn = $('#chatBtn')
  var chatInput = $('#chatInput')
  var chatWindow = $('#chatWindow')

  // 输入框获取焦点
  chatInput.focus()

  // 存储对话信息,实现连续对话
  var messages = []

  // 检查返回的信息是否是正确信息
  var resFlag = true

  // 创建自定义渲染器
  const renderer = new marked.Renderer()

  // 重写list方法
  renderer.list = function (body, ordered, start) {
    const type = ordered ? 'ol' : 'ul'
    const startAttr = (ordered && start) ? ` start="${start}"` : ''
    return `<${type}${startAttr}>\n${body}</${type}>\n`
  }

  // 设置marked选项
  marked.setOptions({
    renderer: renderer,
    highlight: function (code, language) {
      const validLanguage = hljs.getLanguage(language) ? language : 'javascript'
      return hljs.highlight(code, { language: validLanguage }).value
    }
  })


  // 转义html代码(对应字符转移为html实体)，防止在浏览器渲染
  function escapeHtml(html) {
    let text = document.createTextNode(html)
    let div = document.createElement('div')
    div.appendChild(text)
    return div.innerHTML
  }

  // 添加请求消息到窗口
  function addRequestMessage(message) {
    chatInput.val('')
    let escapedMessage = escapeHtml(message)  // 对请求message进行转义，防止输入的是html而被浏览器渲染
    let requestMessageElement = $('<div class="row message-bubble"><img class="chat-icon" src="./static/images/avatar.png"><div class="message-text request">' + escapedMessage + '</div></div>')
    chatWindow.append(requestMessageElement)
    let responseMessageElement = $('<div class="row message-bubble"><img class="chat-icon" src="./static/images/chatgpt.png"><div class="message-text response"><span class="loading-icon"><i class="fa fa-spinner fa-pulse fa-2x"></i></span></div></div>')
    chatWindow.append(responseMessageElement)
    chatWindow.scrollTop(chatWindow.prop('scrollHeight'))
  }

  // 添加响应消息到窗口,流式响应此方法会执行多次
  function addResponseMessage(message) {
    let lastResponseElement = $(".message-bubble .response").last()
    lastResponseElement.empty()
    let escapedMessage
    // 处理流式消息中的代码块
    let codeMarkCount = 0
    let index = message.indexOf('```')
    while (index !== -1) {
      codeMarkCount++
      index = message.indexOf('```', index + 3)
    }
    if (codeMarkCount % 2 == 1) {  // 有未闭合的 code
      escapedMessage = marked.parse(message + '\n\n```')
    } else if (codeMarkCount % 2 == 0 && codeMarkCount != 0) {
      escapedMessage = marked.parse(message)  // 响应消息markdown实时转换为html
    } else if (codeMarkCount == 0) {  // 输出的代码有可能不是markdown格式，所以只要没有markdown代码块的内容，都用escapeHtml处理后再转换
      escapedMessage = marked.parse(escapeHtml(message))
    }
    lastResponseElement.append(escapedMessage)
    chatWindow.scrollTop(chatWindow.prop('scrollHeight'))
  }

  // 添加失败信息到窗口
  function addFailMessage(message) {
    let lastResponseElement = $(".message-bubble .response").last()
    lastResponseElement.empty()
    lastResponseElement.append('<p class="error">' + message + '</p>')
    chatWindow.scrollTop(chatWindow.prop('scrollHeight'))
    messages.pop() // 失败就让用户输入信息从数组删除
  }

  var controller = null

  // 发送请求获得响应
  async function sendRequest(data) {
    controller = new AbortController()
    const response = await fetch(`${config.url}/v1/chat/completions`, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + data.apiKey,
        'x-api2d-no-cache': 1
      },
      body: JSON.stringify({
        "messages": data.prompts,
        "model": "gpt-3.5-turbo",
        // "max_tokens": 4000, // 携带该参数后会出现一些莫名其妙的错误
        "temperature": 1,
        "stream": true
      })
    })

    const reader = response.body.getReader()
    let res = ''
    let str
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        chatBtn.text("发送信息")
        break
      }
      str = ''
      res += new TextDecoder().decode(value).replace(/^data: /gm, '').replace("[DONE]", '')
      const lines = res.trim().split(/[\n]+(?=\{)/)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        let jsonObj
        try {
          jsonObj = JSON.parse(line)
        } catch (e) {
          break
        }
        if (jsonObj.choices && jsonObj.choices[0].delta.content) {
          str += jsonObj.choices[0].delta.content
          addResponseMessage(str)
          resFlag = true
        } else {
          if (jsonObj.error) {
            addFailMessage(jsonObj.error.type + " : " + jsonObj.error.message + jsonObj.error.code)
            resFlag = false
          }
        }
      }
    }
    return str
  }

  // 处理用户输入
  chatBtn.click(function () {
    // 判断用户是否输入了内容
    if (chatInput.val().trim() == "" && $(this).text() == '发送信息')
      return (chatInput.val(""))

    if ($(this).text() == '发送信息') {
      // 更改按钮状态
      $(this).text("停止接收")
      $(this).blur()
    } else {
      $(this).text("发送信息")
      $(this).blur()
      return controller.abort()
    }
    // 保存api key与对话数据
    let data
    if (config.apiKey !== '') {
      data = { "apiKey": atob(config.apiKey) }
    } else {
      data = { "apiKey": "" }
    }

    let apiKey = localStorage.getItem('apiKey')
    if (apiKey) {
      data.apiKey = apiKey
    }

    let message = chatInput.val()

    addRequestMessage(message)
    // 将用户消息保存到数组
    messages.push({ "role": "user", "content": message })
    // 存放消息记录
    data.prompts = []
    // 判读是否已开启连续对话
    if (localStorage.getItem('continuousDialogue') == 'true') {
      // 统计用户发送的信息和预设信息的文本长度，该长度不超过 3000
      let wordSize = message.length
      // 添加历史消息
      for (let i = messages.length - 1; i >= 0; i--) {
        // 总长度大于4000（此处取3000，为预设预留了1000的长度），则放弃继续添加历史信息，因为超过4000后的请求会被chatgpt拒绝
        if ((wordSize += messages[i].content.length) >= 3000) break
        // 添加到历史记录列表，等待发送给chatgpt
        data.prompts.unshift(messages[i])
      }
    } else {
      data.prompts.push(messages[messages.length - 1])
    }
    // 获取预设
    const proContent = localStorage.prompt || ''
    // 预设不为空则添加预设
    if (proContent != "")
      data.prompts.unshift({ "role": "user", "content": proContent })
    // 发送请求
    sendRequest(data).then((res) => {
      chatInput.val('')
      // 判断是否是回复正确信息
      if (resFlag) {
        messages.push({ "role": "assistant", "content": res })
        // 判断是否本地存储历史会话
        if (localStorage.getItem('archiveSession') == "true") {
          localStorage.setItem("session", JSON.stringify(messages))
        }
      }
      // 添加复制
      copy()
    })
  })

  // Enter键盘事件
  function handleEnter(e) {
    if (e.keyCode == 13 && e.ctrlKey) {
      chatBtn.click()
    }
  }

  // 绑定Enter键盘事件
  chatInput.on("keydown", handleEnter)


  // 设置栏宽度自适应
  let width = $('.function .others').width()
  $('.function .settings .dropdown-menu').css('width', width)

  $(window).resize(function () {
    width = $('.function .others').width()
    $('.function .settings .dropdown-menu').css('width', width)
  })

  // 主题
  function setBgColor(theme) {
    $(':root').attr('bg-theme', theme)
    $('.settings-common .theme').val(theme)
    // 定位在文档外的元素也同步主题色
    $('.settings-common').css('background-color', 'var(--bg-color)')
  }

  let theme = localStorage.getItem('theme')
  // 如果之前选择了主题，则将其应用到网站中
  if (theme) {
    setBgColor(theme)
  } else {
    localStorage.setItem('theme', "light") //默认的主题
    theme = localStorage.getItem('theme')
    setBgColor(theme)
  }

  // 监听主题选择的变化
  $('.settings-common .theme').change(function () {
    const selectedTheme = $(this).val()
    localStorage.setItem('theme', selectedTheme)
    $(':root').attr('bg-theme', selectedTheme)
  })

  // apiKey
  const apiKey = localStorage.getItem('apiKey')
  if (apiKey) {
    $(".settings-common .api-key").val(apiKey)
  }

  // apiKey输入框事件
  $(".settings-common .api-key").blur(function () {
    const apiKey = $(this).val()
    if (apiKey.length != 0) {
      localStorage.setItem('apiKey', apiKey)
    } else {
      localStorage.removeItem('apiKey')
    }
  })

  // 预设文本
  const promptName = localStorage.getItem('promptName')

  if (promptName) {
    $('#role-name').text(promptName)
  }

  // 预设文本输入框事件
  $(".settings-common .prompt").blur(function () {
    const prompt = $(this).val().trim()
    if (prompt != "") {
      localStorage.setItem('prompt', prompt)
    } else {
      localStorage.removeItem('prompt')
    }
  })

  // 请求接口地址
  const baseurl = localStorage.getItem('baseurl')

  if (baseurl) {
    $(".settings-common .baseurl").val(baseurl)
    config.url = baseurl
  }

  // 请求接口地址输入框事件
  $(".settings-common .baseurl").blur(function () {
    const baseurl = $(this).val().trim()

    if (baseurl != "") {
      localStorage.setItem('baseurl', baseurl)
      config.url = baseurl
    } else {
      localStorage.removeItem('baseurl')
      config.url = 'https://api.openai.com'
    }
  })

  // 是否保存历史对话
  var archiveSession = localStorage.getItem('archiveSession')

  // 初始化archiveSession
  if (archiveSession == null) {
    archiveSession = "false"
    localStorage.setItem('archiveSession', archiveSession)
  }

  if (archiveSession == "true") {
    $("#chck-1").prop("checked", true)
  } else {
    $("#chck-1").prop("checked", false)
  }

  $('#chck-1').click(function () {
    if ($(this).prop('checked')) {
      // 开启状态的操作
      localStorage.setItem('archiveSession', true)
      if (messages.length != 0) {
        localStorage.setItem("session", JSON.stringify(messages))
      }
    } else {
      // 关闭状态的操作
      localStorage.setItem('archiveSession', false)
      localStorage.removeItem("session")
    }
  })

  // 加载历史保存会话
  if (archiveSession == "true") {
    const messagesList = JSON.parse(localStorage.getItem("session"))
    if (messagesList) {
      messages = messagesList
      $.each(messages, function (index, item) {
        if (item.role === 'user') {
          addRequestMessage(item.content)
        } else if (item.role === 'assistant') {
          addResponseMessage(item.content)
        }
      })
      // 添加复制
      copy()
    }
  }

  // 是否连续对话
  var continuousDialogue = localStorage.getItem('continuousDialogue')

  // 初始化continuousDialogue
  if (continuousDialogue == null) {
    continuousDialogue = "true"
    localStorage.setItem('continuousDialogue', continuousDialogue)
  }

  if (continuousDialogue == "true") {
    $("#chck-2").prop("checked", true)
  } else {
    $("#chck-2").prop("checked", false)
  }

  $('#chck-2').click(function () {
    if ($(this).prop('checked')) {
      localStorage.setItem('continuousDialogue', true)
    } else {
      localStorage.setItem('continuousDialogue', false)
    }
  })

  // 删除功能
  $(".delete a").click(function () {
    chatWindow.empty()
    $(".answer .tips").css({ "display": "flex" })
    messages = []
    localStorage.removeItem("session")
  })

  // 截图功能
  $(".screenshot a").click(function () {
    // 创建副本元素
    const clonedChatWindow = chatWindow.clone()
    clonedChatWindow.css({
      position: "absolute",
      left: "-9999px",
      overflow: "visible",
      width: chatWindow.width(),
      height: "auto"
    })
    $("body").append(clonedChatWindow)
    // 截图
    html2canvas(clonedChatWindow[0], {
      allowTaint: false,
      useCORS: true,
      scrollY: 0,
    }).then(function (canvas) {
      // 将 canvas 转换成图片
      const imgData = canvas.toDataURL('image/png')
      // 创建下载链接
      const link = document.createElement('a')
      link.download = "screenshot_" + Math.floor(Date.now() / 1000) + ".png"
      link.href = imgData
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      clonedChatWindow.remove()
    })
  })

  // 复制代码功能
  function copy() {
    $('pre').each(function () {
      let btn = $('<button class="copy-btn">复制</button>')
      $(this).append(btn)
      btn.hide()
    })

    $('pre').hover(
      function () {
        $(this).find('.copy-btn').show()
      },
      function () {
        $(this).find('.copy-btn').hide()
      }
    )

    $('pre').on('click', '.copy-btn', function () {
      let text = $(this).siblings('code').text()
      // 创建一个临时的 textarea 元素
      let textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)

      // 选择 textarea 中的文本
      textArea.select()

      // 执行复制命令
      try {
        document.execCommand('copy')
        $(this).text('复制成功')
      } catch (e) {
        $(this).text('复制失败')
      }

      // 从文档中删除临时的 textarea 元素
      document.body.removeChild(textArea)

      setTimeout(() => {
        $(this).text('复制')
      }, 2000)
    })
  }

  var prompts = []

  // 初始化提示词库
  if (localStorage.prompts) {
    prompts = JSON.parse(localStorage.prompts)
  } else {
    fetch('./static/prompts.json')
      .then(res => res.json())
      .then(data => {
        let i = 100000
        data.forEach(item => {
          prompts.push({ id: i++, ...item })
        })
      })
  }

  $('.center').click(function () {
    let rolesHtml = ''
    prompts.forEach(item => {
      rolesHtml += `<div data-id="${item.id}" data-toggle="tooltip" title="${item.prompt}">${item.act}</div>`
    })

    $('.modal-body-list').html(rolesHtml)

    $('#myModal').toggleClass('in').show()

    $('.modal-body-list >div').on('click', function () {
      const id = $(this).data('id')
      const index = prompts.findIndex(item => item.id == id)
      const item = prompts[index]
      localStorage.prompt = item.prompt
      localStorage.promptName = item.act
      // 更改文本
      $('#role-name').text(item.act)
      // 将本次选择的提到最前面
      prompts.splice(index, 1)
      prompts.unshift(item)
      $('#myModal').click()
    })
  })

  $('#myModal').click(function () {
    $('#myModal').toggleClass('in').hide()
  })

  $('.user-modall>button').click(function () {
    localStorage.prompt = $('#customPrompt').val().trim()
    localStorage.promptName = '自定义预设'
    $('#role-name').text('自定义预设')
    $('#myModal').toggleClass('in').hide()
  })

  // 禁用右键菜单
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault()  // 阻止默认事件
  })
})