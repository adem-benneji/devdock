import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "generate": {
    "input": "Paste CSV with unique column headers and an equal number of cells in each row.",
    "action": "Click Run tool, then copy the result into a README or Markdown document that supports tables.",
    "output": "Markdown source with a header separator and table rows. Special characters are escaped and multiline cells use <br>. The app displays source, not rendered HTML.",
    "exampleInput": "name,role\nAda,Developer",
    "exampleOutput": "| name | role |\n| --- | --- |\n| Ada | Developer |"
  }
};
