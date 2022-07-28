import { iam, secretsmanager } from '@pulumi/aws';
import {
  all,
  ComponentResource,
  ComponentResourceOptions,
  Output,
} from '@pulumi/pulumi';
import * as github from '@pulumi/github';

import S3UploaderUser from './S3UploaderUser';

class GithubDeployer extends ComponentResource {
  secretAccessKey: Output<string>;
  accessKeyId: Output<string>;

  constructor(name: string, opts: ComponentResourceOptions = {}) {
    super('workzen:user:GithubDeployer', name, {}, opts);

    const githubDeployUser = new S3UploaderUser('github-deploy-user', {
      parent: this,
    });

    const accessKey = new iam.AccessKey(
      'github-deploy-access-key',
      { user: githubDeployUser.name },
      { parent: this }
    );

    const secret = new secretsmanager.Secret(name);
    new secretsmanager.SecretVersion(name, {
      secretId: secret.id,
      secretString: all([accessKey.id, accessKey.secret])
        .apply(([accessKeyId, secretAccessKey]) =>
          JSON.stringify({
            accessKeyId,
            secretAccessKey,
          })
        ),
    });

    github.getActionsPublicKey({
      repository: 'workzen',
    });

    new github.ActionsSecret(
      'deployer-secret-access-key',
      {
        repository: 'workzen',
        secretName: 'AWS_SECRET_ACCESS_KEY',
        encryptedValue: accessKey.secret,
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
        encryptedValue: accessKey.id,
      },
      {
        parent: this,
      }
    );

    this.secretAccessKey = accessKey.encryptedSecret;
    this.accessKeyId = accessKey.id;

    this.registerOutputs({
      secretAccessKey: this.secretAccessKey,
      accessKeyId: this.accessKeyId,
    });
  }
}

export default GithubDeployer;

// curl -H "Accept: application/vnd.github+json" -H "Authorization: token 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" https://api.github.com/repos/dimas-cyriaco/workzen/actions/secrets/public-key
