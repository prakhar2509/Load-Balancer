import { asyncHandler } from "../utils/asyncHandler.js";
import { UserConfig } from "../models/UserConfigs.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const addConfig = asyncHandler(async (req, res) => {
    const { domain, servers, algorithm } = req.body;
    
    if(!domain || !servers || !algorithm) {
        throw new ApiError(400, "Domain, servers and algorithm are required");
    }

    const config = await UserConfig.findOneAndUpdate(
        { domain },
        { servers, algorithm },
        { new: true, upsert: true } // Create a new document if it doesn't exist
    )
    if (!config) {
        throw new ApiError(500, "Failed to create or update the configuration");
    }
    res.send(new ApiResponse(200, config, "Configuration added successfully"));
});

const getUserConfig = asyncHandler(async (req, res) => {
    const { domain } = req.params;
    const config = await UserConfig.findOne({ domain });
    if (!config) {
        throw new ApiError(404, "Configuration not found");
    }

    res.send(new ApiResponse(200, config, "Configuration retrieved successfully"));
});

const removeConfig = asyncHandler(async (req, res) => {
    const { domain } = req.params;
    if (!domain) {
        throw new ApiError(400, "Domain is required");
    }
    const config = await UserConfig.findOneAndDelete({ domain });
    res.send(new ApiResponse(200, config, "Configuration removed successfully"));
});

export {addConfig, getUserConfig, removeConfig};