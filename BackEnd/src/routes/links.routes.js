import { Router } from "express";
import {addUrl, getUserLinks} from "../controllers/links.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/addUrl").post(verifyJWT, addUrl);
router.route("/saved-links").get(verifyJWT, getUserLinks);

export default router;