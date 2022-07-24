import * as aws from '@pulumi/aws';
import * as awsNative from '@pulumi/aws-native';
import {
  ComponentResource,
  ComponentResourceOptions,
  Input,
  Output,
} from '@pulumi/pulumi';

class PublicWebBucket extends ComponentResource {
  id: Output<string>;
  arn: Output<string>;
  websiteURL: Output<string>;

  constructor(name: string, opts: ComponentResourceOptions = {}) {
    super('workzen:bucket:PublicWebBucket', name, {}, opts);

    const bucket = new awsNative.s3.Bucket(
      'homepage-bucket',
      {
        websiteConfiguration: {
          indexDocument: 'index.html',
        },
      },
      {
        parent: this,
      }
    );

    new aws.s3.BucketPolicy(
      'homepage-bucket-police',
      {
        bucket: bucket.id,
        policy: bucket.arn.apply((bucketArn: string) => {
          const output: Input<aws.iam.PolicyDocument> = {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: '*',
                Action: ['s3:GetObject'],
                Resource: [`${bucketArn}/*`],
              },
            ],
          };

          return output;
        }),
      },
      {
        parent: this,
      }
    );

    this.id = bucket.id;
    this.arn = bucket.arn;
    this.websiteURL = bucket.websiteURL;

    this.registerOutputs({
      id: bucket.id,
      arn: bucket.arn,
      websiteURL: bucket.websiteURL,
    });
  }
}

export default PublicWebBucket;