import Axios from 'axios';

const axios = Axios.create({
  baseURL: process.env.NEXT_FLEXI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  auth: {
    username: process.env.NEXT_FLEXI_API_USER!,
    password: process.env.NEXT_FLEXI_API_PASS!,
  },
});

export default axios;
