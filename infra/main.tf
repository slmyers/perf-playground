terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "csv-node-perf" {
  bucket = "csv-node-perf"
  acl    = "private"

  versioning {
    enabled = true
  }
}
