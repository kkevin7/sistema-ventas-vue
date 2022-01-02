#dokcer cp external
docker cp mongodb-mongo-1:/backups/dump/sistema_ventas ./

#login into database
mongo -u root -p 12345 --authenticationDatabase admin

#show database
show databases

#create backup database
mongodump -u root -p 12345 --authenticationDatabase admin -d sistema_ventas

#restore backup database
mongorestore -u root -p 12345 --authenticationDatabase admin -d sistema_ventas dump/sistema_ventas