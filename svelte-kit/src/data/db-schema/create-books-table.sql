CREATE TABLE IF NOT EXISTS books (
  _id varchar(255) PRIMARY KEY,
  title varchar(4000),
  authors json,
  isbn varchar(100)
)