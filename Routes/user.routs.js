import  express, { Router } from'express'

import {
    create, login, verifyEmail, resendVerificationCode,logOut,authLimiter
}from "../Controllers/user.controller.js"
const router=express.Router()
router.post("/register-user",create)
router.post("/login",login)
router.post("/logout",logOut)
router.post("/verify-email",verifyEmail)
router.post("/resend-code", authLimiter, resendVerificationCode)

export default router