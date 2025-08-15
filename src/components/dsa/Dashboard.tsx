"use client";

import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SetAlarmSheet } from "@/components/dsa/SetAlarmSheet";
import dsaQuestions, { type Category, type Question, allQuestions } from "@/lib/dsa";
import { useDsaProgress } from "@/hooks/useDsaProgress";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { useAlarmStore, type Alarm } from "@/hooks/useAlarmStore";
import { useStreakStore } from "@/hooks/useStreakStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlarmPlus, Bell, Trash2, Edit, Flame } from "lucide-react";
import { format } from 'date-fns';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  remaining: {
    label: "Remaining",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function Dashboard() {
  const [isAlarmSheetOpen, setIsAlarmSheetOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const { progress, toggleQuestion } = useDsaProgress();
  const { notificationPermission, requestNotificationPermission } = useNotificationStore();
  const { alarms, removeAlarm } = useAlarmStore();
  const { streak } = useStreakStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleOpenAlarmSheet = (alarm: Alarm | null = null) => {
    setEditingAlarm(alarm);
    setIsAlarmSheetOpen(true);
  };

  const getCategoryProgress = (category: Category) => {
    if (!isClient) return { completed: 0, total: category.questions.length, percentage: 0 };
    const completed = category.questions.filter(q => progress[q.id]).length;
    const total = category.questions.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { completed, total, percentage };
  };

  const totalCompleted = isClient ? Object.values(progress).filter(p => p).length : 0;
  const totalQuestions = allQuestions.length;
  
  const chartData = [
      { name: 'completed', value: totalCompleted, fill: 'hsl(var(--chart-1))' },
      { name: 'remaining', value: totalQuestions - totalCompleted, fill: 'hsl(var(--chart-2))' }
  ]

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6 gap-2 flex-wrap">
                <h1 className="text-3xl font-headline font-bold">DSA Progress Tracker</h1>
                <div className="flex gap-2">
                {isClient && notificationPermission !== 'granted' && (
                    <Button onClick={requestNotificationPermission} variant="outline" className="bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <Bell className="mr-2 h-4 w-4" />
                    Enable Notifications
                    </Button>
                )}
                <Button onClick={() => handleOpenAlarmSheet()} className="bg-primary hover:bg-primary/90">
                    <AlarmPlus className="mr-2 h-4 w-4" />
                    Set New Alarm
                </Button>
                </div>
            </div>
            <Accordion type="multiple" defaultValue={dsaQuestions.map(c => c.name)} className="w-full">
                {dsaQuestions.map((category) => {
                  const { completed, total, percentage } = getCategoryProgress(category);
                  return (
                    <AccordionItem value={category.name} key={category.name} className="border-border/50">
                        <AccordionTrigger>
                        <div className="flex flex-col items-start w-full mr-4">
                            <div className="flex justify-between w-full">
                              <span className="text-lg font-medium">{category.name}</span>
                              <span className="text-sm text-muted-foreground">{isClient ? `${completed} / ${total}` : '...'}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mt-2">
                            <div
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${isClient ? percentage : 0}%` }}
                            ></div>
                            </div>
                        </div>
                        </AccordionTrigger>
                        <AccordionContent>
                        <div className="space-y-4">
                            {category.questions.map((question: Question) => (
                            <div key={question.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                <Checkbox
                                id={question.id}
                                checked={isClient ? !!progress[question.id] : false}
                                onCheckedChange={() => toggleQuestion(question.id)}
                                disabled={!isClient}
                                />
                                <Label htmlFor={question.id} className="text-base font-normal cursor-pointer flex-1">
                                {question.title}
                                </Label>
                            </div>
                            ))}
                        </div>
                        </AccordionContent>
                    </AccordionItem>
                  )
                })}
            </Accordion>
        </div>
        <div className="space-y-8">
            <Card className="bg-card/50 border-border/50">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-48">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} strokeWidth={2}>
                                {chartData.map((entry) => (
                                     <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                    <div className="text-center mt-4">
                        <p className="text-4xl font-bold">{isClient ? totalCompleted : '...'}/{totalQuestions}</p>
                        <p className="text-muted-foreground">questions solved</p>
                    </div>
                </CardContent>
            </Card>

            {isClient && (
                 <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2">
                           <Flame className="text-primary" /> Daily Streak
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-6xl font-bold">{streak}</p>
                        <p className="text-muted-foreground">{streak === 1 ? 'day' : 'days'}</p>
                    </CardContent>
                </Card>
            )}

            {isClient && alarms.length > 0 && (
                <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                            <AlarmPlus />
                            Your Alarms
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {alarms.sort((a,b) => a.alarmDateTime - b.alarmDateTime).map(alarm => (
                            <div key={alarm.id} className="flex justify-between items-center p-3 rounded-lg border border-border/50 bg-background/50">
                                <div>
                                    <p className="font-semibold text-lg">{format(new Date(alarm.alarmDateTime), 'PPP p')}</p>
                                    <p className="text-sm text-muted-foreground">{alarm.questionIds.length} questions</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenAlarmSheet(alarm)}>
                                        <Edit className="h-4 w-4"/>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeAlarm(alarm.id)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
      <SetAlarmSheet open={isAlarmSheetOpen} onOpenChange={setIsAlarmSheetOpen} existingAlarm={editingAlarm} />
    </div>
  );
}
