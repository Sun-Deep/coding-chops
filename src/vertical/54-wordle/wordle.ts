export type Feedback = 0 | 1 | 2;

export const feedback = (guess: string, answer: string): Feedback[] => {
  const left = answer.split("");
  const result: Feedback[] = [0, 0, 0, 0, 0];
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 2;
      left[i] = "";
    }
  }
  for (let i = 0; i < 5; i++) {
    if (result[i] === 2) continue;
    const at = left.indexOf(guess[i]);
    if (at !== -1) {
      result[i] = 1;
      left[at] = "";
    }
  }
  return result;
};

export const remaining = (
  answers: readonly string[],
  guess: string,
  answer: string,
) => {
  const pattern = feedback(guess, answer).join("");
  return answers.filter(
    (candidate) => feedback(guess, candidate).join("") === pattern,
  );
};
