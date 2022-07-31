import * as github from '@pulumi/github'
import { interpolate } from '@pulumi/pulumi'

import PublicWebBucket from './public-web'

interface ApplicationDeploymentBucketParams {
  name: string
  applicationName: string
  sourceFolder?: string
}

class ApplicationDeploymentBucket extends PublicWebBucket {
  constructor({
    name,
    applicationName,
    sourceFolder,
  }: ApplicationDeploymentBucketParams) {
    super({
      type: 'workzen:bucket:ApplicationDeployment',
      name,
      sourceFolder: sourceFolder,
    })

    github.getActionsPublicKey({
      repository: 'workzen',
    })

    new github.ActionsSecret(
      'application-deployment-action-secret',
      {
        plaintextValue: interpolate`${this.bucketName}`,
        repository: 'workzen',
        secretName: `${applicationName}_BUCKET`.toUpperCase(),
      },
      {
        parent: this,
      }
    )

    this.registerOutputs({
      bucket: this.bucket,
      id: this.id,
      websiteEndpoint: this.websiteEndpoint,
    })
  }
}

export default ApplicationDeploymentBucket
