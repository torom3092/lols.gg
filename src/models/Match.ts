import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema({
  name: String,
  puuid: String,
  championName: String,
  kills: Number,
  deaths: Number,
  assists: Number,
  teamPosition: String,
  win: Boolean,
});

const MatchSchema = new mongoose.Schema({
  matchId: { type: String, unique: true },
  gameDate: String,
  players: [PlayerSchema],
});

export default mongoose.models.Match || mongoose.model("Match", MatchSchema);
