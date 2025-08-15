"use client"

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AlarmState {
    alarmTime: string;
    questionIds: string[];
    isActive: boolean;
    currentQuestionIndex: number;
    snoozeUntil: number | null;
}

const initialState: AlarmState = {
    alarmTime: '07:00',
    questionIds: [],
    isActive: false,
    currentQuestionIndex: 0,
    snoozeUntil: null,
};

interface AlarmStore extends AlarmState {
    setDsaAlarm: (time: string, questions: string[]) => void;
    startAlarm: () => void;
    snoozeAlarm: () => void;
    nextQuestion: () => void;
    resetAlarm: () => void;
    activateAlarm: () => void;
}

export const useAlarmStore = create<AlarmStore>()(
    persist(
        (set) => ({
            ...initialState,
            setDsaAlarm: (time, questions) => set({
                ...initialState,
                alarmTime: time,
                questionIds: questions,
            }),
            startAlarm: () => set(state => ({
                ...state,
                isActive: true,
                currentQuestionIndex: 0,
                snoozeUntil: null,
            })),
            snoozeAlarm: () => set(state => ({
                ...state,
                snoozeUntil: Date.now() + 5 * 60 * 1000,
                isActive: false, // Deactivate alarm when snoozing
            })),
            nextQuestion: () => set(state => ({
                ...state,
                currentQuestionIndex: state.currentQuestionIndex + 1,
            })),
            resetAlarm: () => set(initialState),
            activateAlarm: () => set(state => ({
                ...state,
                isActive: true,
                snoozeUntil: null,
            })),
        }),
        {
            name: 'dsa-alarm',
        }
    )
);
