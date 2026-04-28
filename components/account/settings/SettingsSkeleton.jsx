"use client";

export default function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="zova-account-section-card animate-pulse"
          style={{ height: 180, animationDelay: `${index * 60}ms` }}
        />
      ))}
    </div>
  );
}
