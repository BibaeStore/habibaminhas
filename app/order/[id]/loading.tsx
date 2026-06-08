import Image from "next/image";

export default function OrderLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ivory">
      <div className="flex flex-col items-center gap-6">
        <div className="animate-flip">
          <Image
            src="/logo/habiba-minhas-icon-t.png"
            alt="Loading"
            width={100}
            height={100}
            className="h-24 w-24"
            priority
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="font-display text-2xl italic text-ink">Loading your order...</p>
          <p className="text-[13px] text-muted">Just a moment</p>
        </div>
      </div>
    </div>
  );
}
