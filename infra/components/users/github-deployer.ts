import { iam, secretsmanager } from '@pulumi/aws'
import * as github from '@pulumi/github'
import { Output, all } from '@pulumi/pulumi'

import S3Uploader from './s3-uploader'

interface GithubDeployerParams {
  name: string
}

class GithubDeployer extends S3Uploader {
  secretAccessKey: Output<string>
  accessKeyId: Output<string>

  constructor({ name }: GithubDeployerParams) {
    super({
      type: 'workzen:user:GithubDeployer',
      name,
    })

    const accessKey = new iam.AccessKey(
      'github-deploy-access-key',
      { user: this.name },
      { parent: this }
    )

    const secret = new secretsmanager.Secret(name)
    new secretsmanager.SecretVersion(name, {
      secretId: secret.id,
      secretString: all([accessKey.id, accessKey.secret]).apply(
        ([accessKeyId, secretAccessKey]) =>
          JSON.stringify({
            accessKeyId,
            secretAccessKey,
          })
      ),
    })

    github.getActionsPublicKey({
      repository: 'workzen',
    })

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
    )

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
    )

    this.secretAccessKey = accessKey.encryptedSecret
    this.accessKeyId = accessKey.id

    this.registerOutputs({
      secretAccessKey: this.secretAccessKey,
      accessKeyId: this.accessKeyId,
    })
  }
}

export default GithubDeployer
