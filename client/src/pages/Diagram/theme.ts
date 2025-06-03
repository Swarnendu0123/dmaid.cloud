import { HighlightStyle } from "@codemirror/language";
import {
  mindmapTags,
  pieTags,
  flowchartTags,
  sequenceTags,
  journeyTags,
  requirementTags,
  ganttTags,
} from "codemirror-lang-mermaid";

export const myHighlightStyle = HighlightStyle.define([
  // Mindmaps
  { tag: mindmapTags.diagramName, color: "#7a3faa" }, // darker purple
  { tag: mindmapTags.lineText1, color: "#a36f5d" }, // darker tan
  { tag: mindmapTags.lineText2, color: "#1e6b1e" }, // darker green
  { tag: mindmapTags.lineText3, color: "#a00000" }, // darker red
  { tag: mindmapTags.lineText4, color: "#990066" }, // darker magenta
  { tag: mindmapTags.lineText5, color: "#2e76b0" }, // darker blue

  // Pie charts
  { tag: pieTags.diagramName, color: "#7a3faa" },
  { tag: pieTags.lineComment, color: "#a36f5d" },
  { tag: pieTags.number, color: "#1e6b1e" },
  { tag: pieTags.showData, color: "#2e76b0" }, // darker blue keyword-ish
  { tag: pieTags.string, color: "#990066" },
  { tag: pieTags.title, color: "#2e76b0" },
  { tag: pieTags.titleText, color: "#a00000" },

  // Flowcharts
  { tag: flowchartTags.diagramName, color: "#7a3faa" },
  { tag: flowchartTags.keyword, color: "#2e76b0" },
  { tag: flowchartTags.lineComment, color: "#a36f5d" },
  { tag: flowchartTags.link, color: "#1e6b1e" },
  { tag: flowchartTags.nodeEdge, color: "#a00000" },
  { tag: flowchartTags.nodeEdgeText, color: "#990066" },
  { tag: flowchartTags.nodeId, color: "#2e76b0" },
  { tag: flowchartTags.nodeText, color: "#1e6b1e" },
  { tag: flowchartTags.number, color: "#1e6b1e" },
  { tag: flowchartTags.orientation, color: "#990066" },
  { tag: flowchartTags.string, color: "#990066" },

  // Sequence diagrams
  { tag: sequenceTags.diagramName, color: "#7a3faa" },
  { tag: sequenceTags.arrow, color: "#1e6b1e" },
  { tag: sequenceTags.keyword1, color: "#2e76b0" },
  { tag: sequenceTags.keyword2, color: "#a00000" },
  { tag: sequenceTags.lineComment, color: "#a36f5d" },
  { tag: sequenceTags.messageText1, color: "#990066" },
  { tag: sequenceTags.messageText2, color: "#1e6b1e" },
  { tag: sequenceTags.nodeText, color: "#2e76b0" },
  { tag: sequenceTags.position, color: "#990066" },

  // User journeys
  { tag: journeyTags.diagramName, color: "#7a3faa" },
  { tag: journeyTags.actor, color: "#2e76b0" },
  { tag: journeyTags.keyword, color: "#2e76b0" },
  { tag: journeyTags.lineComment, color: "#a36f5d" },
  { tag: journeyTags.score, color: "#1e6b1e" },
  { tag: journeyTags.text, color: "#990066" },

  // Requirement diagrams
  { tag: requirementTags.diagramName, color: "#7a3faa" },
  { tag: requirementTags.arrow, color: "#1e6b1e" },
  { tag: requirementTags.keyword, color: "#2e76b0" },
  { tag: requirementTags.lineComment, color: "#a36f5d" },
  { tag: requirementTags.number, color: "#1e6b1e" },
  { tag: requirementTags.quotedString, color: "#990066" },
  { tag: requirementTags.unquotedString, color: "#990066" },

  // Gantt charts
  { tag: ganttTags.diagramName, color: "#7a3faa" },
  { tag: ganttTags.keyword, color: "#2e76b0" },
  { tag: ganttTags.lineComment, color: "#a36f5d" },
  { tag: ganttTags.string, color: "#990066" },
]);
