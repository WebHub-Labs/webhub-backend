resource "vpc" "public" {
  cidr_block = var.vpc_cidr
  enable_dns_support = true
  enable_dns_host_names = true

  tags = merge(
    tomap({ "Name" = "${local.prefix}-vpc"})
  )
}