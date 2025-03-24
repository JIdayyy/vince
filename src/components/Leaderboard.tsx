import { getTopScores } from "@/app/actions";

export default async function Leaderboard() {
  const scores = await getTopScores();

  return (
    <div className="bg-black/50 rounded-lg p-4 max-w-md w-full">
      <h2 className="text-white text-xl font-bold mb-4 text-center">
        Meilleurs Scores
      </h2>
      <div className="space-y-2">
        {scores.map((score, index) => (
          <div
            key={score.id}
            className="flex justify-between items-center bg-black/30 p-2 rounded"
          >
            <span className="text-white">#{index + 1}</span>
            <span className="text-white">Joueur {score.username}</span>
            <span className="text-white font-bold">{score.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
