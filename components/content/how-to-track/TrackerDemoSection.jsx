import SectionHeader from "@/components/content/shared/SectionHeader";
import LiveTrackerDemo from "@/components/content/how-to-track/LiveTrackerDemo";

export default function TrackerDemoSection() {
  return (
    <section className="zova-info-section">
      <SectionHeader
        kicker="Interactive Demo"
        title="What your tracking looks like"
        copy="This is a demo of a real ZOVA order tracker. Click each step to see what happens — and what notifications you receive."
      />
      <LiveTrackerDemo />
    </section>
  );
}
