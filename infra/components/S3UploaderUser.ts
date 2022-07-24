import { iam } from '@pulumi/aws';
import {
  ComponentResource,
  ComponentResourceOptions,
  Output,
} from '@pulumi/pulumi';

class S3UploaderUser extends ComponentResource {
  name: Output<string>;

  constructor(name: string, opts: ComponentResourceOptions = {}) {
    super('workzen:user:S3UploaderUser', name, {}, opts);

    const user = new iam.User(
      's3-uploader-user',
      {},
      {
        parent: this,
      }
    );

    new iam.UserPolicy(
      's3-uploader-user-policy',
      {
        user: user.name,
        policy: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Action: ['s3:*', 's3-object-lambda:*'],
              Resource: '*',
            },
          ],
        },
      },
      {
        parent: this,
      }
    );

    this.name = user.name;

    this.registerOutputs({
      name: user.name,
    });
  }
}

export default S3UploaderUser;
