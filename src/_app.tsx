import React from "react";
import type { AppProps } from "next/app";
import axios from "axios";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_AXIOS_BASE_URL;

export default function App({ Component, pageProps }: AppProps){
    return(
        <Component {...pageProps} />
    )
}