import { Router } from "express";
import {
  addUrl,
  getUserLinks,
  deleteLink,
  updateLink,
  filterByTags,
} from "../controllers/links.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/addUrl").post(verifyJWT, addUrl);
router.route("/saved-links").get(verifyJWT, getUserLinks);
router.route("/delete-link/:id").delete(verifyJWT, deleteLink);
router.route("/update-link/:id").patch(verifyJWT, updateLink);
router.route("/filter-by-tags").get(verifyJWT, filterByTags);

export default router;