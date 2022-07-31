import * as aws from '@pulumi/aws'
import { Bucket } from '@pulumi/aws/s3'
import * as pulumi from '@pulumi/pulumi'
import { ComponentResource, Input, Output } from '@pulumi/pulumi'
import * as fs from 'fs'
import * as mime from 'mime'
import * as path from 'path'

interface PublicWebBucketParams {
  name: string
  sourceFolder?: string
  type?: string
}

class PublicWebBucket extends ComponentResource {
  arn: Output<string>
  bucket: Bucket
  bucketName: Output<string | undefined>
  id: Output<string>
  websiteEndpoint: Output<string>

  constructor({
    name,
    sourceFolder,
    type = 'workzen:bucket:PublicWebBucket',
  }: PublicWebBucketParams) {
    super(type, name, {}, {})

    const bucket = new aws.s3.Bucket(
      'homepage-bucket',
      {
        acl: 'public-read',
        website: {
          indexDocument: 'index.html',
        },
      },
      {
        parent: this,
      }
    )

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
          }

          return output
        }),
      },
      {
        parent: this,
      }
    )

    if (sourceFolder) {
      uploadDirectory(sourceFolder, bucket)
    }

    this.arn = bucket.arn
    this.bucket = bucket
    this.bucketName = bucket.bucket
    this.id = bucket.id
    this.websiteEndpoint = bucket.websiteEndpoint

    this.registerOutputs({
      arn: this.arn,
      bucket: this.bucket,
      bucketName: this.bucketName,
      id: this.id,
      websiteEndpoint: this.websiteEndpoint,
    })
  }
}

const uploadDirectory = (directoryPath: string, bucket: Bucket) => {
  forEachFile(directoryPath, (filePath: string) => {
    const relativePath = path.relative(directoryPath, filePath)

    let contentType = mime.getType(filePath) || 'application/x-directory'

    new aws.s3.BucketObject(relativePath, {
      acl: 'public-read',
      bucket,
      key: relativePath,
      source: new pulumi.asset.FileAsset(filePath),
      contentType,
    })
  })
}

const forEachFile = (currentDirPath: string, callback: Function) => {
  fs.readdirSync(currentDirPath).forEach(name => {
    var filePath = path.join(currentDirPath, name)
    var stat = fs.statSync(filePath)

    if (stat.isFile()) {
      callback(filePath)
    } else if (stat.isDirectory()) {
      forEachFile(filePath, callback)
    }
  })
}

export default PublicWebBucket
