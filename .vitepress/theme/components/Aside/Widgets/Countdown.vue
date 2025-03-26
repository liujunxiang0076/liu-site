<template>
  <div class="countdown-calendar-widget s-card">
    <!-- 倒计时 -->
    <div class="count-down">
      <div class="count-left" @click="toggleCalendarView">
        <span class="text">距离</span>
        <span class="name">{{ nextHoliday }}</span>
        <span class="time">{{ getDaysUntil(nextHolidayDate) }}天</span>
        <span class="date">{{ nextHolidayDate }}</span>
      </div>
      <div v-if="remainData" class="count-right">
        <div v-for="(item, tag, index) in remainData" :key="index" class="count-item">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-progress">
            <div
              class="progress-bar"
              :style="{ width: item.percentage + '%', opacity: item.percentage / 100 }"
            />
            <span :class="['percentage', { many: item.percentage >= 46 }]">
              {{ item.percentage }}%
            </span>
            <span :class="['remaining', { many: item.percentage >= 60 }]">
              <span class="tip">还剩</span>
              {{ item.remaining }}
              <span class="tip">{{ tag === "day" ? "小时" : "天" }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分隔线 -->
    <div class="divider" v-if="showCalendar"></div>
    
    <!-- 日历部分 -->
    <div class="calendar-container" v-if="showCalendar">
      <!-- 日历顶部导航 -->
      <div class="calendar-header">
        <div class="navigation-section">
          <!-- 上个月 -->
          <button class="arrow-btn prev" @click="prevMonth">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 18l-6-6 6-6"></path>
            </svg>
          </button>
          <!-- 当前月份 -->
          <div class="current-month">
            {{ currentYear }}年{{ currentMonth + 1 }}月
          </div>
          <!-- 下个月 -->
          <button class="arrow-btn next" @click="nextMonth">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </button>
        </div>
        <!-- 回到今天 -->
        <button class="today-btn" @click="goToToday">今天</button>
      </div>

      <!-- 星期标题 -->
      <div class="weekdays">
        <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
      </div>
      <!-- 日历主体 -->
      <div class="days-grid">
        <div 
          v-for="{ date, dayNumber, isCurrentMonth, isToday, isTargetDate } in calendarDays" 
          :key="date.toISOString()"
          class="day"
          :class="{
            'other-month': !isCurrentMonth,
            'today': isToday,
            'target-date': isTargetDate
          }"
        >
          <span class="day-number">{{ dayNumber }}</span>
          <div v-if="isToday" class="day-marker today-marker"></div>
          <div v-if="isTargetDate" class="day-marker target-marker"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { getTimeRemaining, getDaysUntil } from "@/utils/timeTools";
import { getRecentHoliday } from "@/api";
const { theme } = useData();

// 日历状态
const showCalendar = ref(false);
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

// 节假日数据
const nextHoliday = ref(null);
const nextHolidayDate = ref(null);
const getNextHoliday = async () => {
  const res = await getRecentHoliday();
  nextHoliday.value = res.localName;
  nextHolidayDate.value = res.date;
};

// 倒计时数据
const remainData = ref(null);
const remainInterval = ref(null);

// 获取倒计时数据
const getRemainData = () => {
  remainData.value = getTimeRemaining();
  remainInterval.value = setInterval(() => {
    remainData.value = getTimeRemaining();
  }, 1000);
};

// 切换日历显示/隐藏
function toggleCalendarView() {
  showCalendar.value = !showCalendar.value;
}

// 上个月
function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value -= 1;
  } else {
    currentMonth.value -= 1;
  }
}

// 下个月
function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value += 1;
  } else {
    currentMonth.value += 1;
  }
}

// 回到今天
function goToToday() {
  const today = new Date();
  currentMonth.value = today.getMonth();
  currentYear.value = today.getFullYear();
}

// 判断两个日期是否是同一天
function isSameDate(date1, date2) {
  return date1.getDate() === date2.getDate() 
    && date1.getMonth() === date2.getMonth() 
    && date1.getFullYear() === date2.getFullYear();
}

// 生成当月日历数据
const calendarDays = computed(() => {
  if (!nextHolidayDate.value) return [];
  
  const days = [];
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1);
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0);
  
  // 目标日期
  const targetDate = new Date(nextHolidayDate.value);
  
  // 获取当月第一天是星期几
  const firstDayWeekday = firstDayOfMonth.getDay();
  
  // 添加上个月的日期
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate();
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const date = new Date(currentYear.value, currentMonth.value - 1, prevMonthLastDay - i);
    days.push({
      date,
      dayNumber: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: isSameDate(date, new Date()),
      isTargetDate: isSameDate(date, targetDate)
    });
  }
  
  // 添加当月的日期
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i);
    days.push({
      date,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: isSameDate(date, new Date()),
      isTargetDate: isSameDate(date, targetDate)
    });
  }
  
  // 添加下个月的日期，补满6行
  const daysNeeded = 42 - days.length;
  for (let i = 1; i <= daysNeeded; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i);
    days.push({
      date,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: isSameDate(date, new Date()),
      isTargetDate: isSameDate(date, targetDate)
    });
  }
  
  return days;
});

