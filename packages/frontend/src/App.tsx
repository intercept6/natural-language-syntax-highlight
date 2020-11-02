import * as React from 'react';
import { SyntaxHighLight } from './SyntaxHighLight';
import { CssBaseline } from '@material-ui/core';

export const App = () => (
  <CssBaseline>
    <div className="App">
      <SyntaxHighLight />
    </div>
  </CssBaseline>
);
