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
      'deployer-secret-access-key',
      {
        repository: 'workzen',
        secretName: 'AWS_SECRET_ACCESS_KEY',
        encryptedValue: githubDeployAccessKey.encryptedSecret,
      },
      {
        parent: this,
      }
    );

    new github.ActionsSecret(
      'deployer-access-key-id',
      {
        repository: 'workzen',
        secretName: 'AWS_ACCESS_KEY_ID',
        encryptedValue: githubDeployAccessKey.id,
      },
      {
        parent: this,
      }
    );
  }
}

export default GithubDeployer;

// curl -H "Accept: application/vnd.github+json" -H "Authorization: token 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" https://api.github.com/repos/dimas-cyriaco/workzen/actions/secrets/public-key
