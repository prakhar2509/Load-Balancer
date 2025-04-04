import mongoose from 'mongoose';

const userConfigSchema = new mongoose.Schema({
    domain: { type: String, required: true, unique: true },
    servers: { type: [String], required: true },
    algorithm: { type: String, required: true, enum: ["round-robin", "least-connections", "ml-prediction", "random", "weighted-round-robin", "ip-hash", "sticky-session"] },
    weights: { type: [Number], default: [] },
});

export const UserConfig = mongoose.model("UserConfig", userConfigSchema);