/**
 * Calculates working hours for a single day based on start time, end time, and break.
 *
 * @param {Object} day - Day object with startTime, endTime, breakMinutes, and isWorkingDay
 * @returns {number} - Hours worked for the day
 */
const calculateDayHours = day => {
  if (!day || !day.isWorkingDay || !day.startTime || !day.endTime) return 0
  try {
    const [startH, startM] = (day.startTime || '09:00').split(':').map(Number)
    const [endH, endM] = (day.endTime || '17:00').split(':').map(Number)
    const startTotalMinutes = (startH || 0) * 60 + (startM || 0)
    const endTotalMinutes = (endH || 0) * 60 + (endM || 0)

    let workMinutes = endTotalMinutes - startTotalMinutes - (day.breakMinutes || 0)
    if (workMinutes < 0) workMinutes = 0
    return workMinutes / 60
  } catch (e) {
    return 0
  }
}

/**
 * Calculates total weekly hours from schedule days.
 *
 * @param {Object} schedule - WorkingSchedule document or object containing days array
 * @returns {number}
 */
const calculateWeeklyHours = schedule => {
  if (!schedule || !schedule.days || !Array.isArray(schedule.days)) {
    return 0
  }
  const total = schedule.days.reduce((acc, day) => acc + calculateDayHours(day), 0)
  return Math.round((total + Number.EPSILON) * 100) / 100
}

/**
 * Calculates expected working hours for an employee between two dates based on their working schedule.
 *
 * @param {Object} schedule - WorkingSchedule document
 * @param {Date | string} startDate
 * @param {Date | string} endDate
 * @returns {{ expectedHours: number, expectedDays: number }}
 */
const getExpectedScheduleHours = (schedule, startDate, endDate) => {
  if (!schedule || !schedule.days || schedule.days.length === 0) {
    return { expectedHours: 0, expectedDays: 0 }
  }

  const s = new Date(startDate)
  const e = new Date(endDate)

  const dayMap = {}
  schedule.days.forEach(d => {
    dayMap[d.day] = d
  })

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  let expectedHours = 0
  let expectedDays = 0

  const current = new Date(s)
  while (current <= e) {
    const dayName = dayNames[current.getDay()]
    const shift = dayMap[dayName]
    if (shift && shift.isWorkingDay) {
      expectedDays += 1
      expectedHours += calculateDayHours(shift)
    }
    current.setDate(current.getDate() + 1)
  }

  return {
    expectedHours: Math.round((expectedHours + Number.EPSILON) * 100) / 100,
    expectedDays
  }
}

export { calculateDayHours, calculateWeeklyHours, getExpectedScheduleHours }
