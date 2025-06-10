import axios from "axios";

const authService = {
  login: async (
    username: string,
    email: string,
    password: string
  ): Promise<string> => {
    const response: any = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/User/login`,
      {
        username: username,
        email: email,
        password: password,
      }
    );
    return response;
  },

  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<string> => {
    console.log("Registering user with:", {
      username,
      email,
      password,
    });
    const response: any = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/User/register`,
      {
        username: username,
        email: email,
        password: password,
      }
    );
    console.log(response.status);
    return response;
  },
};

export default authService;
