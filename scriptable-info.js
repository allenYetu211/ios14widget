const _logger_level_ = [
  'warn',
  'error',
  'info',
  'debug',
  // 'verbo',
]

const logger = {
  log(level = 'info', ...args) {
    if (_logger_level_.includes(level)) {
      const fn = console[level] || console.log
      fn(`[${level.padStart(5, '     ')}] ` + args.map(this.stringify).join(' '))
    }
  },
  stringify(target) {
    if (target === null) {
      return '__null__'
    } else if (target === undefined) {
      return '__undefined__'
    } else if (typeof target === 'function') {
      return 'function:' + target.name
    } else if (typeof target === 'object') {
      return JSON.stringify(target)
    } else {
      return target.toString()
    }
  },
  warn(...args) {
    this.log('warn', ...args)
  },
  error(...args) {
    this.log('error', ...args)
  },
  info(...args) {
    this.log('info', ...args)
  },
  debug(...args) {
    this.log('debug', ...args)
  },
  verbose(...args) {
    this.log('verbo', ...args)
  },
}

const color = ['#6ef2ae', '#7dbbae', '#ffa7d3', '#ff9468', '#ffa7d3']


function getDateString(offset = 0) {
  const date = new Date(new Date().getTime() + offset * 60 * 60 * 24 * 1000)
  logger.info('data', date);
  const dateFormatter = new DateFormatter()
  dateFormatter.dateFormat = 'yyyy-MM-dd'
  const string = dateFormatter.string(date)
  return string
}

// https://tianqiapi.com/api?version=v6&appid=14647915&appsecret=jetFCY4x

// 还款时间
const repaymentDate = (widget) => {
  const repaymentMatch = (targetDate) => {
    const date = new Date().getDate();
    let text = '**';

    if (targetDate - date > 1) {
      text = targetDate - date;
    } else if (targetDate - date == 0) {
      text = '今天'
    } else if (targetDate - date == 1) {
      text = '明天'
    }

    return text;
  }

  const repayment = [
    {
      text: '京东',
      date: 20,
      timeLeft: repaymentMatch(20),
      color: '#6ef2ae'
    },
    {
      text: '花呗',
      date: 10,
      timeLeft: repaymentMatch(10),
      color: '#7dbbae'
    },
    {
      text: '基金',
      date: 10,
      timeLeft: repaymentMatch(10),
      color: '#ffa7d3'
    },
    {
      text: '招商',
      date: 19,
      timeLeft: repaymentMatch(19),
      color: '#ff9468'
    },
    {
      text: '家用补贴',
      date: 15,
      timeLeft: repaymentMatch(15),
      color: '#ffa7d3'
    },
  ]

  const result = repayment.reduce((accumulator, currentValue) => {
    if (accumulator.length === 0) {
      return `${currentValue.text}: ${currentValue.timeLeft}`
    } else {
      return `${accumulator} |  ${currentValue.text}: ${currentValue.timeLeft}`
    }
  }, '')

  const container = widget.addText(result);
  container.font = Font.mediumSystemFont(12)
  container.textColor = new Color(repayment[Math.floor(Math.random() * 4)].color);
}

//  城市天气 city ID ： https://www.cnblogs.com/oucbl/p/6155096.html
// 获取天气
const getWeather = async (widget) => {
  const url = 'http://tianqiapi.com/api?version=v6&appid=14647915&appsecret=jetFCY4x&city=010101';
  const request = new Request(url)
  const result = await request.loadJSON();

  if (!result) {
    widget.addText('[ ❌ ]数据获取失败');
  }

  [
    `天气: ${result.wea}`,
    `温度: ${result.tem2}℃ ~ ${result.tem1}℃ | 实时: ${result.tem}℃`,
    `空气质量: ${result.air_level}`,
    `风速: ${result.win} | ${result.win_speed} | ${result.win_meter}`,
    `湿度: ${result.humidity}`
  ].forEach((item) => {
    const i = widget.addText(item);
    i.textColor = new Color(color[Math.floor(Math.random() * 5)]);
    i.font = Font.heavySystemFont(12);
  })
}



// 渲染组件
const renderWidget = async () => {
  const widget = new ListWidget()

  // 标题
  const subtitle = widget.addText('🗓每月固定款项');
  widget.addText('');
  subtitle.textColor = new Color('#eeeeee');
  subtitle.font = Font.heavySystemFont(20);
  repaymentDate(widget);
  widget.addSpacer(3);
  widget.addText('');
  widget.addText('');

  // 天气
  const weatherTitle = widget.addText('🌬当日气候');
  widget.addText('');
  weatherTitle.textColor = new Color('#7dbbae');
  weatherTitle.font = Font.heavySystemFont(20);
  await getWeather(widget)
  widget.addText('');
  widget.addText('');
  // 时间
  const title = widget.addText(getDateString());
  // 间距控制，未找到API,暂时先使用addtext 代替
  title.textColor = new Color('#eeeeee');
  title.font = Font.heavySystemFont(25);
  title.rightAlignText()
  widget.addSpacer(5);

  const weekDay = widget.addText('周' + '日一二三四五六'.charAt(new Date().getDay()));
  weekDay.rightAlignText();
  title.font = Font.heavySystemFont(18);

  render(widget)
}

//  渲染处理
const render = (widget) => {
  Script.setWidget(widget)
  widget.presentLarge()
}


// 入口
(async () => {
  await renderWidget()
  Script.complete();
})()


