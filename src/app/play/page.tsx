"use client";

import dynamic from "next/dynamic";

const Game = dynamic(() => import("../Game"), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen text-white bg-black flex items-center justify-center">
      Loading...
    </div>
  ),
});

export default function Home() {
  return <Game />;
}
