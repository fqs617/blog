---
title: '基于d3.js的RN净值走势组件'
description: d3是一个动态可交互的数据可视化组件库，怎样在移动端引入d3并制作交互式的数据可视化组件~
banner: http://ow9iy2y8z.bkt.clouddn.com/pyramids-2371501_1280.jpg
date: '2020-05-05 21:01:40'
author: 1306503317@qq.com
---

## 简介

d3是一个js的数据可视化组件库，可以将数据转换为相关图形矢量渲染到Canvas、svg等标签中。

art是一套矢量图API，在react native层实现了大部分，一般的图表绘制已经足够用了。

## 场景案例

![](http://ow9iy2y8z.bkt.clouddn.com/WechatIMG177.jpeg)

支付宝的基金净值走势图是一个比较典型的交互图表，由于APP生成项目需要使用类似的组件，特别写了一个，组件主要由三部分组成

- 标题
- 图表
- 区间选择器

标题和区间选择用react native 基本组件直接实现即可，此处略去不表，本文主要说明图表部分的实现，图表部分主要分三层

- xy轴和虚点指示线
- 净值曲线
- 交互指示点和指示线

上述都与净值数据有关，样例数据如下：

```js
const values = [
    { date: '2018-05-21', value: 1.9988 },
    ...
    { date: '2018-04-20', value: 1.9164 },
]
```

取近一段（1个月）时间的开始时间、结束时间、中点时间作为x轴刻度

```js
import moment from 'moment'

const fmt = sameYear ? 'MM-DD' : 'YYYY-MM-DD'
const date = moment().subtract(1, 'day').toDate()
const mark = {
    end: moment(date).format(fmt),
    start: moment(date).subtract(1, 'month').format(fmt),
    middle: moment(date).subtract( (duration * ONE_MONTH) >> 1, 'second').format(fmt)
}
```

y轴坐标根据净值数据计算如下：

```
y·v ≥ max
-(4 - y)·v ≤ min
```

其中 y = [ 0, 1, 2, 3, 4 ]，v为间距，max为净值最大值向上取整，min为净值最小值向下取值

推理得出v应该取：

```
v = MAX[MIN[max / x], MIN[-min / (4 - x)]]
```

得到v后，y轴刻度即可获得，这样得出的刻度值是整数且范围区间适宜的

### 画图


首先引入相关组件，并link，具体参考[这篇](https://facebook.github.io/react-native/docs/linking-libraries-ios.html)

```sh
npm install art —-save
npm install d3 —-save
npm install d3-shape —-save
npm install d3-scale --save
```

y轴指示虚线通过上面计算得到的间距v和viewPortHeight可以算出相应的刻度值，通过ART直接画虚线指示线：

```js
const dashedLines = [
    Path().moveTo(x1, y1).lineTo(x2, y2),
    ...
]

const strokeDash = {
    strokeWidth: 1,
    strokeDash: [2.5, 2.5],
    stroke: '#eee'
}

render() {
    return <Surface width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Group>
        ...
		{
			dashedLines.map((d, i)=>{
				return <Shape
				key={`dash-line-${i}`}
				d={d}
				{...strokeDash}/>
			})
		}
		...
		</Group>
    </Surface>
}

```

坐标、刻度和指示线画好后，开始画净值曲线

```js
import * as scale from 'd3-scale'
import * as shape from 'd3-shape'

const d3 = {
  scale,
  shape,
}

// 曲线生成器
const generator = d3.shape.line()
// 根据净值数据生成曲线矢量
const brokenLine = generator(values)
```

上述一个基本的净值曲线矢量就做好了，但是却不能展示在art的Surface元素上，因为实际的Surface的坐标并没有和上述矢量发生关系，需要增加维度映射

```js
const yScale = d3.scale
		         .scaleLinear()
		         .domain([y[y.length - 1], y[0]])
		         .range([transform, CHART_HEIGHT - transform])

const xScale = d3.scale
                 .scaleTime()
                 .domain([
            	    moment(values[values.length - 1].date).toDate(),
            	    moment(values[0].date).toDate()
                 ])
                 .range([PADDING_H, CHART_WIDTH - PADDING_H])

// 曲线生成器
const generator = d3.shape.line()
				.x(d => { return xScale(moment(d.date).toDate()) })
				.y(d => { return yScale(parseFloat(d.value)) })
// 根据净值数据生成曲线矢量
const brokenLine = generator(values)

render() {
    return <Surface width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Group>
        ...
		{
			<Shape d={brokenLine} stroke={color.primary} strokeWidth={2}/>
		}
		...
		</Group>
    </Surface>
}

```

### Animated Shape

净值曲线基本画完了，但是还不带感，需要增加动效润色一下，可以通过Morph.Tween()来保存两次连续状态的矢量路径的Morph实例，再根据requestAnimationFrame变更state刷新Surface达到动态净值的效果，具体参考[这篇](https://hswolff.com/blog/react-native-art-and-d3/)

### 交互实现

当手点击净值时，我们期望能够展示当天净值和涨幅情况，如图所示：

![](http://ow9iy2y8z.bkt.clouddn.com/WechatIMG178.jpeg)

这里需要涉及另外一个知识点: [PanResponder](https://facebook.github.io/react-native/docs/panresponder.html)

```js
const responder = PanResponder.create({
  onStartShouldSetResponder: () => true,
	onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
	onMoveShouldSetPanResponder: () => true,
	onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
	onPanResponderGrant: (e, gestureState) => { },
	onPanResponderStart: (e, gestureState) => { },
	onPanResponderMove: (e, gestureState) => { },
	onPanResponderTerminate: (e, gestureState) => { },
	onPanResponderTerminationRequest: (event, gestureState) => true,
	onPanResponderRelease: (evt, gestureState) => { },
})

render() {
    return <View {...responder}></View>
}
```

获取到手势操作相关事件后，根据手势位置计算出最接近的净值坐标并画出指示线即可

```js
...
const arc = d3.shape.arc()
			  .innerRadius(0)
			  .outerRadius(4)
			  .startAngle(0)
			  .endAngle(Math.PI * 2)

// 指示器
const indicator = {
    indicator: generator([
    { date, value: this.yCoordinates[0]},
	{ date, value: this.yCoordinates[4]}]),
	dot: {
		path: arc(),
		pos: {
		    x: xScale(moment(date).toDate()),
			y: yScale(parseFloat(value))
		}
	},
	data
}
this.setState({indicator})
...
```

至此一个净值曲线基本完成了，上述属于伪代码和部分代码片段，实际整理变为公用组件还需要思考以下几点：

- 现有的功能是否完成相关范围的需求定义，是否考虑扩充功能
- method、props等的语义规范是否合理

上述如都已经明确，就可以发布组件了~



