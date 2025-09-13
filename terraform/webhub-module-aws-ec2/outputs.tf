output "aws_ami_id" {
  value = aws_instance.this.ami
}

output "public_dns_IP_address" {
  value = aws_instance.this.public_dns
  description = "aws instance public dns"
}

output "aws_instance_public_ip" {
  value       = aws_instance.this.public_ip
  description = "aws_instance public_ip"
}

output "aws_ebs_volume_id" {
  value       = aws_ebs_volume.this.id
  description = "aws_ebs_volume volume_id"
}