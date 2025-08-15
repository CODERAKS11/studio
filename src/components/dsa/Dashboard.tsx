"use client";

import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SetAlarmSheet } from "@/components/dsa/SetAlarmSheet";
import dsaQuestions, { type Category, type Question } from "@/lib/dsa";
import { useDsaProgress } from "@/hooks/useDsaProgress";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { useAlarmStore, type Alarm } from "@/hooks/useAlarmStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlarmPlus, Bell, Trash2 } from "lucide-react";
import { format } from 'date-fns';

export function Dashboard() {
  const [isAlarmSheetOpen, setIsAlarmSheetOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const { progress, toggleQuestion } = useDsaProgress();
  const { notificationPermission, requestNotificationPermission } = useNotificationStore();
  const { alarms, removeAlarm } = useAlarmStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleOpenAlarmSheet = (alarm: Alarm | null = null) => {
    setEditingAlarm(alarm);
    setIsAlarmSheetOpen(true);
  };

  const getCategoryProgress = (category: Category) => {
    if (!isClient) return 0;
    const total = category.questions.length;
    if (total === 0) return 0;
    const completed = category.questions.filter(q => progress[q.id]).length;
    return (completed / total) * 100;
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6 gap-2 flex-wrap">
        <h1 className="text-3xl font-headline font-bold">Your Progress</h1>
        <div className="flex gap-2">
          {isClient && notificationPermission !== 'granted' && (
            <Button onClick={requestNotificationPermission} variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Enable Notifications
            </Button>
          )}
          <Button onClick={() => handleOpenAlarmSheet()}>
            <AlarmPlus className="mr-2 h-4 w-4" />
            Set New Alarm
          </Button>
        </div>
      </div>

      {isClient && alarms.length > 0 && (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <AlarmPlus className="h-6 w-6"/>
                    Your Alarms
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {alarms.sort((a,b) => a.alarmDateTime - b.alarmDateTime).map(alarm => (
                    <div key={alarm.id} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                        <div>
                            <p className="font-semibold text-lg">{format(new Date(alarm.alarmDateTime), 'PPP p')}</p>
                            <p className="text-sm text-muted-foreground">{alarm.questionIds.length} questions</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenAlarmSheet(alarm)}>
                                Edit
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeAlarm(alarm.id)}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
      )}

      <Accordion type="multiple" defaultValue={dsaQuestions.map(c => c.name)} className="w-full">
        {dsaQuestions.map((category) => (
          <AccordionItem value={category.name} key={category.name}>
            <AccordionTrigger>
              <div className="flex flex-col items-start w-full mr-4">
                <span className="text-lg font-medium">{category.name}</span>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{ width: `${isClient ? getCategoryProgress(category) : 0}%` }}
                  ></div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {category.questions.map((question: Question) => (
                  <div key={question.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
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
        ))}
      </Accordion>
      <SetAlarmSheet open={isAlarmSheetOpen} onOpenChange={setIsAlarmSheetOpen} existingAlarm={editingAlarm} />
    </div>
  );
}
