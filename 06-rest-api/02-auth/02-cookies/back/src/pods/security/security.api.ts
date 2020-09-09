import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserSession } from './security.api-model';
import { envConstants, headerConstants } from 'core/constants';
import { jwtMiddleware } from './security.middlewares';
import { jwtSignAlgorithm } from './security.constants';

export const securityApi = Router();

// NOTE: Mock users, never store clear passwords
const userList: User[] = [
  {
    id: '1',
    userName: 'admin',
    password: 'test',
    firstname: 'Admin Lucien',
    lastname: 'Clipson',
  },
  {
    id: '1',
    userName: 'user',
    password: 'test',
    firstname: 'User Chaim',
    lastname: 'Baughen',
  },
];

securityApi
  .post('/login', async (req, res) => {
    const { user, password } = req.body;
    const currentUser = userList.find(
      (u) => u.userName == user && u.password === password
    );

    if (currentUser) {
      const userSession = createUserSession(currentUser);
      res.send(userSession);
    } else {
      res.sendStatus(401);
    }
  })
  .post('/logout', jwtMiddleware, async (req, res) => {
    // NOTE: We cannot invalidate token using jwt libraries.
    // Different approachs:
    // - Short expiration times in token
    // - Black list tokens on DB
    res.sendStatus(200);
  });

const createUserSession = (user: User): UserSession => {
  const tokenPayload = { userId: user.id };
  const token = jwt.sign(tokenPayload, envConstants.TOKEN_AUTH_SECRET, {
    expiresIn: envConstants.ACCESS_TOKEN_EXPIRES_IN,
    algorithm: jwtSignAlgorithm,
  });

  return {
    firstname: user.firstname,
    lastname: user.lastname,
    token: `${headerConstants.bearer} ${token}`, // https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication
  };
};
