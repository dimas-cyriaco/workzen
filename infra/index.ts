import * as pulumi from '@pulumi/pulumi';

import GithubDeployer from './components/GithubDeployer';
import PublicWebBucket from './components/PublicWebBucket';

const stack = pulumi.getStack();
const isProd = stack === 'production';

const homepageBucket = new PublicWebBucket('homepage-bucket');

if (isProd) {
  new GithubDeployer('github-deploy-user');
}

export const bucketName = homepageBucket.id;
export const homepageUrl = homepageBucket.websiteURL;
