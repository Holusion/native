
import AbortController from "abort-controller";
import FormData from "formdata-node";
import { enableFetchMocks } from 'jest-fetch-mock'
enableFetchMocks();

global.FormData = FormData;
global.AbortController = AbortController;