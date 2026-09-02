resource "aws_instance" "api" {
  ami           = "ami-12345678"
  instance_type = "t2.micro"

  tags = {
    Name = "observabilidade-api"
  }
}
