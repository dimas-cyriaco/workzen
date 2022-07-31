import * as pulumi from '@pulumi/pulumi'
import * as github from '@pulumi/github'

import GithubDeployer from './components/users/github-deployer'
import ApplicationDeploymentBucket from './components/buckets/application-deployment'

// TODO: verificar se stack é 'production' e não está sendo rodado do CI.

// let config = new pulumi.Config();
// config.require("github:token");

const stack = pulumi.getStack()
// const isProd = stack === 'production'

const homepageBucket = new ApplicationDeploymentBucket({
  name: 'homepage-deployment-bucket',
  applicationName: `homepage_${stack}`,
  sourceFolder: '../dist/apps/homepage',
})

github.getActionsPublicKey({
  repository: 'workzen',
})

new github.ActionsSecret(
  `${stack}-aws-region`,
  {
    repository: 'workzen',
    secretName: `${stack.toUpperCase()}_AWS_REGION`,
    plaintextValue: 'sa-east-1',
  }
)

// if (isProd) {
const githubDeployer = new GithubDeployer({ name: 'github-deploy-user' })
// }

export const bucketName = homepageBucket.id
export const homepageUrl = homepageBucket.websiteEndpoint
export const accessKeyId = githubDeployer.accessKeyId
export const secretAccessKey = githubDeployer.secretAccessKey
