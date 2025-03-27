import  express, { Router } from'express'

import {
    create, login, verifyEmail, resendVerificationCode,logOut
}from "../Controllers/user.controller.js"
const router=express.Router()
router.post("/register-user",create)
router.post("/login",login)
router.post("/logout",logOut)
router.post("/verify-email",verifyEmail)
router.post("/resend-code",resendVerificationCode)

export default router