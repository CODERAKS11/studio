"use client"

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeImage } from '@/ai/flows/analyze-image';
import { useAlarmStore } from '@/hooks/useAlarmStore';
import { useDsaProgress } from '@/hooks/useDsaProgress';
import type { Question } from '@/lib/dsa';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera } from 'lucide-react';
import Image from 'next/image';
import { Label } from '../ui/label';

const TIME_LIMIT_SECONDS = 1 * 60; // Set to 1 minute for testing

export function QuestionSolver({ question }: { question: Question }) {
    const router = useRouter();
    const { toast } = useToast();
    const { alarm, nextQuestion, resetAlarm } = useAlarmStore();
    const { completeQuestion } = useDsaProgress();

    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const timerId = useRef<NodeJS.Timeout>();
    const timerDeadlineKey = `dsa-timer-deadline-${question.id}`;

    const clearTimerState = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(timerDeadlineKey);
        }
    };

    const handleTimeout = () => {
        toast({ variant: "destructive", title: "Time's up!", description: "Please try solving the question again." });
        clearTimerState();
        setTimeLeft(TIME_LIMIT_SECONDS);
        const newDeadline = Date.now() + TIME_LIMIT_SECONDS * 1000;
        localStorage.setItem(timerDeadlineKey, newDeadline.toString());
    };

    useEffect(() => {
        const savedDeadline = localStorage.getItem(timerDeadlineKey);
        const now = Date.now();
        let deadline: number;

        if (savedDeadline) {
            deadline = parseInt(savedDeadline, 10);
            const remaining = Math.round((deadline - now) / 1000);
            if (remaining > 0) {
                setTimeLeft(remaining);
            } else {
                setTimeLeft(0);
                handleTimeout();
            }
        } else {
            deadline = now + TIME_LIMIT_SECONDS * 1000;
            localStorage.setItem(timerDeadlineKey, deadline.toString());
            setTimeLeft(TIME_LIMIT_SECONDS);
        }

        timerId.current = setInterval(() => {
            const newRemaining = Math.round((deadline - Date.now()) / 1000);
            if (newRemaining <= 0) {
                clearInterval(timerId.current);
                handleTimeout();
            } else {
                setTimeLeft(newRemaining);
            }
        }, 1000);

        return () => clearInterval(timerId.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [question.id, timerDeadlineKey]);

    const handleSuccess = () => {
        clearTimerState();
        completeQuestion(question.id);
        const nextIndex = alarm.currentQuestionIndex + 1;
        if (nextIndex < alarm.questionIds.length) {
            nextQuestion();
            router.push(`/question/${alarm.questionIds[nextIndex]}`);
        } else {
            toast({ title: "All questions solved!", description: "You've completed your daily DSA workout!" });
            resetAlarm();
            router.push('/');
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const photoDataUri = e.target?.result as string;
                setUploadedImage(photoDataUri);
                setIsAnalyzing(true);
                try {
                    const result = await analyzeImage({
                        photoDataUri,
                        questionDescription: `Title: ${question.title}. Description: ${question.description}`,
                    });

                    if (result.isLegitimate) {
                        toast({ title: "Verification Successful!", description: "Great job! Moving to the next question." });
                        handleSuccess();
                    } else {
                        toast({ variant: "destructive", title: "Verification Failed", description: result.reason });
                        setUploadedImage(null);
                    }
                } catch (error) {
                    console.error(error);
                    toast({ variant: "destructive", title: "Analysis Error", description: "Could not analyze the image. Please try again." });
                    setUploadedImage(null);
                } finally {
                    setIsAnalyzing(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileSelect = () => fileInputRef.current?.click();
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progressPercentage = (timeLeft / TIME_LIMIT_SECONDS) * 100;
    
    const currentQuestionNumber = alarm.currentQuestionIndex + 1;
    const totalQuestions = alarm.questionIds.length;

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="font-headline text-3xl mb-2">{question.title}</CardTitle>
                            <CardDescription className="text-base font-code">{question.description}</CardDescription>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                            <p className="text-lg font-semibold text-primary">{`${currentQuestionNumber} / ${totalQuestions}`}</p>
                            <p className="text-sm text-muted-foreground">Questions</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label className="text-lg">Time Remaining</Label>
                            <span className="text-2xl font-bold font-mono text-primary">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                        </div>
                        <Progress value={progressPercentage} />
                    </div>

                    {uploadedImage && (
                        <div className="flex justify-center">
                           <Image src={uploadedImage} alt="Uploaded solution" width={400} height={300} className="rounded-md object-contain border" data-ai-hint="code screenshot" />
                        </div>
                    )}

                    <div className="flex justify-center">
                        <Button size="lg" onClick={triggerFileSelect} disabled={isAnalyzing} className="w-full max-w-sm py-8 text-xl">
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Camera className="mr-2 h-6 w-6" />
                                    Upload & Verify
                                </>
                            )}
                        </Button>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
