import { iam } from '@pulumi/aws'
import { ComponentResource, Output } from '@pulumi/pulumi'

const defaultType = 'workzen:user:S3UploaderUser'

interface S3UploaderUserParams {
  type: string
  name: string
}

class S3Uploader extends ComponentResource {
  name: Output<string>

  constructor({ type = defaultType, name }: S3UploaderUserParams) {
    super(type, name, {}, {})

    const user = new iam.User(
      's3-uploader-user',
      {},
      {
        parent: this,
      }
    )

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
    )

    this.name = user.name

    this.registerOutputs({
      name: user.name,
    })
  }
}

export default S3Uploader
