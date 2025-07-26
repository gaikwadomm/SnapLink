import { Router } from "express";
import {
  addUrl,
  getUserLinks,
  deleteLink,
  updateLink,
  filterByTags,
  createLinkCollection,
  getUserCollections,
} from "../controllers/links.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/addUrl").post(verifyJWT, addUrl);
router.route("/saved-links").get(verifyJWT, getUserLinks);
router.route("/delete-link/:id").delete(verifyJWT, deleteLink);
router.route("/update-link/:id").patch(verifyJWT, updateLink);
router.route("/filter-by-tags").get(verifyJWT, filterByTags);
router.route("/create-link-collection").post(verifyJWT, createLinkCollection);
router.route("/get-collections").get(verifyJWT, getUserCollections);

export default router;
