import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  id: string;
  role: string;
}

export const generalAccessToken = async (payload: JwtPayload): Promise<string> => {
  const access_token = jwt.sign(
    { ...payload },
    process.env.ACCESS_TOKEN as string,
    { expiresIn: '1h' }
  );
  return access_token;
};

export const generalRefreshToken = async (payload: JwtPayload): Promise<string> => {
  const refresh_token = jwt.sign(
    { ...payload },
    process.env.REFRESH_TOKEN as string,
    { expiresIn: '365d' }
  );
  return refresh_token;
};

export const refreshTokenJwtService = async (token: string): Promise<{ status: string; message: string; access_token?: string }> => {
  return new Promise((resolve, reject) => {
    try {
      jwt.verify(token, process.env.REFRESH_TOKEN as string, async (err, user: any) => {
        if (err) {
          return resolve({
            status: 'ERR',
            message: 'The authentication failed',
          });
        }

        const { payload } = user;
        const access_token = await generalAccessToken({
          id: payload?.id,
          role: payload?.role,
        });

        resolve({
          status: 'OK',
          message: 'Refresh Token success',
          access_token,
        });
      });
    } catch (e) {
      reject(e);
    }
  });
};
