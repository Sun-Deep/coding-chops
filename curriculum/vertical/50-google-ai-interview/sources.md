# Sources

The same reporting as `posts/02-google-interview/README.md`, all going back
to Business Insider, which saw an internal Google document.

- Google is piloting a "code comprehension" interview where candidates use
  Gemini to read, debug and improve existing code; a Google spokesperson
  confirmed the pilot and Gemini. (Entrepreneur and Tekedia, 8 May 2026)
- "Interviewers will evaluate AI fluency, including prompt engineering,
  output validation, and debugging skills," quoted from the document. The
  three chips use those words.
- Junior and mid-level roles, select US teams, from the second half of 2026.
- 20 October 2026: the formats have expanded but are still pilots, and
  Google has not announced plans to eliminate conventional coding
  interviews. (Tech Times, 22 October 2026)
- "LeetCode is dead" is the online reaction the reel answers, not a claim
  from any of the sources (Blind; coverage summarised by Yahoo Finance).

Not used: round length, codebase size and tooling, which only interview-prep
blogs report and which disagree.

- https://www.entrepreneur.com/business-news/google-is-testing-a-new-rule-transform-job-interviews
- https://www.tekedia.com/google-rewrites-tech-recruitment-plans-to-let-software-engineers-use-ai-assistants-in-job-interviews/
- https://www.techtimes.co.uk/google-ai-fluency-software-engineering-interviews-1809326
- https://finance.yahoo.com/sectors/technology/articles/asking-kid-math-test-without-151500986.html
- https://www.businessinsider.com/google-job-interview-software-engineers-ai-assistant-coding-2026-5 (original, not read directly)

## The code

The binary search, the example fix and the real fix are in
`src/vertical/50-google-ai-interview/snippets.ts`. The example fix is ours,
written to show what output validation catches; the reel labels it as an
example and never presents it as Gemini's output.
