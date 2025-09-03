'use client';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '@/theme/theme';
import '@/styles/App.css';
import '@/styles/Markdown.scss';
import '@/styles/Contact.css';
import '@/styles/Plugins.css';
import AllProviders from '../src/providers';

function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: any }>) {
  return (
    <ChakraProvider theme={theme}>
      <AllProviders>
        <Component {...pageProps} />
      </AllProviders>
    </ChakraProvider>
  );
}

export default App;
