"use client";

import { AnswerOption } from "@/lib/question-presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface AnswerOptionsEditorProps {
  options: AnswerOption[];
  onChange: (options: AnswerOption[]) => void;
}

export function AnswerOptionsEditor({ options, onChange }: AnswerOptionsEditorProps) {
  const updateOption = (index: number, updates: Partial<AnswerOption>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    onChange(newOptions);
  };

  const addOption = () => {
    const newOption: AnswerOption = {
      id: `option-${Date.now()}`,
      label: "",
      meaning: "",
      order: options.length,
    };
    onChange([...options, newOption]);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    // Reorder remaining options
    newOptions.forEach((opt, i) => {
      opt.order = i;
    });
    onChange(newOptions);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Answer Options</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          className="h-8 shadow-none"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Option
        </Button>
      </div>
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={option.id} className="space-y-2 p-3 border rounded-lg">
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label htmlFor={`label-${index}`} className="text-xs text-muted-foreground">
                  Label
                </Label>
                <Input
                  id={`label-${index}`}
                  value={option.label}
                  onChange={(e) => updateOption(index, { label: e.target.value })}
                  placeholder="e.g., Yes, Strongly Agree, etc."
                  className="h-8 shadow-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`meaning-${index}`} className="text-xs text-muted-foreground">
                  Meaning
                </Label>
                <Textarea
                  id={`meaning-${index}`}
                  value={option.meaning}
                  onChange={(e) => updateOption(index, { meaning: e.target.value })}
                  placeholder="What this answer means..."
                  className="min-h-[60px] text-sm shadow-none"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeOption(index)}
              disabled={options.length <= 2}
              className="shadow-none"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
      {options.length < 2 && (
        <p className="text-xs text-muted-foreground">
          At least 2 answer options are required.
        </p>
      )}
    </div>
  );
}

