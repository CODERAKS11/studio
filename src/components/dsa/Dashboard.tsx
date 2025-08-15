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
import { AlarmPlus, Bell } from "lucide-react";

export function Dashboard() {
  const [isAlarmSheetOpen, setIsAlarmSheetOpen] = useState(false);
  const { progress, toggleQuestion } = useDsaProgress();
  const { notificationPermission, requestNotificationPermission } = useNotificationStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getCategoryProgress = (category: Category) => {
    const total = category.questions.length;
    if (total === 0) return 0;
    const completed = category.questions.filter(q => progress[q.id]).length;
    return (completed / total) * 100;
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6 gap-2">
        <h1 className="text-3xl font-headline font-bold">Your Progress</h1>
        <div className="flex gap-2">
          {isClient && notificationPermission !== 'granted' && (
            <Button onClick={requestNotificationPermission} variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Enable Notifications
            </Button>
          )}
          <Button onClick={() => setIsAlarmSheetOpen(true)}>
            <AlarmPlus className="mr-2 h-4 w-4" />
            Set Daily Alarm
          </Button>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={dsaQuestions.map(c => c.name)} className="w-full">
        {dsaQuestions.map((category) => (
          <AccordionItem value={category.name} key={category.name}>
            <AccordionTrigger>
              <div className="flex flex-col items-start w-full mr-4">
                <span className="text-lg font-medium">{category.name}</span>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{ width: `${getCategoryProgress(category)}%` }}
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
                      checked={!!progress[question.id]}
                      onCheckedChange={() => toggleQuestion(question.id)}
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
      <SetAlarmSheet open={isAlarmSheetOpen} onOpenChange={setIsAlarmSheetOpen} />
    </div>
  );
}
