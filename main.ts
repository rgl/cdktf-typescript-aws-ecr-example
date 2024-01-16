import * as path from 'path';
import {
  Construct,
} from "constructs";
import {
  App,
  DataResource,
  TerraformStack,
  TerraformVariable,
} from "cdktf";
import {
  AwsProvider,
} from "@cdktf/provider-aws/lib/provider";
import {
  Ecr
} from "./.gen/modules/ecr";

function toSnakeCaseIdentifier(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

class EcrExampleStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const regionInput = new TerraformVariable(this, "region", {
      type: "string",
      default: "eu-west-1",
    });

    const projectInput = new TerraformVariable(this, "project", {
      type: "string",
      default: id,
    });

    const environmentInput = new TerraformVariable(this, "environment", {
      type: "string",
      default: "test",
    });

    const region = regionInput.value;
    const project = projectInput.value;
    const environment = environmentInput.value;

    // the tags applied to all the resources.
    const defaultTags = {
      project: project,
      environment: environment,
    };

    // the source images.
    // object value: source image uri.
    // object key: target repository name suffix (this will be prefixed with
    //             project and a forward slash character).
    const sourceImages = {
      "example": "docker.io/ruilopes/example-docker-buildx-go:v1.10.0",
      "hello-etcd": "ghcr.io/rgl/hello-etcd:0.0.1",
    }

    // see https://registry.terraform.io/providers/hashicorp/aws
    // see https://github.com/hashicorp/terraform-provider-aws
    new AwsProvider(this, "aws", {
      region: region,
      defaultTags: [{
        tags: defaultTags,
      }],
    });

    // create the image repositories and images.
    for (const [name, sourceImage] of Object.entries(sourceImages)) {
      // see https://registry.terraform.io/modules/terraform-aws-modules/ecr/aws
      // see https://github.com/terraform-aws-modules/terraform-aws-ecr
      const ecr = new Ecr(this, `ecr_repository_${toSnakeCaseIdentifier(name)}`, {
        repositoryName: `${project}/${name}`,
        repositoryType: "private",
        repositoryForceDelete: true,
        repositoryImageScanOnPush: false,
        createLifecyclePolicy: false,
      });
      // see https://developer.hashicorp.com/terraform/language/resources/terraform-data
      new DataResource(this, `ecr_image_${toSnakeCaseIdentifier(name)}`, {
        triggersReplace: {
          sourceImage: sourceImage,
          targetImage: ecr.repositoryUrlOutput,
          targetRegion: region,
        },
        provisioners: [
          {
            type: "local-exec",
            when: "create",
            environment: {
              ECR_IMAGE_COMMAND: "copy",
              ECR_IMAGE_SOURCE_IMAGE: sourceImage,
              ECR_IMAGE_TARGET_IMAGE: ecr.repositoryUrlOutput,
              ECR_IMAGE_TARGET_REGION: region,
            },
            interpreter: ["bash"],
            command: path.resolve(__dirname, "ecr-image.sh"),
          },
          // NB I'm surprised that a TypeScript string is not automatically
          //    escaped when its translated to terraform code. I have very
          //    mix feelings about this behavior. It feels wrong.
          // TODO review this code after the following issue is addressed.
          //      https://github.com/hashicorp/terraform-cdk/issues/3420
          {
            type: "local-exec",
            when: "destroy",
            environment: {
              ECR_IMAGE_COMMAND: "delete",
              ECR_IMAGE_SOURCE_IMAGE: "${self.triggers_replace.sourceImage}",
              ECR_IMAGE_TARGET_IMAGE: "${self.triggers_replace.targetImage}",
              ECR_IMAGE_TARGET_REGION: "${self.triggers_replace.targetRegion}",
            },
            interpreter: ["bash"],
            command: path.resolve(__dirname, "ecr-image.sh"),
          },
        ],
      });
    }
  }
}

const app = new App();
new EcrExampleStack(app, "cdktf-typescript-aws-ecr-example");
app.synth();
