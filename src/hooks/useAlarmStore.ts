"use client"

import useLocalStorage from './use-local-storage';

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

export function useAlarmStore() {
    const [alarm, setAlarm] = useLocalStorage<AlarmState>('dsa-alarm', initialState);

    const setDsaAlarm = (time: string, questions: string[]) => {
        setAlarm({
            ...initialState,
            alarmTime: time,
            questionIds: questions,
        });
    };

    const startAlarm = () => {
        setAlarm(prev => ({
            ...prev,
            isActive: true,
            currentQuestionIndex: 0,
            snoozeUntil: null,
        }));
    };
    
    const snoozeAlarm = () => {
        setAlarm(prev => ({
            ...prev,
            snoozeUntil: Date.now() + 5 * 60 * 1000
        }));
    }

    const nextQuestion = () => {
        setAlarm(prev => ({
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
        }));
    };
    
    const resetAlarm = () => {
        setAlarm(initialState);
    };

    const activateAlarm = () => {
        setAlarm(prev => ({...prev, isActive: true, snoozeUntil: null}));
    }

    return { alarm, setDsaAlarm, startAlarm, snoozeAlarm, nextQuestion, resetAlarm, activateAlarm };
}
