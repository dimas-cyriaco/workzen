import { iam } from '@pulumi/aws';
import { ComponentResource, ComponentResourceOptions } from '@pulumi/pulumi';
import * as github from '@pulumi/github';

import S3UploaderUser from './S3UploaderUser';

class GithubDeployer extends ComponentResource {
  constructor(name: string, opts: ComponentResourceOptions = {}) {
    super('workzen:user:GithubDeployer', name, {}, opts);

    const githubDeployUser = new S3UploaderUser('github-deploy-user', {
      parent: this,
    });

    const githubDeployAccessKey = new iam.AccessKey(
      'github-deploy-access-key',
      { user: githubDeployUser.name },
      { parent: this }
    );

    github.getActionsPublicKey({
      repository: 'workzen',
    });

    new github.ActionsSecret(
      'deployer-action-secret',
      {
        repository: 'workzen',
        secretName: 'AWS_DEPLOYER_SECRET_KEY',
        encryptedValue: githubDeployAccessKey.encryptedSecret,
      },
      {
        parent: this,
      }
    );
  }
}

export default GithubDeployer;

// curl -H "Accept: application/vnd.github+json" -H "Authorization: token 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" https://api.github.com/repos/dimas-cyriaco/workzen/actions/secrets/public-key