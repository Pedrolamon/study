import { useState, useEffect, useCallback } from 'react';
import type { Appointment, Reminder } from '../types';
import { storageService } from '../services/storage';
import { generateId, getNextOccurrence } from '../utils/helpers';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Load appointments from storage
  useEffect(() => {
    const loadAppointments = () => {
      const stored = storageService.getAppointments();
      setAppointments(stored);
      setLoading(false);
    };

    loadAppointments();
  }, []);

  // Add new appointment
  const addAppointment = useCallback((appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedAppointments = [...appointments, newAppointment];
    setAppointments(updatedAppointments);
    storageService.saveAppointments(updatedAppointments);
  }, [appointments]);

  // Update appointment
  const updateAppointment = useCallback((id: string, updates: Partial<Appointment>) => {
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === id 
        ? { ...appointment, ...updates, updatedAt: new Date().toISOString() }
        : appointment
    );
    
    setAppointments(updatedAppointments);
    storageService.saveAppointments(updatedAppointments);
  }, [appointments]);

  // Delete appointment
  const deleteAppointment = useCallback((id: string) => {
    const updatedAppointments = appointments.filter(appointment => appointment.id !== id);
    setAppointments(updatedAppointments);
    storageService.saveAppointments(updatedAppointments);
  }, [appointments]);

  // Get appointments for a specific date
  const getAppointmentsForDate = useCallback((date: string) => {
    return appointments.filter(appointment => {
      if (appointment.isRecurring && appointment.recurrenceType) {
        // For recurring appointments, check if this date is a valid occurrence
        const nextOccurrence = getNextOccurrence(appointment.date, appointment.recurrenceType);
        const targetDate = new Date(date);
        return isSameDay(nextOccurrence, targetDate);
      }
      return appointment.date === date;
    });
  }, [appointments]);

  // Get appointments for a date range
  const getAppointmentsForDateRange = useCallback((startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= start && appointmentDate <= end;
    });
  }, [appointments]);

  // Add reminder to appointment
  const addReminder = useCallback((appointmentId: string, reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: generateId(),
    };

    const updatedAppointments = appointments.map(appointment => 
      appointment.id === appointmentId 
        ? { 
            ...appointment, 
            reminders: [...appointment.reminders, newReminder],
            updatedAt: new Date().toISOString()
          }
        : appointment
    );
    
    setAppointments(updatedAppointments);
    storageService.saveAppointments(updatedAppointments);
  }, [appointments]);

  // Update reminder
  const updateReminder = useCallback((appointmentId: string, reminderId: string, updates: Partial<Reminder>) => {
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === appointmentId 
        ? {
            ...appointment,
            reminders: appointment.reminders.map(reminder =>
              reminder.id === reminderId 
                ? { ...reminder, ...updates }
                : reminder
            ),
            updatedAt: new Date().toISOString()
          }
        : appointment
    );
    
    setAppointments(updatedAppointments);
    storageService.saveAppointments(updatedAppointments);
  }, [appointments]);

  // Delete reminder
  const deleteReminder = useCallback((appointmentId: string, reminderId: string) => {
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === appointmentId 
        ? {
            ...appointment,
            reminders: appointment.reminders.filter(reminder => reminder.id !== reminderId),
            updatedAt: new Date().toISOString()
          }
        : appointment
    );
    
    setAppointments(updatedAppointments);
    storageService.saveAppointments(updatedAppointments);
  }, [appointments]);

  // Check for overlapping appointments
  const getOverlappingAppointments = useCallback((date: string, startTime: string, endTime: string, excludeId?: string) => {
    const dayAppointments = getAppointmentsForDate(date);
    
    return dayAppointments.filter(appointment => {
      if (excludeId && appointment.id === excludeId) return false;
      
      const appointmentStart = appointment.startTime;
      const appointmentEnd = appointment.endTime;
      
      // Check if there's any overlap
      return (
        (startTime < appointmentEnd && endTime > appointmentStart) ||
        (appointmentStart < endTime && appointmentEnd > startTime)
      );
    });
  }, [getAppointmentsForDate]);

  return {
    appointments,
    loading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsForDate,
    getAppointmentsForDateRange,
    addReminder,
    updateReminder,
    deleteReminder,
    getOverlappingAppointments,
  };
};

// Helper function for date comparison
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}; 