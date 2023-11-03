const express = require("express");
const mariadb = require("mariadb");
const moment = require('moment');

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "basededatosmariadb",
  database: "planning",
  connectionLimit: 5,
});

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Bienvenid@ al servidor</h1>");
});

app.get("/tareas", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT * FROM TODO"
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Se rompió el servidor" });
  } finally {
    if (conn) conn.release(); //release to pool
  }
});


app.get("/tareas/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT * FROM TODO WHERE id=?",
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Se rompió el servidor" });
  } finally {
    if (conn) conn.release(); //release to pool
  }
});


app.post("/tareas", async (req, res) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const created_at = moment().format('YYYY-MM-DD HH:mm:ss'); // Formatea la fecha actual
      const response = await conn.query(
        `INSERT INTO TODO(name, description, created_at, updated_at, status) VALUES(?, ?, ?, ?, ?)`,
        [req.body.name, req.body.description, created_at, created_at, req.body.status]
      );
  
      res.json({ id: parseInt(response.insertId), ...req.body });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Se rompió el servidor" });
    } finally {
      if (conn) conn.release(); // Libera la conexión en el pool
    }
  });

app.put("/tareas/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const updated_at = moment().format('YYYY-MM-DD HH:mm:ss'); // Formatea la fecha actual
    const response = await conn.query(
      `UPDATE TODO SET name=?, description=?, updated_at=?, status=? WHERE id=?`,
      [req.body.name, req.body.description, updated_at, req.body.status, req.params.id]
    );

    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Se rompió el servidor" });
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.delete("/tareas/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("DELETE FROM TODO WHERE id=?", [
      req.params.id,
    ]);
    res.json({ message: "Elemento eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Se rompió el servidor" });
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
