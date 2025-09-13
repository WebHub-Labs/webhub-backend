resource "aws_subnet" "name" {
  cidr_block = var.subnet_cidr_block[0]
  vpc_id = aws_vpc.this.id
}