import { ethers } from 'ethers';

export const getWeb3Provider = (): ethers.providers.Web3Provider => {
  return new ethers.providers.Web3Provider(window.ethereum);
};