import express from "express";
import { SearchArticles } from "../controller/SearchArticles.js";
import { addArticle } from "../controller/AddArticles.js";
import { uploadArticle } from '../controller/UploadArticle.js';
import { bulkSearch } from "../controller/bulkSearch.js";
import { SearchArticlesAdvance } from "../controller/SearchArticlesAdvance.js";
import { ShowArticles, getArticlesAdmin, deleteArticlesAdmin } from '../controller/ShowArticles.js';
import { ViewArchives } from '../controller/ViewArchives.js';
import { pageTemplate, getPageTemplateAdmin, deletePageTemplateAdmin, pageTemplateAdvance } from '../controller/pageTemplate.js';
import { ViewXMLToJson } from "../controller/ViewXMLToJson.js";
import { login, signup, tokenValidate, getUser, updateUser, deleteUser, forgotUser, getUserId, logout } from "../controller/SignUp.js";
import { getDashboardCount } from "../controller/adminDashboard.js";
import { getSildePic, postSildePic, deleteSildePic } from "../controller/adminWebpage.js";
import { copyRightsTemplate, getCopyRightsTemplateAdmin, deleteCopyRightsTemplateAdmin, copyRightsTemplateAdvance } from "../controller/copyRights.js";
// import { test } from "../controller/testFile.js";
import { companyProfile, companyProfileAdvance, getCompanyProfileAdmin } from "../controller/companyProfile.js";

import verifyToken from "../middleware/pearlAuth.js"

const route = express.Router();

route.get('/search', SearchArticles);
route.post('/search', SearchArticlesAdvance);
route.post("/addArticle", addArticle);
route.post("/uploadArticle", uploadArticle);
route.post("/bulkSearch", bulkSearch);
route.get('/showArticles', ShowArticles);
/////////////////////////////////////////////
route.get('/viewArchives', ViewArchives);
route.post('/pageTemplate', pageTemplate);
route.get('/pageTemplate', pageTemplateAdvance);
route.get('/ViewXMLToJson', ViewXMLToJson);
// ADMIN
route.post('/login', login);
route.post('/signup', signup);
route.get('/tokenValidate', tokenValidate);
route.get('/getUser', verifyToken, getUser);
route.get('/getUserId', verifyToken, getUserId);
route.put('/updateUser', verifyToken, updateUser);
route.delete('/deleteUser', verifyToken, deleteUser);
route.get('/getArticlesAdmin', verifyToken, getArticlesAdmin);
route.delete('/deleteArticlesAdmin', verifyToken, deleteArticlesAdmin);
route.get('/getPageTemplateAdmin', verifyToken, getPageTemplateAdmin);
route.delete('/deletePageTemplateAdmin', verifyToken, deletePageTemplateAdmin);
route.get('/getDashboardCount', verifyToken, getDashboardCount);
route.get('/forgotUser', forgotUser);
route.get('/logout', verifyToken, logout);
route.get('/getSildePic', verifyToken, getSildePic); // Web page slide get
route.post('/postSildePic', verifyToken, postSildePic);
route.delete('/deleteSildePic', verifyToken, deleteSildePic); 
route.post('/copyRightsTemplate', verifyToken, copyRightsTemplate);
route.get('/getCopyRightsTemplateAdmin', verifyToken, getCopyRightsTemplateAdmin);
route.delete('/deleteCopyRightsTemplateAdmin', verifyToken, deleteCopyRightsTemplateAdmin); 
route.get('/copyRightsTemplateAdvance', verifyToken, copyRightsTemplateAdvance);
// route.post('/test', test);
route.post('/companyProfile', companyProfile)
route.post('/companyProfileAdvance', companyProfileAdvance)

export default route;