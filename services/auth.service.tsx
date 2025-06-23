import axios from "axios";

const authService = {
  login: async (username: string, password: string): Promise<string> => {
    const response: any = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/User/login`,
      {
        username,
        password,
      }
    );
    return response;
  },

  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<string> => {
    const response: any = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/User/register-customer`,
      {
        username: username,
        email: email,
        password: password,
      }
    );
    return response;
  },
};

export default authService;
