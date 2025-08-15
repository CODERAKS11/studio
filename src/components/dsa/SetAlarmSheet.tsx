"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAlarmStore, type Alarm } from "@/hooks/useAlarmStore";
import { useToast } from "@/hooks/use-toast";
import { allQuestions, type Question } from "@/lib/dsa";
import { Search } from "lucide-react";

interface SetAlarmSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingAlarm: Alarm | null;
}

export function SetAlarmSheet({ open, onOpenChange, existingAlarm }: SetAlarmSheetProps) {
  const { addOrUpdateAlarm } = useAlarmStore();
  const { toast } = useToast();
  
  // Initialize with default values
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [alarmDate, setAlarmDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [alarmTime, setAlarmTime] = useState('07:00');
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Populate state from existingAlarm when it's provided and the sheet is open
    if (open && existingAlarm) {
      const alarmDateTime = new Date(existingAlarm.alarmDateTime);
      setSelectedQuestions(existingAlarm.questionIds);
      setAlarmDate(format(alarmDateTime, 'yyyy-MM-dd'));
      setAlarmTime(format(alarmDateTime, 'HH:mm'));
    } else if (open) {
      // Reset for new alarm
      setSelectedQuestions([]);
      setAlarmDate(format(new Date(), 'yyyy-MM-dd'));
      setAlarmTime('07:00');
      setSearchTerm("");
    }
  }, [existingAlarm, open]);

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSetAlarm = () => {
    if (selectedQuestions.length < 3) {
      toast({
        variant: "destructive",
        title: "Invalid Selection",
        description: "Please select at least 3 questions to set an alarm.",
      });
      return;
    }

    // Combine date and time strings and parse into a Date object
    const dateTimeString = `${alarmDate}T${alarmTime}:00`;
    const alarmDateTime = new Date(dateTimeString);
    
    if (isNaN(alarmDateTime.getTime())) {
        toast({
            variant: "destructive",
            title: "Invalid Date/Time",
            description: "Please enter a valid date and time.",
        });
        return;
    }

    addOrUpdateAlarm({ 
        id: existingAlarm?.id, 
        dateTime: alarmDateTime.getTime(), 
        questions: selectedQuestions 
    });

    toast({
      title: `Alarm ${existingAlarm ? 'Updated' : 'Set'}!`,
      description: `Your DSA alarm is set for ${format(alarmDateTime, 'PPP p')}.`,
    });
    onOpenChange(false);
  };

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(question => 
        question.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);
  
  if (!isClient) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">{existingAlarm ? 'Edit' : 'Set'} Your DSA Alarm</SheetTitle>
          <SheetDescription>
            Select a date, a time, and at least 3 questions. Your alarm will ring at the specified time.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 flex flex-col gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="alarm-date">Date</Label>
                <Input
                id="alarm-date"
                type="date"
                value={alarmDate}
                onChange={(e) => setAlarmDate(e.target.value)}
                className="mt-1"
                />
            </div>
            <div>
                <Label htmlFor="alarm-time">Time (24-hour)</Label>
                <Input
                id="alarm-time"
                type="time"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                className="mt-1"
                />
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">Your local time will be used (e.g., IST for users in India).</p>

          <div className="flex-1 flex flex-col min-h-0">
            <Label>Questions ({selectedQuestions.length} selected)</Label>
            <div className="relative mt-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search for a question..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                />
            </div>
            <ScrollArea className="mt-2 flex-1 border rounded-md p-4">
              <div className="space-y-2">
                {filteredQuestions.map((question: Question) => (
                  <div key={question.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`alarm-${question.id}`}
                      checked={selectedQuestions.includes(question.id)}
                      onCheckedChange={() => handleQuestionToggle(question.id)}
                    />
                    <Label htmlFor={`alarm-${question.id}`} className="font-normal cursor-pointer flex-1">
                      {question.title}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSetAlarm}>{existingAlarm ? 'Update' : 'Set'} Alarm</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
