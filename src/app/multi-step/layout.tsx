import Header from '@/app/multi-step/header';

export default function MultiStepLayoutTwo({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#a16207] to-[#fde047] @container">
      <Header />
      {children}
    </div>
  );
}
