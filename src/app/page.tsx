import { Vortex } from "@/components/ui/vortex";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Page() {
  return (
    <div className="w-screen h-screen">
      <Vortex
        backgroundColor="black"
        rangeY={800}
        particleCount={500}
        baseHue={120}
        className="flex items-center flex-col justify-center px-2 md:px-10  py-4 w-full h-full"
      >
        <p className="text-white text-base font-bold text-center">
          Vincent2000 presents
        </p>
        <h1 className="text-white text-2xl md:text-6xl font-bold text-center">
          ACAB
        </h1>
        <Image
          src="/images/evolved_player.png"
          alt="evolved_player"
          width={100}
          height={100}
          className="animate-spin"
        />
        <p className="text-white text-sm md:text-xl max-w-xl mt-6 text-center">
          Saurez-vous les éviter tous ?
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <Link
            href="/play"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition duration-200 rounded-lg text-white shadow-[0px_2px_0px_0px_#FFFFFF40_inset]"
          >
            JOUER
          </Link>
        </div>
      </Vortex>
    </div>
  );
}
