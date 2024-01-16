# About

This creates private container image repositories hosted in the [AWS Elastic Container Registry (ECR)](https://aws.amazon.com/ecr/) of your AWS Account using a cdktf program.

For equivalent examples see:

* [terraform](https://github.com/rgl/terraform-aws-ecr-example)
* [pulumi (aws classic provider)](https://github.com/rgl/pulumi-typescript-aws-classic-ecr-example)
* [pulumi (aws native provider)](https://github.com/rgl/pulumi-typescript-aws-native-ecr-example)

# Usage (on a Ubuntu Desktop)

Install the dependencies:

* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
* [Crane](https://github.com/google/go-containerregistry/releases).

Install `cdktf` into your home directory:

```bash
npm config set prefix ~/.npm/global
export PATH="~/.npm/global/bin:$PATH"
# see https://developer.hashicorp.com/terraform/tutorials/cdktf/cdktf-install
# see https://www.npmjs.com/package/cdktf-cli
npm install --global cdktf-cli@0.20.0
cdktf --version
```

This project was initially initialized as:

**NB** Do NOT actually execute this, as this project is already initialized.
This is here for documentation purposes ONLY. 

```bash
mkdir cdktf-typescript-aws-ecr-example
cd cdktf-typescript-aws-ecr-example
cdktf init \
  --template=typescript \
  --local \
  --providers=hashicorp/aws \
  --project-name=cdktf-typescript-aws-ecr-example \
  --project-description='Create private container images repositories hosted in ECR.'
rm -rf help
git init
git add .
```

Install this project dependencies:

```bash
npm ci
cdktf get
```

Set the AWS Account credentials using SSO:

```bash
# set the account credentials.
# see https://docs.aws.amazon.com/cli/latest/userguide/sso-configure-profile-token.html#sso-configure-profile-token-auto-sso
aws configure sso
# dump the configured profile and sso-session.
cat ~/.aws/config
# set the environment variables to use a specific profile.
export AWS_PROFILE=my-profile
unset AWS_ACCESS_KEY_ID
unset AWS_SECRET_ACCESS_KEY
unset AWS_DEFAULT_REGION
# show the user, user amazon resource name (arn), and the account id, of the
# profile set in the AWS_PROFILE environment variable.
aws sts get-caller-identity
```

Or, set the account credentials using an access key:

```bash
# set the account credentials.
# NB get these from your aws account iam console.
#    see Managing access keys (console) at
#        https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey
export AWS_ACCESS_KEY_ID='TODO'
export AWS_SECRET_ACCESS_KEY='TODO'
# set the default region.
export AWS_DEFAULT_REGION='eu-west-1'
# show the user, user amazon resource name (arn), and the account id.
aws sts get-caller-identity
```

Review [`main.ts`](main.ts).

Deploy the project:

```bash
cdktf deploy
```

Go to the AWS Management Console, open the ECR Container Registry service page,
and see the create repositories and images.

Destroy the project:

```bash
cdktf destroy
```

# Notes

* I'm surprised that a TypeScript string is not automatically escaped when its
  translated to terraform code. I have very mix feelings about this behavior.
  * See https://github.com/hashicorp/terraform-cdk/issues/3420.
* Find pre-built providers at https://www.npmjs.com/search?q=keywords:cdktf and
  add them as, e.g.: `npm install @cdktf/provider-aws`.

# References

* [Environment variables to configure the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html)
* [Token provider configuration with automatic authentication refresh for AWS IAM Identity Center](https://docs.aws.amazon.com/cli/latest/userguide/sso-configure-profile-token.html) (SSO)
* [Managing access keys (console)](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)
* [AWS General Reference](https://docs.aws.amazon.com/general/latest/gr/Welcome.html)
  * [Amazon Resource Names (ARNs)](https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html)
* [Amazon ECR private registry](https://docs.aws.amazon.com/AmazonECR/latest/userguide/Registries.html)
  * [Private registry authentication](https://docs.aws.amazon.com/AmazonECR/latest/userguide/registry_auth.html)
* [CDK for Terraform](https://developer.hashicorp.com/terraform/cdktf).
  * [CDK for Terraform Best Practices](https://developer.hashicorp.com/terraform/cdktf/create-and-deploy/best-practices).
  * [Variables and Outputs](https://developer.hashicorp.com/terraform/cdktf/concepts/variables-and-outputs).
  * [HCL Interoperability](https://developer.hashicorp.com/terraform/cdktf/concepts/hcl-interoperability).
  * [Escape Hatch](https://developer.hashicorp.com/terraform/cdktf/concepts/resources#escape-hatch).
