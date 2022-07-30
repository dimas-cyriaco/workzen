import * as pulumi from '@pulumi/pulumi'

import GithubDeployer from './components/GithubDeployer'
import ApplicationDeploymentBucket from './components/application-deployment-bucket'

// TODO: verificar se stack é 'production' e não está sendo rodado do CI.

// let config = new pulumi.Config();
// config.require("github:token");

const stack = pulumi.getStack()
const isProd = stack === 'production'

const homepageBucket = new ApplicationDeploymentBucket(
  'homepage-deployment-bucket',
  {
    applicationName: `homepage_${stack}`,
    sourceFolder: '../dist/apps/homepage',
  }
)

if (isProd) {
  new GithubDeployer('github-deploy-user')
}

export const bucketName = homepageBucket.id
export const homepageUrl = homepageBucket.websiteEndpoint
