export type AnswerType = "binary" | "likert5" | "likert7" | "custom";

export interface AnswerOption {
  id: string;
  label: string;
  meaning: string;
  order: number;
}

export interface QuestionData {
  date: string;
  question: string;
  summary: string;
  answerType: AnswerType;
  answerOptions: AnswerOption[];
  arguments?: {
    pro?: string;
    con?: string;
    byOption?: Record<string, { pro?: string; con?: string }>;
  };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export const answerTypePresets: Record<AnswerType, { answerOptions: Omit<AnswerOption, "meaning">[] }> = {
  binary: {
    answerOptions: [
      { id: "yes", label: "Yes", order: 0 },
      { id: "no", label: "No", order: 1 },
    ],
  },
  likert5: {
    answerOptions: [
      { id: "strongly-agree", label: "Strongly Agree", order: 0 },
      { id: "agree", label: "Agree", order: 1 },
      { id: "neutral", label: "Neutral", order: 2 },
      { id: "disagree", label: "Disagree", order: 3 },
      { id: "strongly-disagree", label: "Strongly Disagree", order: 4 },
    ],
  },
  likert7: {
    answerOptions: [
      { id: "strongly-agree", label: "Strongly Agree", order: 0 },
      { id: "agree", label: "Agree", order: 1 },
      { id: "somewhat-agree", label: "Somewhat Agree", order: 2 },
      { id: "neutral", label: "Neutral", order: 3 },
      { id: "somewhat-disagree", label: "Somewhat Disagree", order: 4 },
      { id: "disagree", label: "Disagree", order: 5 },
      { id: "strongly-disagree", label: "Strongly Disagree", order: 6 },
    ],
  },
  custom: {
    answerOptions: [],
  },
};

/**
 * Generate answer options from a preset type
 */
export function generateAnswerOptions(type: AnswerType): AnswerOption[] {
  const preset = answerTypePresets[type];
  return preset.answerOptions.map((opt) => ({
    ...opt,
    meaning: "",
  }));
}

