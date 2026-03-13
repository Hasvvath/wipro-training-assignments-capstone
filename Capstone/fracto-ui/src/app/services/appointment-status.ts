import { Appointment } from './appointment.service';

function parseTimeSlot(timeSlot?: string): { hours: number; minutes: number } | null {
  if (!timeSlot) {
    return null;
  }

  const trimmed = timeSlot.trim();

  const twelveHour = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHour) {
    let hours = Number(twelveHour[1]);
    const minutes = Number(twelveHour[2]);
    const meridiem = twelveHour[3].toUpperCase();

    if (meridiem === 'PM' && hours !== 12) {
      hours += 12;
    }

    if (meridiem === 'AM' && hours === 12) {
      hours = 0;
    }

    return { hours, minutes };
  }

  const twentyFourHour = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHour) {
    return {
      hours: Number(twentyFourHour[1]),
      minutes: Number(twentyFourHour[2])
    };
  }

  return null;
}

function parseAppointmentDate(date?: string): Date | null {
  if (!date) {
    return null;
  }

  const dateOnly = date.includes('T') ? date.split('T')[0] : date;
  const [year, month, day] = dateOnly.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

export function getRawAppointmentStatus(appointment: Appointment): string {
  return (appointment.status || 'Booked').trim();
}

export function getAppointmentDateTime(appointment: Appointment): Date | null {
  const appointmentDate = parseAppointmentDate(appointment.appointmentDate || appointment.date);
  const appointmentTime = parseTimeSlot(appointment.timeSlot);

  if (!appointmentDate || !appointmentTime) {
    return null;
  }

  return new Date(
    appointmentDate.getFullYear(),
    appointmentDate.getMonth(),
    appointmentDate.getDate(),
    appointmentTime.hours,
    appointmentTime.minutes,
    0,
    0
  );
}

export function isAppointmentPast(appointment: Appointment): boolean {
  const scheduledAt = getAppointmentDateTime(appointment);
  return scheduledAt ? scheduledAt.getTime() <= Date.now() : false;
}

export function getEffectiveAppointmentStatus(appointment: Appointment): string {
  const explicitStatus = getRawAppointmentStatus(appointment);
  if (explicitStatus.toLowerCase() !== 'booked') {
    return explicitStatus;
  }

  return isAppointmentPast(appointment) ? 'Attended' : explicitStatus;
}