onMounted(() => {
  getRemainData();
  getNextHoliday();
  
  // 初始化日历月份到目标日期的月份
  if (nextHolidayDate.value) {
    const targetDate = new Date(nextHolidayDate.value);
    currentMonth.value = targetDate.getMonth();
    currentYear.value = targetDate.getFullYear();
  }
});

onBeforeUnmount(() => {
  clearInterval(remainInterval.value);
});
</script>

<style lang="scss" scoped>
.countdown-calendar-widget {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  padding: 12px;
}

.divider {
  height: 1px;
  background-color: #eee;
  margin: 12px 0;
  animation: fade-in 0.3s ease;
}

.count-down {
  display: flex;
  flex-direction: row;
  align-items: center;
  
  .count-left {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-evenly;
    margin-right: 0.8rem;
    cursor: pointer;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 0.8;
    }
    
    .text {
      font-size: 14px;
      color: var(--main-font-second-color);
    }
    .name {
      font-weight: bold;
      font-size: 18px;
      margin-top: 2px;
    }
    .time {
      font-size: 30px;
      font-weight: bold;
      margin: 4px 0;
      color: var(--main-color);
    }
    .date {
      font-size: 12px;
      opacity: 0.6;
    }
    &::after {
      content: "";
      position: absolute;
      right: -0.8rem;
      width: 2px;
      height: 80%;
      background-color: var(--main-card-border);
    }
  }
  .count-right {
    flex: 1;
    width: 100%;
    margin-left: 0.8rem;
    .count-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 24px;
      margin: 6px 0;
      .item-name {
        font-size: 14px;
        margin-right: 0.8rem;
        white-space: nowrap;
        color: var(--main-font-second-color);
      }
      .item-progress {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        width: 100%;
        border-radius: 8px;
        background-color: var(--main-color-bg);
        overflow: hidden;
        .progress-bar {
          height: 100%;
          border-radius: 8px;
          background-color: var(--main-color);
        }
        .percentage,
        .remaining {
          position: absolute;
          font-size: 12px;
          margin: 0 6px;
          transition:
            opacity 0.3s,
            transform 0.3s;
          &.many {
            color: #fff;
            .tip {
              opacity: 0.8;
            }
          }
        }
        .remaining {
          opacity: 0;
          transform: translateX(10px);
          .tip {
            opacity: 0.6;
          }
        }
      }
    }
  }
  &:hover {
    .count-right {
      .remaining {
        transform: translateX(0) !important;
        opacity: 1 !important;
      }
      .percentage {
        transform: translateX(-10px) !important;
        opacity: 0 !important;
      }
    }
  }
}

/* 日历样式 */
.calendar-container {
  animation: slide-down 0.3s ease;
}

.s-card {
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  background-color: #fff;
  transition: all 0.3s ease;
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 日历顶部导航 */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
// 日历顶部导航
.navigation-section {
  display: flex;
  align-items: center;
  gap: 8px;
}
// 箭头按钮
.arrow-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
  // 鼠标悬停
  &:hover {
    background-color: #f5f5f5;
  }
}
// 当前月份
.current-month {
  font-weight: 500;
  font-size: 0.9rem;
}
// 今天按钮
.today-btn {
  background-color: #f0f2ff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: #4169e1;
  font-size: 0.85rem;
  transition: background-color 0.2s;
  // 鼠标悬停
  &:hover {
    background-color: #e0e6ff;
  }
}
// 日历星期栏
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  padding: 8px 0;
  font-size: 0.9rem;
  color: #666;
  border-bottom: 1px solid #f0f0f0;
}
// 日历网格
.days-grid {
  // 网格布局
  display: grid;
  // 7列
  grid-template-columns: repeat(7, 1fr);
  // 间距
  gap: 2px;
}
// 日历主体
.day {
  height: 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
  border-radius: 4px;
}
// 日历数字
.day-number {
  font-size: 0.95rem;
  font-weight: 500;
  z-index: 1;
}
// 其他月份
.other-month {
  color: #ccc;
}
// 今天
.today {
  color: #4169e1;
  font-weight: bold;
}
// 目标日期
.target-date .day-number {
  color: #ff6b6b;
}
// 日历标记
.day-marker {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  bottom: 5px;
}
// 今天标记
.today-marker {
  background-color: #4169e1;
}
// 目标标记
.target-marker {
  background-color: #ff6b6b;
}

// 深色模式支持
@media (prefers-color-scheme: dark) {
  .s-card {
    background-color: #2a2a2a;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
  
  .divider {
    background-color: #444;
  }
  
  .arrow-btn {
    color: #ccc;
    
    &:hover {
      background-color: #333;
    }
  }
  
  .current-month {
    color: #eee;
  }
  
  .today-btn {
    background-color: #374275;
    color: #a0b4ff;
    
    &:hover {
      background-color: #3d4880;
    }
  }
  
  .weekdays {
    color: #aaa;
    border-color: #444;
  }
  
  .day-number {
    color: #ddd;
  }
  
  .other-month {
    color: #666;
  }
  
  .today {
    color: #6b8aff;
  }
  
  .target-date .day-number {
    color: #ff6b6b;
  }
}
</style>

