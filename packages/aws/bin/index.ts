#!/usr/bin/env node
import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import { MainStack } from '../lib/main-stack';

const region = process.env.AWS_REGION;
if (region == null) {
  throw new Error('Environment variables AWS_REGION is null.');
}

const app = new App();
new MainStack(app, 'NaturalLanguageSyntaxHighlight', {
  env: { region },
});
