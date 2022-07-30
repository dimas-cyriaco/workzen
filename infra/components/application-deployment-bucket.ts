import { Bucket } from '@pulumi/aws/s3'
import * as github from '@pulumi/github'
import {
  ComponentResource,
  ComponentResourceOptions,
  Output,
  interpolate,
} from '@pulumi/pulumi'

import PublicWebBucket from './PublicWebBucket'

interface ApplicationDeploymentBucketOptions {
  applicationName: string
  sourceFolder?: string
}

class ApplicationDeploymentBucket extends ComponentResource {
  bucket: Bucket
  id: Output<string>
  websiteEndpoint: Output<string>

  constructor(
    name: string,
    bucketOptions: ApplicationDeploymentBucketOptions,
    opts: ComponentResourceOptions = {}
  ) {
    super('workzen:bucket:ApplicationDeployment', name, {}, opts)

    const applicationBucket = new PublicWebBucket(
      `${bucketOptions.applicationName.toLowerCase()}-deployment-bucket`,
      { sourceFolder: bucketOptions.sourceFolder },
      {
        parent: this,
      }
    )

    github.getActionsPublicKey({
      repository: 'workzen',
    })

    new github.ActionsSecret(
      'application-deployment-action-secret',
      {
        plaintextValue: interpolate`${applicationBucket.bucketName}`,
        repository: 'workzen',
        secretName: `${bucketOptions.applicationName}_BUCKET`.toUpperCase(),
      },
      {
        parent: this,
      }
    )

    this.bucket = applicationBucket.bucket
    this.id = applicationBucket.id
    this.websiteEndpoint = applicationBucket.websiteEndpoint

    this.registerOutputs({
      bucket: this.bucket,
      id: this.id,
      websiteEndpoint: this.websiteEndpoint,
    })
  }
}

export default ApplicationDeploymentBucket
