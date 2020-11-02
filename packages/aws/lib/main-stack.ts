import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import {
  HttpApi,
  HttpMethod,
  LambdaProxyIntegration,
} from '@aws-cdk/aws-apigatewayv2';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { ManagedPolicy, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { App, GitHubSourceCodeProvider } from '@aws-cdk/aws-amplify';
import { BuildSpec } from '@aws-cdk/aws-codebuild';

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const role = new Role(this, 'IndexRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole'
        ),
        ManagedPolicy.fromAwsManagedPolicyName('ComprehendFullAccess'),
      ],
    });
    const indexFn = new NodejsFunction(this, 'IndexFunction', {
      entry: '../backend/src/index.ts',
      role,
      environment: {
        LOWER_LIMIT_SCORE: '0.5',
      },
    });

    const httpApi = new HttpApi(this, 'HttpApi', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [HttpMethod.GET, HttpMethod.OPTIONS],
        allowHeaders: ['*'],
      },
    });
    httpApi.addRoutes({
      path: '/syntax-highlighted-text',
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({ handler: indexFn }),
    });

    const amplifyApp = new App(this, 'AmplifyApp', {
      appName: 'NSH',
      environmentVariables: {
        REACT_APP_API_URL: httpApi.url!,
      },
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: 'intercept6',
        repository: 'natural-language-syntax-highlight',
        oauthToken: SecretValue.secretsManager(
          'github-token-for-amplify-console'
        ),
      }),
      buildSpec: BuildSpec.fromObject({
        version: '1.0',
        applications: [
          {
            frontend: {
              phases: {
                preBuild: {
                  commands: ['nvm use $VERSION_NODE_12', 'yarn install'],
                },
                build: {
                  commands: ['yarn run build'],
                },
              },
              artifacts: {
                baseDirectory: 'build',
                files: ['**/*'],
              },
              cache: {
                paths: ['node_modules/**/*'],
              },
            },
            appRoot: 'packages/frontend',
          },
        ],
      }),
    });

    amplifyApp.addBranch('master', {
      branchName: 'master',
    });
  }
}
