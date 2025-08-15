"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAlarmStore } from "@/hooks/useAlarmStore";
import { useToast } from "@/hooks/use-toast";
import { allQuestions, type Question } from "@/lib/dsa";
import { Search } from "lucide-react";

interface SetAlarmSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SetAlarmSheet({ open, onOpenChange }: SetAlarmSheetProps) {
  const { alarm, setDsaAlarm } = useAlarmStore();
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(alarm.questionIds);
  const [alarmTime, setAlarmTime] = useState(alarm.alarmTime);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

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
    setDsaAlarm(alarmTime, selectedQuestions);
    toast({
      title: "Alarm Set!",
      description: `Your DSA alarm is set for ${alarmTime} every day.`,
    });
    onOpenChange(false);
  };

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(question => 
        question.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">Set Your Daily DSA Alarm</SheetTitle>
          <SheetDescription>
            Select at least 3 questions. This alarm will ring daily until you solve them.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 flex flex-col gap-4 py-4">
          <div>
            <Label htmlFor="alarm-time">Alarm Time</Label>
            <Input
              id="alarm-time"
              type="time"
              value={alarmTime}
              onChange={(e) => setAlarmTime(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <Label>Questions</Label>
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
          <Button onClick={handleSetAlarm}>Set Alarm</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
