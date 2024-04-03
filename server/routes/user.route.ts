import express from 'express';
import { 
    activateUser, 
    loginUser, 
    registerUser, 
    logoutUser, 
    updateAccessToken, 
    getUserInfo, 
    socialAuth, 
    updateUserInfo, 
    updatePassword,
    updateProfilePicture
} from '../controllers/user.controller';
import { isAuthenticated, validateRole } from '../middleware/auth';

const userRouter = express.Router();

// POST
userRouter.post('/registration', registerUser);
userRouter.post('/activate-user', activateUser);
userRouter.post('/social-auth', socialAuth);
userRouter.post('/login-user', loginUser);

// GET
userRouter.get('/logout', isAuthenticated, logoutUser);
userRouter.get('/refresh', updateAccessToken);
userRouter.get('/me', isAuthenticated, getUserInfo);

// PUT
userRouter.put('/update-user', isAuthenticated, updateUserInfo);
userRouter.put('/update-password', isAuthenticated, updatePassword);
userRouter.put('/update-avatar', isAuthenticated, updateProfilePicture);

// DELETE


export default userRouter;