import jwt from "jsonwebtoken"
import {User} from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const verifyJWT = asyncHandler(async (req, _, next)=>{
    try {
        let token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim()

        if(!token){
            throw new ApiError(401, "You are not authorized to access this resource")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401, "Unacthorized Access")
        }

        console.log("Done with user verification")
        req.user = user;
    } catch (error) {
        throw new ApiError(401, error?.message || "You are not authorized to access this resource")
    }
})