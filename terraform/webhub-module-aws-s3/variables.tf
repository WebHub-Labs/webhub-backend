# -------------------------------------------
# Common Variables
# -------------------------------------------

variable "aws_region" {
  description = "AWS infrastructure regio"
  type        = string
  default     = "us-east-1"
}

variable "tags" {
  description = "Tag map for the resource"
  type        = map(string)
  default     = {
    name = "Webhub App Server Instance"
  }
}


# -------------------------------------------
# AWS S3
# -------------------------------------------

variable "s3_bucket_name" {
  description = "s3 bucket names"
  type        = string
  default     = "Webhub"
}

variable "s3_versioning" {
  description = "s3 versioning"
  type        = string
  default     = "Enabled"
}

variable "enable_lifecycle_rule" {
  description = "s3 life cycle"
  type = bool
  default = false
}

variable "acl" {
  description = "s3 bucket names"
  type        = string
  default     = "private"
}