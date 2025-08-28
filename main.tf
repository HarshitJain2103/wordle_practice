# Configure the AWS Provider.
provider "aws" {
  region = "ap-south-1"
}

# Define the S3 bucket resource.
resource "aws_s3_bucket" "my_website_bucket" {
  bucket = "wordle-bucket-test-unique"
}

# Define the bucket ownership controls.
resource "aws_s3_bucket_ownership_controls" "ownership_controls" {
  bucket = aws_s3_bucket.my_website_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# Define the bucket public access block.
resource "aws_s3_bucket_public_access_block" "public_access_block" {
  bucket = aws_s3_bucket.my_website_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Define the bucket policy to allow public read access.
resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.my_website_bucket.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect    = "Allow",
        Principal = "*",
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.my_website_bucket.arn}/*"
      }
    ]
  })
  
  # This dependency forces Terraform to wait for the public access block to be fully created
  # before attempting to apply the bucket policy.
  depends_on = [
    aws_s3_bucket_public_access_block.public_access_block
  ]
}

# Define the website configuration for the S3 bucket.
resource "aws_s3_bucket_website_configuration" "website_config" {
  bucket = aws_s3_bucket.my_website_bucket.id
  index_document {
    suffix = "index.html"
  }
}

# Upload files from the local 'dist' directory to the S3 bucket.
resource "aws_s3_object" "site_files" {
  for_each = fileset("${path.module}/dist/", "**")

  bucket = aws_s3_bucket.my_website_bucket.id
  key    = each.value
  source = "${path.module}/dist/${each.value}"

  content_type = lookup({
    ".html" = "text/html",
    ".css"  = "text/css",
    ".js"   = "application/javascript",
    ".json" = "application/json",
    ".svg"  = "image/svg+xml",
    ".png"  = "image/png",
    ".jpg"  = "image/jpeg",
  }, regex("\\.[^.]+$", each.value), "application/octet-stream")
}

# Define an output to easily find the website URL after deployment.
output "website_url" {
  value = aws_s3_bucket_website_configuration.website_config.website_endpoint
}