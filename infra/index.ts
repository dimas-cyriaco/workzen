import * as pulumi from '@pulumi/pulumi';
import ApplicationDeploymentBucket from './components/application-deployment-bucket';

import GithubDeployer from './components/GithubDeployer';

// TODO: verificar se stack é 'production' e não está sendo rodado do CI.

const stack = pulumi.getStack();
const isProd = stack === 'production';

const homepageBucket = new ApplicationDeploymentBucket('homepage-deployment-bucket', {
  applicationName: `homepage_${stack}`,
})

if (isProd) {
  new GithubDeployer('github-deploy-user');
}

export const bucketName = homepageBucket.id;
export const homepageUrl = homepageBucket.websiteURL;
