/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

const BaseGateway = () => {
  const baseUrl = import.meta.env.VITE_API_URL;

  async function get<T>(
    domainUrl: string,
    options?: AxiosRequestConfig<any>,
  ): Promise<AxiosResponse<T, any, object>> {
    const url = `${baseUrl}/${domainUrl}`;

    return await axios.get<T>(url, options);
  }

  async function post(
    domainUrl: string,
    data: any,
    options?: AxiosRequestConfig<any>,
  ): Promise<AxiosResponse<any, any, object>> {
    const url = `${baseUrl}/${domainUrl}`;

    return await axios.post(url, data, options);
  }

  return {
    get,
    post,
  };
};

export default BaseGateway;
