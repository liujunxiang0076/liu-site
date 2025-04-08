---
title: 探索轻量级日期处理库：Day.js的全面指南
tags: [笔记,工具库,JavaScript,前端开发]
categories: [技术分享]
date: 2024-12-13
description: Day.js是一个轻量级的JavaScript日期库，它提供了与Moment.js兼容的现代API，用于解析、验证、操作和显示日期及时间。它的核心库只关注日期时间的计算，不包含任何时间格式的解析或本地化功能，这使得Day.js在体积上非常小巧，同时保持了高性能。
articleGPT: 在JavaScript开发中，日期和时间的处理是一个常见但复杂的任务。传统的Date对象虽然提供了基本功能，但使用起来并不方便。Day.js作为一个轻量级的日期处理库，以其简洁的API和小巧的体积而著称，成为了开发者的新宠。本文将详细介绍Day.js的基本用法、高级功能和实际应用场景，帮助你在项目中高效地处理日期和时间。
cover: https://imgbed.liujunxiang0076.site/file/1734080694047_image.png
---

项目地址：[iamkun/dayjs: ⏰ Day.js 2kB immutable date-time library alternative to Moment.js with the same modern API](https://github.com/iamkun/dayjs)

## 一、Day.js简介

Day.js是一个轻量级的JavaScript日期库，它提供了与Moment.js兼容的现代API，用于解析、验证、操作和显示日期及时间。它的核心库只关注日期时间的计算，不包含任何时间格式的解析或本地化功能，这使得Day.js在体积上非常小巧，同时保持了高性能。

### Day.js的特点：

1. **轻量级**：Day.js的体积非常小，只有约2KB（压缩后），这使得它非常适合在性能敏感的项目中使用。
2. **无依赖**：Day.js不依赖于其他库或框架，可以独立使用。
3. **链式操作**：支持链式调用，使得日期操作更加流畅和简洁。
4. **国际化支持**：Day.js支持国际化，可以轻松地格式化日期为不同的语言和文化格式。
5. **插件系统**：Day.js支持插件，允许开发者扩展其功能，例如添加新的日期格式或功能。
6. **日期解析与验证**：可以解析多种格式的日期字符串，包括ISO 8601格式，并提供日期验证功能。
7. **日期操作**：支持日期的加减操作，例如添加天数、月份或年份。
8. **格式化**：提供灵活的日期格式化选项，可以自定义日期和时间的显示格式。
9. **比较和计算**：可以比较两个日期的大小，计算两个日期之间的差异。
10. **不可变性**：Day.js的日期对象是不可变的，每次操作都会返回一个新的日期对象，避免了副作用。

## 二、安装与配置

### 安装Day.js：

你可以通过npm、yarn或直接使用CDN的方式来安装Day.js：

```bash
# 使用npm安装
npm install dayjs

# 使用pnpm安装
pnpm install dayjs

# 使用yarn安装
yarn add dayjs
```

或者直接在HTML文件中引入CDN链接：

```html
<script src="https://unpkg.com/dayjs"></script>
```

### 在项目中使用：

#### 在Node.js环境中：

```javascript
const dayjs = require('dayjs');
```

#### 在ES模块环境中：

```javascript
import dayjs from 'dayjs';
```

#### 在浏览器环境中：

如果使用CDN引入，Day.js会自动注册为全局变量：

```javascript
const now = dayjs();
```

## 三、基本用法

### 创建日期对象：

使用Day.js创建日期对象非常简单，只需调用`dayjs()`函数：

```javascript
// 当前日期和时间
const now = dayjs();
console.log(now.toString());

// 指定日期和时间
const specificDate = dayjs('2023-07-27');
console.log(specificDate.toString());

// 使用Date对象创建
const dateObject = new Date();
const fromDateObject = dayjs(dateObject);
console.log(fromDateObject.toString());

// 使用时间戳创建
const timestamp = Date.now();
const fromTimestamp = dayjs(timestamp);
console.log(fromTimestamp.toString());

// 使用Unix时间戳（秒）创建
const unixTimestamp = Math.floor(Date.now() / 1000);
const fromUnixTimestamp = dayjs.unix(unixTimestamp);
console.log(fromUnixTimestamp.toString());
```

### 格式化日期：

Day.js提供了丰富的格式化功能，可以将日期对象转换为指定格式的字符串：

```javascript
const date = dayjs();

// 基本格式化
console.log(date.format('YYYY-MM-DD')); // 输出：2024-07-27
console.log(date.format('YYYY年MM月DD日')); // 输出：2024年07月27日
console.log(date.format('HH:mm:ss')); // 输出：当前时间的时分秒

// 星期格式化
console.log(date.format('dddd')); // 输出：星期几（如：Monday）
console.log(date.format('ddd')); // 输出：缩写的星期几（如：Mon）

// 月份格式化
console.log(date.format('MMMM')); // 输出：月份名称（如：January）
console.log(date.format('MMM')); // 输出：缩写的月份名称（如：Jan）

// 组合格式化
console.log(date.format('YYYY-MM-DD HH:mm:ss')); // 输出：2024-07-27 14:30:45
console.log(date.format('YYYY年MM月DD日 HH时mm分ss秒')); // 输出：2024年07月27日 14时30分45秒
```

### 解析日期字符串：

你可以使用Day.js解析各种格式的日期字符串：

```javascript
// 解析ISO 8601格式
const isoDate = dayjs('2024-07-27T14:30:45Z');
console.log(isoDate.toString());

// 解析自定义格式
const customDate1 = dayjs('2024-07-27', 'YYYY-MM-DD');
console.log(customDate1.toString());
const customDate2 = dayjs('27/07/2024', 'DD/MM/YYYY');
console.log(customDate2.toString());

// 解析相对日期
const yesterday = dayjs().subtract(1, 'day');
console.log(yesterday.toString());
const lastWeek = dayjs().subtract(1, 'week');
console.log(lastWeek.toString());
```

### 操作日期：

Day.js支持各种日期操作，例如加减日期、设置日期等：

```javascript
const date = dayjs();

// 添加时间
const nextWeek = date.add(7, 'day');
console.log(nextWeek.format('YYYY-MM-DD'));
const nextMonth = date.add(1, 'month');
console.log(nextMonth.format('YYYY-MM-DD'));
const nextYear = date.add(1, 'year');
console.log(nextYear.format('YYYY-MM-DD'));

// 减少时间
const lastWeek = date.subtract(7, 'day');
console.log(lastWeek.format('YYYY-MM-DD'));
const lastMonth = date.subtract(1, 'month');
console.log(lastMonth.format('YYYY-MM-DD'));
const lastYear = date.subtract(1, 'year');
console.log(lastYear.format('YYYY-MM-DD'));

// 设置日期
const setYear = date.set('year', 2025);
console.log(setYear.format('YYYY-MM-DD'));
const setMonth = date.set('month', 0); // 0表示一月
console.log(setMonth.format('YYYY-MM-DD'));
const setDay = date.set('day', 1);
console.log(setDay.format('YYYY-MM-DD'));

// 链式操作
const complexDate = date
  .add(1, 'year')
  .subtract(2, 'month')
  .add(3, 'day')
  .set('hour', 12)
  .set('minute', 30)
  .set('second', 0);
console.log(complexDate.format('YYYY-MM-DD HH:mm:ss'));
```

### 比较日期：

Day.js提供了日期比较的方法，可以方便地进行日期的比较操作：

```javascript
const date1 = dayjs('2024-07-27');
const date2 = dayjs('2024-08-01');
const date3 = dayjs('2024-07-27');

// 基本比较
console.log(date1.isBefore(date2)); // 输出：true
console.log(date1.isAfter(date2)); // 输出：false
console.log(date1.isSame(date2)); // 输出：false
console.log(date1.isSame(date3)); // 输出：true

// 指定单位的比较
console.log(date1.isSame(date2, 'year')); // 输出：true（同一年）
console.log(date1.isSame(date2, 'month')); // 输出：false（不同月）

// 范围比较
const date4 = dayjs('2024-07-25');
const date5 = dayjs('2024-07-29');
console.log(date1.isBetween(date4, date5)); // 输出：true
console.log(date1.isBetween(date5, date4)); // 输出：false

// 有效性检查
const invalidDate = dayjs('invalid');
console.log(invalidDate.isValid()); // 输出：false
console.log(date1.isValid()); // 输出：true
```

### 获取日期信息：

Day.js提供了多种方法获取日期的各个部分：

```javascript
const date = dayjs();

// 获取年份、月份、日期
console.log(date.year()); // 输出：当前年份
console.log(date.month()); // 输出：当前月份（0-11）
console.log(date.date()); // 输出：当前日期（1-31）

// 获取星期
console.log(date.day()); // 输出：当前星期（0-6，0表示星期日）
console.log(date.dayOfYear()); // 输出：当前是一年中的第几天

// 获取时间
console.log(date.hour()); // 输出：当前小时（0-23）
console.log(date.minute()); // 输出：当前分钟（0-59）
console.log(date.second()); // 输出：当前秒数（0-59）
console.log(date.millisecond()); // 输出：当前毫秒数（0-999）

// 获取时间戳
console.log(date.valueOf()); // 输出：毫秒时间戳
console.log(date.unix()); // 输出：秒时间戳

// 获取季度
console.log(date.quarter()); // 输出：当前季度（1-4）

// 获取周数
console.log(date.week()); // 输出：当前是一年中的第几周
```

## 四、高级功能

### 插件系统：

Day.js的插件系统是其强大功能的核心，通过插件可以扩展Day.js的功能。以下是使用插件的基本方法：

```javascript
// 引入插件
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const localizedFormat = require('dayjs/plugin/localizedFormat');
const relativeTime = require('dayjs/plugin/relativeTime');
const calendar = require('dayjs/plugin/calendar');
const duration = require('dayjs/plugin/duration');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

// 使用插件
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(calendar);
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);
```

### 常用插件介绍：

#### 1. isSameOrBefore/isSameOrAfter 插件

这些插件添加了`isSameOrBefore`和`isSameOrAfter`方法，用于比较日期：

```javascript
const date1 = dayjs('2024-07-27');
const date2 = dayjs('2024-08-01');

console.log(date1.isSameOrBefore(date2)); // 输出：true
console.log(date1.isSameOrAfter(date2)); // 输出：false
```

#### 2. customParseFormat 插件

这个插件允许使用自定义格式解析日期字符串：

```javascript
const date = dayjs('2024-07-27 14:30:45', 'YYYY-MM-DD HH:mm:ss');
console.log(date.format('YYYY年MM月DD日 HH时mm分ss秒')); // 输出：2024年07月27日 14时30分45秒
```

#### 3. localizedFormat 插件

这个插件提供了本地化的日期格式化功能：

```javascript
const date = dayjs();
console.log(date.format('L')); // 输出：本地化的日期格式
console.log(date.format('LL')); // 输出：本地化的长日期格式
console.log(date.format('LLL')); // 输出：本地化的日期和时间格式
console.log(date.format('LLLL')); // 输出：本地化的长日期和时间格式
```

#### 4. relativeTime 插件

这个插件添加了相对时间的功能，可以显示相对于当前时间的描述：

```javascript
const date1 = dayjs().subtract(1, 'day');
console.log(date1.fromNow()); // 输出：1天前

const date2 = dayjs().add(2, 'hour');
console.log(date2.fromNow()); // 输出：2小时后

const date3 = dayjs().subtract(1, 'month');
console.log(date3.fromNow()); // 输出：1个月前
```

#### 5. calendar 插件

这个插件提供了日历格式的日期显示：

```javascript
const date1 = dayjs().subtract(1, 'day');
console.log(date1.calendar()); // 输出：昨天 14:30

const date2 = dayjs().add(1, 'day');
console.log(date2.calendar()); // 输出：明天 14:30

const date3 = dayjs().add(3, 'day');
console.log(date3.calendar()); // 输出：下周一 14:30
```

#### 6. duration 插件

这个插件提供了时间持续时间的处理功能：

```javascript
const duration = dayjs.duration(2, 'days');
console.log(duration.hours()); // 输出：48
console.log(duration.minutes()); // 输出：2880
console.log(duration.seconds()); // 输出：172800

const duration2 = dayjs.duration(1, 'hour').add(30, 'minute');
console.log(duration2.asMinutes()); // 输出：90
console.log(duration2.asHours()); // 输出：1.5
```

#### 7. utc 插件

这个插件提供了UTC时间的处理功能：

```javascript
const utcDate = dayjs.utc();
console.log(utcDate.format()); // 输出：UTC时间

const localDate = utcDate.local();
console.log(localDate.format()); // 输出：本地时间
```

#### 8. timezone 插件

这个插件提供了时区的处理功能：

```javascript
const date = dayjs().tz('America/New_York');
console.log(date.format()); // 输出：纽约时间

const date2 = dayjs().tz('Asia/Tokyo');
console.log(date2.format()); // 输出：东京时间
```

### 国际化支持：

Day.js通过插件提供了国际化支持，可以轻松地处理不同语言和地区的日期格式：

```javascript
// 引入国际化插件
const localeData = require('dayjs/plugin/localeData');
dayjs.extend(localeData);

// 设置语言
dayjs.locale('zh-cn'); // 设置为中文

// 使用本地化格式
const date = dayjs();
console.log(date.format('LL')); // 输出：本地化的长日期格式

// 切换语言
dayjs.locale('en'); // 切换为英文
console.log(date.format('LL')); // 输出：英文的长日期格式
```

## 五、实际应用案例

### 1. 日期选择器

Day.js可以用于构建日期选择器，处理日期的选择和格式化：

```javascript
// 假设有一个日期选择器组件
function DatePicker({ value, onChange }) {
  const [selectedDate, setSelectedDate] = useState(value ? dayjs(value) : dayjs());
  
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    onChange(newDate.toDate());
  };
  
  return (
    <div className="date-picker">
      <div className="selected-date">
        {selectedDate.format('YYYY年MM月DD日')}
      </div>
      {/* 日期选择器的UI组件 */}
    </div>
  );
}
```

### 2. 倒计时功能

Day.js可以用于实现倒计时功能，计算剩余时间并更新显示：

```javascript
function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = dayjs();
      const target = dayjs(targetDate);
      const diff = target.diff(now);
      
      if (diff <= 0) {
        setTimeLeft('已结束');
        clearInterval(timer);
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${days}天${hours}小时${minutes}分钟${seconds}秒`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate]);
  
  return <div className="countdown">{timeLeft}</div>;
}
```

### 3. 日期范围选择

Day.js可以用于实现日期范围选择功能，处理开始日期和结束日期的选择：

```javascript
function DateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange }) {
  const [start, setStart] = useState(startDate ? dayjs(startDate) : null);
  const [end, setEnd] = useState(endDate ? dayjs(endDate) : null);
  
  const handleStartDateChange = (date) => {
    setStart(date);
    onStartDateChange(date.toDate());
    
    // 如果结束日期早于开始日期，则更新结束日期
    if (end && date.isAfter(end)) {
      setEnd(date);
      onEndDateChange(date.toDate());
    }
  };
  
  const handleEndDateChange = (date) => {
    setEnd(date);
    onEndDateChange(date.toDate());
    
    // 如果开始日期晚于结束日期，则更新开始日期
    if (start && date.isBefore(start)) {
      setStart(date);
      onStartDateChange(date.toDate());
    }
  };
  
  return (
    <div className="date-range-picker">
      <div className="start-date">
        {start ? start.format('YYYY-MM-DD') : '选择开始日期'}
      </div>
      <div className="end-date">
        {end ? end.format('YYYY-MM-DD') : '选择结束日期'}
      </div>
      {/* 日期选择器的UI组件 */}
    </div>
  );
}
```

### 4. 日历组件

Day.js可以用于构建日历组件，显示月份视图和日期选择：

```javascript
function Calendar({ selectedDate, onDateSelect }) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate ? dayjs(selectedDate) : dayjs());
  
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.startOf('month').day();
  
  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };
  
  const handleDateSelect = (day) => {
    const newDate = currentMonth.date(day);
    onDateSelect(newDate.toDate());
  };
  
  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={handlePrevMonth}>上个月</button>
        <div>{currentMonth.format('YYYY年MM月')}</div>
        <button onClick={handleNextMonth}>下个月</button>
      </div>
      <div className="calendar-body">
        {/* 星期标题 */}
        <div className="weekdays">
          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        {/* 日期网格 */}
        <div className="days">
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="day empty"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const date = currentMonth.date(day);
            const isSelected = selectedDate && dayjs(selectedDate).isSame(date, 'day');
            
            return (
              <div
                key={day}
                className={`day ${isSelected ? 'selected' : ''}`}
                onClick={() => handleDateSelect(day)}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

### 5. 时间轴组件

Day.js可以用于构建时间轴组件，显示事件的时间线：

```javascript
function Timeline({ events }) {
  // 假设events是一个包含日期和内容的数组
  const sortedEvents = [...events].sort((a, b) => {
    return dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
  });
  
  return (
    <div className="timeline">
      {sortedEvents.map((event, index) => {
        const date = dayjs(event.date);
        const isToday = date.isSame(dayjs(), 'day');
        const isPast = date.isBefore(dayjs(), 'day');
        
        return (
          <div key={index} className={`timeline-item ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}>
            <div className="timeline-date">
              {date.format('YYYY年MM月DD日')}
              {isToday && <span className="today-badge">今天</span>}
            </div>
            <div className="timeline-content">
              {event.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

## 六、最佳实践

### 1. 按需引入插件

为了保持Day.js的轻量级特性，应该只引入需要的插件：

```javascript
// 只引入需要的插件
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
```

### 2. 使用不可变性

Day.js的日期对象是不可变的，每次操作都会返回一个新的日期对象。应该避免修改原始日期对象：

```javascript
// 正确的方式
const date = dayjs();
const nextWeek = date.add(7, 'day');
console.log(date.format('YYYY-MM-DD')); // 原始日期不变
console.log(nextWeek.format('YYYY-MM-DD')); // 新的日期对象

// 错误的方式
const date = dayjs();
date.add(7, 'day'); // 这不会修改date对象
console.log(date.format('YYYY-MM-DD')); // 仍然是原始日期
```

### 3. 使用链式操作

Day.js支持链式操作，可以使代码更加简洁和易读：

```javascript
// 使用链式操作
const date = dayjs()
  .add(1, 'year')
  .subtract(2, 'month')
  .add(3, 'day')
  .set('hour', 12)
  .set('minute', 30)
  .set('second', 0);

// 不使用链式操作
const date = dayjs();
const date1 = date.add(1, 'year');
const date2 = date1.subtract(2, 'month');
const date3 = date2.add(3, 'day');
const date4 = date3.set('hour', 12);
const date5 = date4.set('minute', 30);
const date6 = date5.set('second', 0);
```

### 4. 使用相对时间

对于显示相对时间（如"3天前"、"2小时后"）的场景，使用relativeTime插件可以提高代码的可读性：

```javascript
// 使用relativeTime插件
const date = dayjs().subtract(3, 'day');
console.log(date.fromNow()); // 输出：3天前

// 不使用relativeTime插件
const date = dayjs().subtract(3, 'day');
const now = dayjs();
const diff = now.diff(date, 'day');
console.log(`${diff}天前`);
```

### 5. 处理时区

在处理跨时区的应用时，使用utc和timezone插件可以确保日期和时间的准确性：

```javascript
// 使用utc和timezone插件
const date = dayjs().tz('America/New_York');
console.log(date.format()); // 输出：纽约时间

// 不使用utc和timezone插件
const date = new Date();
const options = { timeZone: 'America/New_York' };
console.log(date.toLocaleString('en-US', options)); // 输出：纽约时间
```

## 七、总结

Day.js是一个轻量级、功能强大的JavaScript日期库，它提供了与Moment.js兼容的现代API，同时保持了小巧的体积和高性能。通过本文的介绍，我们了解了Day.js的基本用法、高级功能和实际应用场景，以及最佳实践。

Day.js的核心优势在于：

1. **轻量级**：只有约2KB的体积，适合性能敏感的项目
2. **易用性**：简洁的API和链式操作，使代码更加易读
3. **扩展性**：插件系统允许开发者根据需要扩展功能
4. **兼容性**：与Moment.js兼容，便于从Moment.js迁移

在实际项目中，Day.js可以应用于多种场景，如日期选择器、倒计时、日历组件等，为开发者提供强大的日期处理能力。通过合理使用Day.js的插件和功能，可以高效地处理各种日期和时间相关的需求。

随着JavaScript生态系统的发展，Day.js作为一个现代化的日期库，将继续为开发者提供更好的日期处理体验。

