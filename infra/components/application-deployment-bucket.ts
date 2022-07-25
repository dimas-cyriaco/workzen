import {
  ComponentResource,
  ComponentResourceOptions,
  interpolate,
  Output,
} from '@pulumi/pulumi';
import * as github from '@pulumi/github';

import PublicWebBucket from './PublicWebBucket';
import { log } from 'console';

interface ApplicationDeploymentBucketOptions {
  applicationName: string;
}

class ApplicationDeploymentBucket extends ComponentResource {
  id: Output<string>;
  websiteURL: Output<string>;

  constructor(
    name: string,
    bucketOptions: ApplicationDeploymentBucketOptions,
    opts: ComponentResourceOptions = {}
  ) {
    super('workzen:bucket:ApplicationDeployment', name, {}, opts);

    const applicationBucket = new PublicWebBucket(
      `${bucketOptions.applicationName.toLowerCase()}-deployment-bucket`,
      {
        parent: this,
      }
    );

    github.getActionsPublicKey({
      repository: 'workzen',
    });

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
    );

    this.id = applicationBucket.id;
    this.websiteURL = applicationBucket.websiteURL;

    this.registerOutputs({
      id: this.id,
      websiteURL: this.websiteURL,
    });
  }
}

export default ApplicationDeploymentBucket;
