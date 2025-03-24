"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function createScore(score: number) {
  const user = await currentUser();

  if (!user) {
    return { success: false, error: "User not found" };
  }

  const userName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return "anonymous";
  };

  try {
    const newScore = await prisma.score.create({
      data: {
        username: userName(),
        score,
        userId: user.id,
      },
    });
    return { success: true, data: newScore };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du score:", error);
    return { success: false, error: "Erreur lors de la sauvegarde du score" };
  }
}

export async function getTopScores() {
  try {
    const scores = await prisma.score.findMany({
      orderBy: {
        score: "desc",
      },
      take: 10,
    });
    return scores;
  } catch (error) {
    console.error("Erreur lors de la récupération des scores:", error);
    return [];
  }
}
