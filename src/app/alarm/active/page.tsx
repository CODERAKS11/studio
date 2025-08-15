"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAlarmStore } from '@/hooks/useAlarmStore';
import { AlarmClock, Play, History } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ActiveAlarmPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { getAlarmById, startAlarm, snoozeAlarm } = useAlarmStore();
    const [alarmId, setAlarmId] = useState<string | null>(null);

    useEffect(() => {
        const id = searchParams.get('alarmId');
        if (id) {
            setAlarmId(id);
        } else {
            // Handle case where alarmId is missing
            router.push('/');
        }
    }, [searchParams, router]);

    const alarm = alarmId ? getAlarmById(alarmId) : null;

    const handleStart = () => {
        if (!alarm) return;
        startAlarm(alarm.id);
        if (alarm.questionIds.length > 0) {
            const firstQuestionId = alarm.questionIds[0];
            router.push(`/question/${firstQuestionId}?alarmId=${alarm.id}`);
        } else {
            router.push('/');
        }
    };

    const handleSnooze = () => {
        if (!alarmId) return;
        snoozeAlarm(alarmId);
        router.push('/');
    };
    
    if (!alarm) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
                <p>Loading alarm...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="text-center">
                <AlarmClock className="mx-auto h-24 w-24 text-primary animate-pulse" />
                <h1 className="mt-8 text-5xl font-headline font-bold text-foreground">DSA Alarm!</h1>
                <p className="mt-4 text-xl text-muted-foreground">
                    Time to solve your daily DSA problems.
                </p>
            </div>

            <div className="mt-16 flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <Button size="lg" className="flex-1 text-lg py-8" onClick={handleStart}>
                    <Play className="mr-2 h-6 w-6" />
                    Start
                </Button>
                <Button size="lg" variant="secondary" className="flex-1 text-lg py-8" onClick={handleSnooze}>
                    <History className="mr-2 h-6 w-6" />
                    2 Minutes Later
                </Button>
            </div>
        </div>
    );
}
