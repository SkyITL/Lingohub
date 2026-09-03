import type { Metadata } from "next";
import RoadmapExperience from "@/components/roadmap/RoadmapExperience";

export const metadata: Metadata = {
  title: "Learning Roadmap | LingoHub",
  description:
    "Enter linguistics through familiar questions, then build toward formal concepts, academic readings, and olympiad problems.",
};

export default function RoadmapPage() {
  return <RoadmapExperience />;
}
