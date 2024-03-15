const pg = require('pg');
const express = require('express');
const client = new pg.Client(process.env.DATABASE_URL ||
  'postgres://localhost/acme_ice_cream_shop_db');
const app = express();

app.use(require('morgan')('dev'));
app.use(express.json());

//CREATE
app.post('/api/flavor', async(req, res, next) => {
  try{
    const SQL = /* sql */ `
    INSERT INTO flavor(flavor)
    VALUES ($1)
    RETURNING *
    `;
    const response = await client.query(SQL, [req.body.flavor])
    res.send(response.rows[0])
  } catch(error) {
    next(error)
  }
});

//READ

app.get('/api/flavor', async(req, res, next) => {
  try {
    const SQL = `SELECT * from flavor;`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error)
  }
});

//UPDATE
app.put('/api/flavor/:id', async(req, res, next) => {
  try {
    const SQL = /* sql */ `
    UPDATE flavor
    SET flavor = $1, ranking=$2, updated_at=now()
    WHERE id=$3 RETURNING *;
    `;
    const response = await client.query(SQL, [
      req.body.flavor,
      req.body.ranking,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error)
  }
});

//DELETE
app.delete('/api/flavor/:id', async(req, res, next) => {
  try {
    const SQL = /* sql */ `
    DELETE from flavor
    WHERE id = $1
    `;
    const reponse = await client.query(SQL, [req.params.id])
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
});

const init = async() => {
  await client.connect();
  console.log('connected to database');
  let SQL = /* sql */ `
    DROP TABLE IF EXISTS flavor;
    CREATE TABLE flavor(
      id SERIAL PRIMARY KEY,
      createsat TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now(),
      ranking INTEGER DEFAULT 3 NOT NULL,
      flavor VARCHAR(50)
    );
  `
  await client.query(SQL)
  console.log('tables created');

      SQL = /* sql */ `
        INSERT INTO flavor(flavor, ranking) VALUES('Haupia', 1);
        INSERT INTO flavor(flavor, ranking) VALUES('Chocolate Macademia Nut', 3);
        INSERT INTO flavor(flavor, ranking) VALUES('Lemon', 2);
        INSERT INTO flavor(flavor, ranking) VALUES('Lilikoi', 4);
        INSERT INTO flavor(flavor, ranking) VALUES('Ube', 5);
        INSERT INTO flavor(flavor, ranking) VALUES('Mint Chocolate Chip', 6);
        INSERT INTO flavor(flavor, ranking) VALUES('Pistachio', 9);
        INSERT INTO flavor(flavor, ranking) VALUES('Mango', 8);
        INSERT INTO flavor(flavor, ranking) VALUES('Mudslide', 10);
        INSERT INTO flavor(flavor, ranking) VALUES('Cookies N Cream', 7);
        INSERT INTO flavor(flavor, ranking) VALUES('Cherry Garcia', 11);
      `
  await client.query(SQL)
  console.log('Data Seeded')
  const port = process.env.PORT || 3000
  app.listen(port, () => console.log(`Listening on port ${port}`));
};
init();